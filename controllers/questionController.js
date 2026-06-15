import db from '../db.js';
import { getRequestLanguage } from '../utils/languageHelper.js';
import { translateContent } from '../utils/translator.js';

export const getQuestions = (req, res) => {
    const { courseId, moduleId, lessonId } = req.params;
    const lang = getRequestLanguage(req);
    const sql = ` SELECT q.* FROM questions q JOIN lessons l ON l.id = q.lesson_id JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id 
            WHERE c.id = ? AND m.id = ? AND l.id = ? ORDER BY q.order_index `;
    db.all(sql, [courseId, moduleId, lessonId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(translateContent(rows, lang));
    });
};

export const getQuestion = (req, res) => {
    const { courseId, moduleId, lessonId, questionId } = req.params;
    const lang = getRequestLanguage(req);
    const questionSql = ` SELECT q.* FROM questions q JOIN lessons l ON l.id = q.lesson_id JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id WHERE c.id = ? AND m.id = ? AND l.id = ? AND q.id = ? `;
    db.get(questionSql, [courseId, moduleId, lessonId, questionId], (err, question) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        const answersSql = ` SELECT id, question_id, answer_text, is_correct FROM answers WHERE question_id = ? ORDER BY id `;
        db.all(answersSql, [questionId], (err, answers) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            const translatedQuestion = translateContent(question, lang);
            translatedQuestion.answers = translateContent(answers, lang);
            res.json(translatedQuestion);
        });
    });
};