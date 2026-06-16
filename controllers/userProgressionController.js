import db from '../db.js';
import { awardXP } from "./xpController.js"; // Ensure this import is present

/**
 * Helper to wrap db.get in a Promise for single-row queries
 */
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

/**
 * Helper to wrap db.run in a Promise for insert/update operations
 */
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

/**
 * Helper to wrap db.all in a Promise for multi-row queries
 */
const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

/**
 * Initializes progress for a new user by linking all published lessons, modules, and courses.
 * Also sets up the initial streak record.
 */
export const initializeUserProgress = async (userId) => {
    // 1. Get all published lessons ordered by module and lesson index
    const lessons = await dbAll(
        `SELECT l.id
         FROM lessons l
                  JOIN modules m ON m.id = l.module_id
         WHERE l.is_published = 1
         ORDER BY m.order_index, l.order_index`
    );

    for (const lesson of lessons) {
        await dbRun(
            `INSERT INTO user_progress (user_id, lesson_id, status, completed_at, last_opened_at)
             VALUES (?, ?, 'open', NULL, CURRENT_TIMESTAMP)
                 ON CONFLICT(user_id, lesson_id) DO NOTHING`,
            [userId, lesson.id]
        );
    }

    // 2. Initialize module statuses
    const modules = await dbAll(
        `SELECT DISTINCT m.id
         FROM modules m
                  JOIN lessons l ON l.module_id = m.id
         WHERE l.is_published = 1`
    );

    for (const module of modules) {
        await dbRun(
            `INSERT INTO user_module_status (user_id, module_id, status)
             VALUES (?, ?, 'open')
                 ON CONFLICT(user_id, module_id) DO NOTHING`,
            [userId, module.id]
        );
    }

    // 3. Initialize course statuses
    const courses = await dbAll(
        `SELECT DISTINCT c.id
         FROM courses c
                  JOIN modules m ON m.course_id = c.id
                  JOIN lessons l ON l.module_id = m.id
         WHERE c.is_published = 1
           AND l.is_published = 1`
    );

    for (const course of courses) {
        await dbRun(
            `INSERT INTO user_course_status (user_id, course_id, status)
             VALUES (?, ?, 'open')
                 ON CONFLICT(user_id, course_id) DO NOTHING`,
            [userId, course.id]
        );
    }

    // 4. Initialize streaks
    await dbRun(
        `INSERT INTO user_streaks (user_id, current_streak, highest_streak, last_active_date)
         VALUES (?, 0, 0, DATE('now'))
             ON CONFLICT(user_id) DO NOTHING`,
        [userId]
    );

    console.log(`User progress initialized for user ${userId}`);
};

/**
 * GET /api/users/:id/progress
 * Returns a summary of completed lessons, current streak, and rewards.
 */
export const getUserProgress = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await dbGet(`SELECT id FROM users WHERE id = ?`, [id]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const completedLessons = await dbAll(
            `SELECT lesson_id, status, completed_at
             FROM user_progress
             WHERE user_id = ? AND status = 'completed'`,
            [id]
        );

        const streak = await dbGet(
            `SELECT current_streak, highest_streak, last_active_date
             FROM user_streaks
             WHERE user_id = ?`,
            [id]
        );

        // Fetch user's unlocked rewards
        const rewards = await dbAll(
            `SELECT r.title, r.description, ur.unlocked_at
             FROM user_rewards ur
                      JOIN rewards r ON r.id = ur.reward_id
             WHERE ur.user_id = ?`,
            [id]
        );

        res.json({
            success: true,
            data: {
                completed_lessons_count: completedLessons.length,
                completed_lessons: completedLessons,
                streak: streak || { current_streak: 0, highest_streak: 0, last_active_date: null },
                rewards: rewards
            }
        });

    } catch (error) {
        console.error('Get User Progress Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

/**
 * PUT /api/users/:id/progress/lesson/:lessonId
 * Marks a lesson as completed, updates parent statuses, streaks, and awards XP.
 */
export const completeLesson = async (req, res) => {
    const { id, lessonId } = req.params;

    try {
        // 1. Validation: Does the user exist?
        const user = await dbGet(`SELECT id FROM users WHERE id = ?`, [id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // 2. Validation: Does the lesson exist and is it published?
        const lesson = await dbGet(`SELECT id FROM lessons WHERE id = ? AND is_published = 1`, [lessonId]);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found or not published.' });
        }

        // 3. Update progress to 'completed'
        const result = await dbRun(
            `UPDATE user_progress
             SET status = 'completed',
                 completed_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ? AND lesson_id = ?`,
            [id, lessonId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'No progress record found for this combination.' });
        }

        // 4. Update the status of the parent module and course
        const parentStatus = await updateParentStatusesAfterLessonCompletion(id, lessonId);

        // 5. Update the user's streak
        await updateUserStreak(id);

        // 6. Award XP for completion (User Story #25)
        // We award 20 XP for completing an entire lesson here
        let xpResult = null;
        try {
            xpResult = await awardXP(id, 'lesson_completion', lessonId, 20);
        } catch (xpError) {
            console.error('Error awarding XP during lesson completion:', xpError);
            // We do not let the request fail if only the XP award fails
        }

        // 7. Send successful response including XP data for the frontend
        res.json({
            success: true,
            message: 'Lesson successfully marked as completed',
            data: {
                lessonCompleted: true,
                moduleCompleted: parentStatus.moduleCompleted,
                courseCompleted: parentStatus.courseCompleted,
                xpAwarded: xpResult?.success ? xpResult.xpAdded : 0,
                totalXP: xpResult?.success ? xpResult.totalXP : null,
                level: xpResult?.success ? xpResult.level : null,
                levelUp: xpResult?.levelUp || false,
                unlockedRewards: xpResult?.unlockedRewards || [] // Include unlocked rewards
            }
        });

    } catch (error) {
        console.error('Complete Lesson Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error when completing the lesson.'
        });
    }
};

/**
 * Internal logic to update module and course completion status.
 */
const updateParentStatusesAfterLessonCompletion = async (userId, lessonId) => {
    const lesson = await dbGet(
        `SELECT l.module_id, m.course_id
         FROM lessons l
                  JOIN modules m ON m.id = l.module_id
         WHERE l.id = ?`,
        [lessonId]
    );

    if (!lesson) return { moduleCompleted: false, courseCompleted: false };

    // Check module completion
    const moduleProgress = await dbGet(
        `SELECT COUNT(*) AS total_lessons,
                SUM(CASE WHEN up.status = 'completed' THEN 1 ELSE 0 END) AS completed_lessons
         FROM lessons l
                  LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = ?
         WHERE l.module_id = ? AND l.is_published = 1`,
        [userId, lesson.module_id]
    );

    const moduleCompleted = moduleProgress.total_lessons > 0 &&
        moduleProgress.total_lessons === moduleProgress.completed_lessons;

    if (moduleCompleted) {
        await dbRun(
            `INSERT INTO user_module_status (user_id, module_id, status, created_at, updated_at)
             VALUES (?, ?, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 ON CONFLICT(module_id, user_id) DO UPDATE SET status = 'completed', updated_at = CURRENT_TIMESTAMP`,
            [userId, lesson.module_id]
        );
    }

    // Check course completion
    const courseProgress = await dbGet(
        `SELECT COUNT(*) AS total_modules,
                SUM(CASE WHEN ums.status = 'completed' THEN 1 ELSE 0 END) AS completed_modules
         FROM modules m
                  LEFT JOIN user_module_status ums ON ums.module_id = m.id AND ums.user_id = ?
         WHERE m.course_id = ?`,
        [userId, lesson.course_id]
    );

    const courseCompleted = courseProgress.total_modules > 0 &&
        courseProgress.total_modules === courseProgress.completed_modules;

    if (courseCompleted) {
        await dbRun(
            `INSERT INTO user_course_status (user_id, course_id, status, created_at, updated_at)
             VALUES (?, ?, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 ON CONFLICT(course_id, user_id) DO UPDATE SET status = 'completed', updated_at = CURRENT_TIMESTAMP`,
            [userId, lesson.course_id]
        );
    }

    return { moduleCompleted, courseCompleted };
};

/**
 * PUT /api/users/:id/progress/lesson/:lessonId/open
 * Updates the last opened timestamp for a lesson.
 */
export const openLesson = async (req, res) => {
    const { id, lessonId } = req.params;

    try {
        const result = await dbRun(
            `UPDATE user_progress
             SET last_opened_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ? AND lesson_id = ?`,
            [id, lessonId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Progress entry not found.' });
        }

        res.json({ success: true, message: 'Lesson opened timestamp updated' });

    } catch (error) {
        console.error('Open Lesson Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Updates the user's daily activity streak.
 */
const updateUserStreak = async (userId) => {
    const streak = await dbGet(
        `SELECT current_streak, highest_streak, last_active_date
         FROM user_streaks
         WHERE user_id = ?`,
        [userId]
    );

    if (!streak) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = streak.last_active_date;

    if (lastActive === today) return;

    let newCurrentStreak = streak.current_streak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
        newCurrentStreak += 1;
    } else {
        newCurrentStreak = 1;
    }

    const newHighestStreak = Math.max(newCurrentStreak, streak.highest_streak);

    await dbRun(
        `UPDATE user_streaks
         SET current_streak = ?,
             highest_streak = ?,
             last_active_date = ?
         WHERE user_id = ?`,
        [newCurrentStreak, newHighestStreak, today, userId]
    );
};
// GET user streaks
export const getUserStreaks = async (req, res) => {
    const { userId } = req.params;

    try {
        const streak = await dbGet(
            `SELECT current_streak, highest_streak, last_active_date
             FROM user_streaks
             WHERE user_id = ?`,
            [userId]
        );

        if (!streak) {
            return res.status(404).json({
                success: false,
                message: 'No streak found for this user.'
            });
        }

        res.json({
            success: true,
            data: streak
        });

    } catch (error) {
        console.error('Get User Streak Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};
