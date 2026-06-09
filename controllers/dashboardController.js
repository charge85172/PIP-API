import db from '../db.js';

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
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

export const getUserDashboard = async (req, res) => {
    const { userId } = req.params;

    try {
        const dashboard = await dbGet(
        `SELECT users.id, users.name, users.digital_skill_level, users.experience, users.on_boarding, levels.level_number,
            COALESCE(user_streaks.current_streak, 0) AS current_streak,
            COALESCE(user_streaks.highest_streak, 0) AS highest_streak
             FROM users LEFT JOIN levels ON levels.id = users.current_level_id
             LEFT JOIN user_streaks ON user_streaks.user_id = users.id
             WHERE users.id = ?`,[userId]
        );

        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const moduleProgress = await dbAll(
        `SELECT m.id AS module_id, m.title AS module_title, c.id AS course_id, c.title AS course_title,
            COUNT(l.id) AS total_lessons, SUM(CASE WHEN up.status = 'completed' THEN 1 ELSE 0 END) AS completed_lessons
             FROM modules m JOIN courses c ON c.id = m.course_id
             JOIN lessons l ON l.module_id = m.id LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = ?
             WHERE l.is_published = 1 GROUP BY m.id ORDER BY c.order_index, m.order_index`,[userId]
        );

        const completedLessons = await dbAll(
            `SELECT la.lesson_id, l.title AS lesson_title, m.id AS module_id, m.title AS module_title, c.id AS course_id, c.title AS course_title, 
                MAX(la.score) AS best_score
             FROM lesson_attempts la JOIN lessons l ON l.id = la.lesson_id JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id
             WHERE la.user_id = ? AND la.completed_at IS NOT NULL GROUP BY la.lesson_id ORDER BY la.lesson_id`, [userId]
        );

        res.json({
            success: true,
            data: {
                user: dashboard,

                moduleProgress: moduleProgress.map(module => ({
                    moduleId: module.module_id,
                    moduleTitle: module.module_title,
                    courseId: module.course_id,
                    courseTitle: module.course_title,
                    totalLessons: module.total_lessons,
                    completedLessons: module.completed_lessons || 0,
                    progressPercentage: module.total_lessons === 0 ? 0 : Math.round(((module.completed_lessons || 0) / module.total_lessons) * 100)
                })),

                completedLessons: completedLessons.map(lesson => ({
                    lessonId: lesson.lesson_id,
                    lessonTitle: lesson.lesson_title,
                    moduleId: lesson.module_id,
                    moduleTitle: lesson.module_title,
                    courseId: lesson.course_id,
                    courseTitle: lesson.course_title,
                    bestScorePercentage: lesson.best_score || 0
                }))
            }
        });

    } catch (error) {
        console.error('Get User Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};