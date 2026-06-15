import db from '../db.js';
import { getRequestLanguage } from '../utils/languageHelper.js';
import { translateContent } from '../utils/translator.js';

export const getCourses = (req, res) => {
    const lang = getRequestLanguage(req);
    try {
        db.all('SELECT * FROM courses ORDER BY order_index', [], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            const translatedRows = translateContent(rows, lang);
            res.json(translatedRows);
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getCourse = (req, res) => {
    try {
        const { courseId } = req.params;
        const lang = getRequestLanguage(req);
        const sql = ` SELECT * FROM courses WHERE id = ? `;
        db.get(sql, [courseId], (err, course) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            res.json(translateContent(course, lang));
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};