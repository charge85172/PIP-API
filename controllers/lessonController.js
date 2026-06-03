import db from '../db.js';

export const getLessons = (req, res) => { const sql = ` SELECT l.*, m.title AS module_title, c.title AS course_title FROM lessons l 
     JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id ORDER BY c.order_index, m.order_index, l.order_index `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
};

export const getLesson = (req, res) => {
    const { lessonId } = req.params;
    const sql = ` SELECT l.*, m.title AS module_title, c.title AS course_title FROM lessons l JOIN modules m ON m.id = l.module_id 
     JOIN courses c ON c.id = m.course_id WHERE l.id = ? `;

    db.get(sql, [lessonId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        res.json(row);
    });
};