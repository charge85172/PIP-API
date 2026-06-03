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

    const checkSql = ` SELECT is_correct FROM answers WHERE id = ? AND question_id = ? `;

    db.get(checkSql, [answerId, questionId], (err, answer) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!answer) {
            return res.status(404).json({
                error: 'Answer not found for this question'
            });
        }

        const insertSql = ` INSERT INTO lesson_attempt_answers (lesson_attempt_id, question_id, answer_id, is_correct, answered_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) `;

        db.run(
            insertSql,
            [attemptId, questionId, answerId, answer.is_correct],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ attemptAnswerId: this.lastID, attemptId: Number(attemptId), questionId, answerId, isCorrect: Boolean(answer.is_correct)});
            }
        );
    });
};

export const completeLessonAttempt = (req, res) => {
    const { attemptId } = req.params;
    const scoreSql = ` SELECT  COUNT(*) AS total_questions, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers FROM lesson_attempt_answers WHERE lesson_attempt_id = ? `;

    db.get(scoreSql, [attemptId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const totalQuestions = result.total_questions || 0;
        const correctAnswers = result.correct_answers || 0;
        const score = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);

        //If score >= 60 you pass. Every question is worth 20 points.
        const passed = score >= 60 ? 1 : 0;
        const updateSql = ` UPDATE lesson_attempts SET  score = ?, total_questions = ?, passed = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ? `;

        db.run(updateSql, [score, totalQuestions, passed, attemptId], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ attemptId: Number(attemptId), score, totalQuestions, correctAnswers, passed: Boolean(passed) });
        });
    });
};