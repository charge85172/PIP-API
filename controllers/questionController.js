import db from '../db.js';

export const getQuestions = (req, res) => {
    const { courseId, moduleId, lessonId } = req.params;

    const sql = ` SELECT q.* FROM questions q JOIN lessons l ON l.id = q.lesson_id JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id 
            WHERE c.id = ? AND m.id = ? AND l.id = ? ORDER BY q.order_index `;

    db.all(sql, [courseId, moduleId, lessonId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
};