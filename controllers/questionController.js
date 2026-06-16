import db from '../db.js';
import { getRequestLanguage } from '../utils/languageHelper.js';
import { translateContent } from '../utils/translator.js';

export const getQuestions = (req, res) => {
    const { lessonId } = req.params;
    const lang = getRequestLanguage(req);
    const sql = lessonId
        ? 'SELECT * FROM questions WHERE lesson_id = ? ORDER BY order_index'
        : 'SELECT * FROM questions ORDER BY order_index';
    const params = lessonId ? [lessonId] : [];

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(translateContent(rows, lang));
    });
};

export const getQuestion = (req, res) => {
    const { questionId } = req.params;
    const lang = getRequestLanguage(req);

    const sql = 'SELECT * FROM questions WHERE id = ?';
    db.get(sql, [questionId], (err, question) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!question) return res.status(404).json({ error: 'Question not found' });

        const answersSql = `SELECT id, question_id, answer_text, is_correct 
                            FROM answers WHERE question_id = ? ORDER BY id`;
        db.all(answersSql, [questionId], (err, answers) => {
            if (err) return res.status(500).json({ error: err.message });

            const translatedQuestion = translateContent(question, lang);
            translatedQuestion.answers = translateContent(answers, lang);
            res.json(translatedQuestion);
        });
    });
};

export const createQuestion = (req, res) => {
    const { lesson_id, question_text, question_type, explanation, image_url, order_index } = req.body;
    const sql = 'INSERT INTO questions (lesson_id, question_text, question_type, explanation, image_url, order_index) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(sql, [lesson_id, question_text, question_type, explanation, image_url, order_index], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            success: true,
            questionId: this.lastID,
            message: 'Question created successfully'
        });
    });
};

export const updateQuestion = (req, res) => {
    const { questionId } = req.params;
    const { lesson_id, question_text, question_type, explanation, image_url, order_index } = req.body;
    const sql = 'UPDATE questions SET lesson_id = ?, question_text = ?, question_type = ?, explanation = ?, image_url = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(sql, [lesson_id, question_text, question_type, explanation, image_url, order_index, questionId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json({ success: true, message: 'Question updated successfully' });
    });
};

export const deleteQuestion = (req, res) => {
    const { questionId } = req.params;
    const sql = 'DELETE FROM questions WHERE id = ?';
    db.run(sql, [questionId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json({ success: true, message: 'Question deleted successfully' });
    });
};