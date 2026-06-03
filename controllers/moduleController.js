import db from '../db.js';

export const getModules = (req, res) => {
    const { courseId } = req.params;

    const sql = ` SELECT m.*, c.title AS course_name FROM modules m JOIN courses c ON c.id = m.course_id WHERE c.id = ? ORDER BY m.order_index `;

    db.all(sql, [courseId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
};

export const getModule = (req, res) => {
    const { courseId, moduleId } = req.params;

    const sql = ` SELECT m.*, c.title AS course_name FROM modules m JOIN courses c ON c.id = m.course_id WHERE m.id = ? AND c.id = ? `;

    db.get(sql, [moduleId, courseId], (err, module) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (!module) {
            return res.status(404).json({
                error: 'Module not found in this course'
            });
        }

        db.all(` SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index `,
            [moduleId],
            (err, lessons) => {
                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                module.lessons = lessons;

                res.json(module);
            }
        );
    });
};