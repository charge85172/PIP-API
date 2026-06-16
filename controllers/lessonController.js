import db from '../db.js';
import { getRequestLanguage } from '../utils/languageHelper.js';
import { translateContent } from '../utils/translator.js';

export const getLessons = (req, res) => {
    const { moduleId } = req.params;
    const lang = getRequestLanguage(req);
    let sql = 'SELECT l.*, m.title AS module_title, c.title AS course_title FROM lessons l JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id';
    const params = [];

    if (moduleId) {
        sql += ' WHERE l.module_id = ?';
        params.push(moduleId);
    }
    sql += ' ORDER BY c.order_index, m.order_index, l.order_index';

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(translateContent(rows, lang));
    });
};

export const getLesson = (req, res) => {
    const { lessonId } = req.params;
    const lang = getRequestLanguage(req);
    const sql = 'SELECT l.*, m.title AS module_title, c.title AS course_title FROM lessons l JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id WHERE l.id = ?';
    db.get(sql, [lessonId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        res.json(translateContent(row, lang));
    });
};

export const createLesson = (req, res) => {
    const { module_id, title, description, tip, image_url, estimated_minutes, order_index, is_published } = req.body;
    const sql = 'INSERT INTO lessons (module_id, title, description, tip, image_url, estimated_minutes, order_index, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [module_id, title, description, tip, image_url, estimated_minutes, order_index, is_published || 0], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            success: true,
            lessonId: this.lastID,
            message: 'Lesson created successfully'
        });
    });
};

export const updateLesson = (req, res) => {
    const { lessonId } = req.params;
    const { module_id, title, description, tip, image_url, estimated_minutes, order_index, is_published } = req.body;
    const sql = 'UPDATE lessons SET module_id = ?, title = ?, description = ?, tip = ?, image_url = ?, estimated_minutes = ?, order_index = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(sql, [module_id, title, description, tip, image_url, estimated_minutes, order_index, is_published, lessonId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        res.json({ success: true, message: 'Lesson updated successfully' });
    });
};

export const deleteLesson = (req, res) => {
    const { lessonId } = req.params;
    const sql = 'DELETE FROM lessons WHERE id = ?';
    db.run(sql, [lessonId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        res.json({ success: true, message: 'Lesson deleted successfully' });
    });
};