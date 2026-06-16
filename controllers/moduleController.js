import db from '../db.js';
import { getRequestLanguage } from '../utils/languageHelper.js';
import { translateContent } from '../utils/translator.js';

export const getModules = (req, res) => {
    const { courseId } = req.params;
    const lang = getRequestLanguage(req);
    const sql = courseId
        ? 'SELECT * FROM modules WHERE course_id = ? ORDER BY order_index'
        : 'SELECT * FROM modules ORDER BY order_index';
    const params = courseId ? [courseId] : [];

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(translateContent(rows, lang));
    });
};

export const getModule = (req, res) => {
    const { moduleId } = req.params;
    const lang = getRequestLanguage(req);
    const sql = 'SELECT * FROM modules WHERE id = ?';
    db.get(sql, [moduleId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.json(translateContent(row, lang));
    });
};

export const createModule = (req, res) => {
    const { course_id, title, description, order_index } = req.body;
    const sql = 'INSERT INTO modules (course_id, title, description, order_index) VALUES (?, ?, ?, ?)';
    db.run(sql, [course_id, title, description, order_index], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            success: true,
            moduleId: this.lastID,
            message: 'Module created successfully'
        });
    });
};

export const updateModule = (req, res) => {
    const { moduleId } = req.params;
    const { course_id, title, description, order_index } = req.body;
    const sql = 'UPDATE modules SET course_id = ?, title = ?, description = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(sql, [course_id, title, description, order_index, moduleId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.json({ success: true, message: 'Module updated successfully' });
    });
};

export const deleteModule = (req, res) => {
    const { moduleId } = req.params;
    const sql = 'DELETE FROM modules WHERE id = ?';
    db.run(sql, [moduleId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.json({ success: true, message: 'Module deleted successfully' });
    });
};