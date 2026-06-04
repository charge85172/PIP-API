// database promises
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// new progress new user
export const initializeUserProgress = async (userId) => {
    // get all lessons
    const lessons = await dbAll(
        `SELECT l.id 
         FROM lessons l
         JOIN modules m ON m.id = l.module_id
         WHERE l.is_published = 1
         ORDER BY m.order_index, l.order_index`
    );

    // user_progress entries
    for (const lesson of lessons) {
        await dbRun(
            `INSERT INTO user_progress (user_id, lesson_id, completed, completed_at, last_opened_at)
             VALUES (?, ?, 0, NULL, CURRENT_TIMESTAMP)`,
            [userId, lesson.id]
        );
    }

    // user_streaks entry
    await dbRun(
        `INSERT INTO user_streaks (user_id, current_streak, highest_streak, last_active_date)
         VALUES (?, 0, 0, DATE('now'))`,
        [userId]
    );

    console.log(`User progress initialized for user ${userId}, ${lessons.length} lessons added`);
};

// GET /api/users/:id/progress
export const getUserProgress = async (req, res) => {
    const { id } = req.params;

    try {
        // check if user exists
        const user = await dbGet(`SELECT id FROM users WHERE id = ?`, [id]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // get all completed lessons
        const completedLessons = await dbAll(
            `SELECT lesson_id, completed, completed_at
             FROM user_progress
             WHERE user_id = ? AND completed = 1`,
            [id]
        );

        // get streak info
        const streak = await dbGet(
            `SELECT current_streak, highest_streak, last_active_date
             FROM user_streaks
             WHERE user_id = ?`,
            [id]
        );

        // get rewards
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
            success: false, message: 'Internal server error.'
        });
    }
};

//PUT /api/users/:id/progress/lesson/:lessonId
export const completeLesson = async (req, res) => {
    const { id, lessonId } = req.params;

    try {
        // check if user exists
        const user = await dbGet(`SELECT id FROM users WHERE id = ?`, [id]);
        if (!user) {
            return res.status(404).json({
                success: false, message: 'User not found.'
            });
        }

        // check if lesson exists
        const lesson = await dbGet(`SELECT id FROM lessons WHERE id = ? AND is_published = 1`, [lessonId]);
        if (!lesson) {
            return res.status(404).json({
                success: false, message: 'Lesson not found.'
            });
        }

        // update progress
        const result = await dbRun(
            `UPDATE user_progress 
             SET completed = 1, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ? AND lesson_id = ?`,
            [id, lessonId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false, message: 'Progress entry not found.'
            });
        }

        // update streak
        await updateUserStreak(id);

        res.json({
            success: true, message: 'Lesson marked as completed'
        });

    } catch (error) {
        console.error('Complete Lesson Error:', error);
        res.status(500).json({
            success: false, message: 'Internal server error.'
        });
    }
};

export const openLesson = async (req, res) => {
    const { id, lessonId } = req.params;

    try {
        const result = await dbRun(
            `UPDATE user_progress 
             SET last_opened_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ? AND lesson_id = ?`,
            [id, lessonId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false, message: 'Progress entry not found.'
            });
        }

        res.json({
            success: true, message: 'Lesson opened timestamp updated'
        });

    } catch (error) {
        console.error('Open Lesson Error:', error);
        res.status(500).json({
            success: false, message: 'Internal server error.'
        });
    }
};

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

    let newCurrentStreak = streak.current_streak;

    if (lastActive === today) {
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
        // Consecutive day, increase streak
        newCurrentStreak = streak.current_streak + 1;
    } else {
        // Gap in days, reset streak
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