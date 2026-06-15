import db from '../db.js';
import { getRequestLanguage } from '../utils/languageHelper.js';
import { translateContent } from '../utils/translator.js';

export const getModules = (req, res) => {
    const { courseId } = req.params;
    const lang = getRequestLanguage(req);

    const sql = `
        SELECT m.*, c.title AS course_name 
        FROM modules m 
        JOIN courses c ON c.id = m.course_id 
        WHERE c.id = ? 
        ORDER BY m.order_index
    `;

    db.all(sql, [courseId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const translatedRows = translateContent(rows, lang);
        res.json(translatedRows);
    });
};

export const getModule = (req, res) => {
    const { courseId, moduleId } = req.params;
    const lang = getRequestLanguage(req);

    const sql = `
        SELECT m.*, c.title AS course_name 
        FROM modules m 
        JOIN courses c ON c.id = m.course_id 
        WHERE m.id = ? AND c.id = ?
    `;

    db.get(sql, [moduleId, courseId], (err, module) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!module) {
            return res.status(404).json({ error: 'Module not found' });
        }

        db.all(`SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index`, [moduleId], (err, lessons) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const translatedModule = translateContent(module, lang);
            translatedModule.lessons = translateContent(lessons, lang);

            res.json(translatedModule);
        });
    });
};