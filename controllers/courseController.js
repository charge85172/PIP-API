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

export const createCourse = (req, res) => {
    const { title, description, difficulty_level, is_published, order_index } = req.body;
    const sql = `INSERT INTO courses (title, description, difficulty_level, is_published, order_index) VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [title, description, difficulty_level, is_published || 0, order_index], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            success: true,
            courseId: this.lastID,
            message: 'Course created successfully'
        });
    });
};

export const updateCourse = (req, res) => {
    const { courseId } = req.params;
    const { title, description, difficulty_level, is_published, order_index } = req.body;

    const sql = `
        UPDATE courses 
        SET title = ?, description = ?, difficulty_level = ?, is_published = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `;

    db.run(sql, [title, description, difficulty_level, is_published, order_index, courseId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ success: true, message: 'Course updated successfully' });
    });
};

export const deleteCourse = (req, res) => {
    const { courseId } = req.params;
    const sql = `DELETE FROM courses WHERE id = ?`;

    db.run(sql, [courseId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ success: true, message: 'Course deleted successfully' });
    });
};