import db from '../db.js';

export const startLessonAttempt = (req, res) => {
    const { lessonId } = req.params;
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    const sql = ` INSERT INTO lesson_attempts  (user_id, lesson_id, started_at, created_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) `;

    db.run(sql, [userId, lessonId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ attemptId: this.lastID, userId, lessonId: Number(lessonId), message: 'Lesson attempt started' });
    });
};

export const submitAttemptAnswer = (req, res) => {
    const { attemptId } = req.params;
    const { questionId, answerId } = req.body;

    if (!questionId || !answerId) {
        return res.status(400).json({
            error: 'questionId and answerId are required'
        });
    }

    const alreadyAnsweredSql = ` SELECT id FROM lesson_attempt_answers WHERE lesson_attempt_id = ? AND question_id = ? `;

    db.get(alreadyAnsweredSql, [attemptId, questionId], (err, existingAnswer) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (existingAnswer) {
            return res.status(409).json({
                error: 'This question has already been answered for this attempt'
            });
        }

        const checkSql = ` SELECT answers.is_correct, questions.tip AS questionTip FROM answers JOIN questions ON questions.id = answers.question_id 
                                 WHERE answers.id = ? AND answers.question_id = ? `;

        db.get(checkSql, [answerId, questionId], (err, answer) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!answer) {
                return res.status(404).json({
                    error: 'Answer not found for this question'
                });
            }

            const insertSql = ` INSERT INTO lesson_attempt_answers  (lesson_attempt_id, question_id, answer_id, is_correct, answered_at)  
                                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) `;

            db.run(
                insertSql,
                [attemptId, questionId, answerId, answer.is_correct],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.status(201).json({ attemptAnswerId: this.lastID, attemptId: Number(attemptId), questionId, answerId,
                        isCorrect: Boolean(answer.is_correct), questionTip: answer.questionTip });
                }
            );
        });
    });
};

export const completeLessonAttempt = (req, res) => {
    const { attemptId } = req.params;

    const scoreSql = ` SELECT COUNT(*) AS total_questions, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers FROM lesson_attempt_answers 
                            WHERE lesson_attempt_id = ? `;

    db.get(scoreSql, [attemptId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const totalQuestions = result.total_questions || 0;
        const correctAnswers = result.correct_answers || 0;
        const score = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);
        const passed = score >= 60 ? 1 : 0;

        const updateSql = ` UPDATE lesson_attempts SET score = ?, total_questions = ?, passed = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ? `;

        db.run(updateSql, [score, totalQuestions, passed, attemptId], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const tipSql = ` SELECT lessons.tip AS lessonTip FROM lesson_attempts JOIN lessons ON lessons.id = lesson_attempts.lesson_id 
                                 WHERE lesson_attempts.id = ? `;

            db.get(tipSql, [attemptId], (err, lesson) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ attemptId: Number(attemptId), score, totalQuestions, correctAnswers, passed: Boolean(passed), lessonTip: lesson?.lessonTip || null});
            });
        });
    });
};

export const getLessonAttempts = (req, res) => {
    const {lessonId} = req.params;
    const {userId} = req.query;

    let sql = ` SELECT id, user_id, lesson_id, score, total_questions, passed, started_at, completed_at, created_at FROM lesson_attempts WHERE lesson_id = ? `;

    const params = [lessonId];
    if (userId) {
        sql += ` AND user_id = ?`;
        params.push(userId);
    }
    sql += ` ORDER BY score DESC, created_at DESC`;

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        res.json(rows.map(row => ({
            ...row,
            passed: Boolean(row.passed)
        })));
    });
};
