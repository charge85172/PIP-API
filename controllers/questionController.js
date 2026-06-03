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

        // empty array if there are no questions
        if (rows.length === 0) {
            return res.json([]);
        }

        // for each question, fetch the answers
        let completed = 0;
        const questions = rows;

        questions.forEach((question, index) => {
            const answersSql = ` SELECT id, question_id, answer_text, is_correct, order_index 
                                 FROM answers 
                                 WHERE question_id = ? 
                                 ORDER BY order_index `;

            db.all(answersSql, [question.id], (err, answers) => {
                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                questions[index].answers = answers || [];
                completed++;

                if (completed === questions.length) {
                    res.json(questions);
                }
            });
        });
    });
};

export const getQuestion = (req, res) => {
    const { courseId, moduleId, lessonId, questionId } = req.params;

    const questionSql = ` SELECT q.* FROM questions q JOIN lessons l ON l.id = q.lesson_id JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id WHERE c.id = ? AND m.id = ? AND l.id = ? AND q.id = ? `;

    db.get(
        questionSql,
        [courseId, moduleId, lessonId, questionId],
        (err, question) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!question) {
                return res.status(404).json({
                    error: 'Question not found in this lesson/module/course'
                });
            }

            const answersSql = ` SELECT id, question_id, answer_text, is_correct FROM answers WHERE question_id = ? ORDER BY id `;

            db.all(answersSql, [questionId], (err, answers) => {
                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                question.answers = answers;
                res.json(question);
            });
        }
    );
};