import db from '../db.js';
import { awardXP } from "./xpController.js";

/**
 * Helper om db.get in een Promise te wikkelen voor single-row queries
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
 * Helper om db.run in een Promise te wikkelen voor insert/update operaties
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
 * Helper om db.all in een Promise te wikkelen voor multi-row queries
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
 * Initialiseert voortgang voor een nieuwe gebruiker.
 */
export const initializeUserProgress = async (userId) => {
    try {
        // 1. Alle gepubliceerde lessen ophalen
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

        // 2. Initialiseer cursussen
        const courses = await dbAll(
            `SELECT DISTINCT c.id
             FROM courses c
             JOIN modules m ON m.course_id = c.id
             JOIN lessons l ON l.module_id = m.id
             WHERE c.is_published = 1 AND l.is_published = 1`
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
         VALUES (?, 0, 0, NULL)
             ON CONFLICT(user_id) DO NOTHING`,
            [userId]
        );

        console.log(`User progress initialized for user ${userId}`);
    } catch (error) {
        console.error('Initialization Error:', error);
    }
};

/**
 * GET /api/users/:id/progress
 */
export const getUserProgress = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await dbGet(`SELECT id FROM users WHERE id = ?`, [id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
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
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * PUT /api/users/:id/progress/lesson/:lessonId
 */
export const completeLesson = async (req, res) => {
    const { id, lessonId } = req.params;

    try {
        const user = await dbGet(`SELECT id FROM users WHERE id = ?`, [id]);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const lesson = await dbGet(`SELECT id FROM lessons WHERE id = ? AND is_published = 1`, [lessonId]);
        if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });

        const result = await dbRun(
            `UPDATE user_progress
             SET status = 'completed',
                 completed_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ? AND lesson_id = ?`,
            [id, lessonId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'No progress record found.' });
        }

        const parentStatus = await updateParentStatusesAfterLessonCompletion(id, lessonId);
        await updateUserStreak(id);

        let xpResult = null;
        try {
            xpResult = await awardXP(id, 'lesson_completion', lessonId, 20);
        } catch (xpError) {
            console.error('Error awarding XP:', xpError);
        }

        res.json({
            success: true,
            message: 'Lesson successfully marked as completed',
            data: {
                lessonCompleted: true,
                moduleCompleted: parentStatus.moduleCompleted,
                courseCompleted: parentStatus.courseCompleted,
                xpAwarded: xpResult?.success ? xpResult.xpAdded : 0,
                totalXP: xpResult?.success ? xpResult.totalXP : null,
                levelUp: xpResult?.levelUp || false,
                unlockedRewards: xpResult?.unlockedRewards || []
            }
        });
    } catch (error) {
        console.error('Complete Lesson Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Interne logica voor Module/Cursus status
 */
const updateParentStatusesAfterLessonCompletion = async (userId, lessonId) => {
    try {
        const lesson = await dbGet(
            `SELECT l.module_id, m.course_id
             FROM lessons l
             JOIN modules m ON m.id = l.module_id
             WHERE l.id = ?`,
            [lessonId]
        );

        if (!lesson) return { moduleCompleted: false, courseCompleted: false };

        // VOEG HIER JE LOGICA TOE VOOR MODULE/COURSE COMPLETION ALS DE TABELLEN BESTAAN
        return { moduleCompleted: false, courseCompleted: false };
    } catch (error) {
        console.error('Update Parent Status Error:', error);
        return { moduleCompleted: false, courseCompleted: false };
    }
};

/**
 * PUT /api/users/:id/progress/lesson/:lessonId/open
 */
export const openLesson = async (req, res) => {
    const { id, lessonId } = req.params;
    try {
        const result = await dbRun(
            `UPDATE user_progress
             SET last_opened_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ? AND lesson_id = ?`,
            [id, lessonId]
        );
        if (result.changes === 0) return res.status(404).json({ success: false, message: 'Entry not found.' });
        res.json({ success: true, message: 'Timestamp updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Streak logica
 */
export const updateUserStreak = async (userId) => {
    const streak = await dbGet(
        `SELECT current_streak, highest_streak, last_active_date
         FROM user_streaks
         WHERE user_id = ?`,
        [userId]
    );

    if (!streak) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = streak.last_active_date;

    // Gebruiker heeft vandaag al activiteit gehad
    if (lastActive === today) return;

    let newCurrentStreak;

    // Eerste activiteit ooit
    if (!lastActive) {
        newCurrentStreak = 1;
    } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActive === yesterdayStr) {
            // Streak loopt door
            newCurrentStreak = streak.current_streak + 1;
        } else {
            // Streak verbroken
            newCurrentStreak = 1;
        }
    }

    const newHighestStreak = Math.max(
        newCurrentStreak,
        streak.highest_streak
    );

    await dbRun(
        `UPDATE user_streaks
         SET current_streak = ?, highest_streak = ?, last_active_date = ?
         WHERE user_id = ?`,
        [newCurrentStreak, newHighestStreak, today, userId]
    );
};

/**
 * GET /api/progress/streaks/:userId
 */
export const getUserStreaks = async (req, res) => {
    const { userId } = req.params;
    try {
        const streak = await dbGet(`SELECT * FROM user_streaks WHERE user_id = ?`, [userId]);
        if (!streak) return res.status(404).json({ success: false, message: 'No streak found.' });
        res.json({ success: true, data: streak });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};