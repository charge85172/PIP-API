import db from '../db.js';
import { getRequestLanguage } from '../utils/languageHelper.js';
import { translateContent } from '../utils/translator.js';

const updateUserProgressAfterCompletedLesson = (userId, lessonId, callback) => {
    const contextSql = `
        SELECT l.id as lesson_id, m.course_id
        FROM lessons l
                 JOIN modules m ON l.module_id = m.id
        WHERE l.id = ?
    `;

    db.get(contextSql, [lessonId], (err, context) => {
        if (err || !context) return callback(err || new Error('Context not found'));

        const progressSql = `
            INSERT INTO user_progress (user_id, lesson_id, status, completed, completed_at, updated_at)
            VALUES (?, ?, 'completed', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, lesson_id) DO UPDATE SET
                status = 'completed',
                                                       completed = 1,
                                                       completed_at = COALESCE(user_progress.completed_at, CURRENT_TIMESTAMP),
                                                       updated_at = CURRENT_TIMESTAMP
        `;

        db.run(progressSql, [userId, lessonId], function(err) {
            if (err) return callback(err);

            const courseCheckSql = `
                SELECT
                    (SELECT COUNT(*) FROM lessons l2 JOIN modules m2 ON l2.module_id = m2.id WHERE m2.course_id = ?) as total_lessons,
                    (SELECT COUNT(*) FROM user_progress up JOIN lessons l3 ON up.lesson_id = l3.id JOIN modules m3 ON l3.module_id = m3.id
                     WHERE m3.course_id = ? AND up.user_id = ? AND up.completed = 1) as completed_lessons
            `;

            db.get(courseCheckSql, [context.course_id, context.course_id, userId], (err, row) => {
                if (err) return callback(err);

                const courseCompleted = row.total_lessons > 0 && row.total_lessons === row.completed_lessons;

                if (courseCompleted) {
                    const courseStatusSql = `
                        INSERT INTO user_course_status (user_id, course_id, status)
                        VALUES (?, ?, 'completed')
                            ON CONFLICT(user_id, course_id) DO UPDATE SET status = 'completed'
                    `;
                    db.run(courseStatusSql, [userId, context.course_id], (err) => {
                        callback(err, { lessonCompleted: true, courseCompleted: true });
                    });
                } else {
                    callback(null, { lessonCompleted: true, courseCompleted: false });
                }
            });
        });
    });
};

export const startLessonAttempt = (req, res) => {
    const { lessonId } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId is required' });

    db.run(
        `INSERT INTO lesson_attempts (user_id, lesson_id, started_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [userId, lessonId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ attemptId: this.lastID, message: 'Attempt started' });
        }
    );
};

export const submitAttemptAnswer = (req, res) => {
    const { attemptId } = req.params;
    const { questionId, answerId } = req.body;

    const checkSql = `SELECT is_correct FROM answers WHERE id = ? AND question_id = ?`;
    db.get(checkSql, [answerId, questionId], (err, answer) => {
        if (err || !answer) return res.status(404).json({ error: 'Answer/Question mismatch' });

        const insertSql = `
            INSERT INTO lesson_attempt_answers (lesson_attempt_id, question_id, answer_id, is_correct)
            VALUES (?, ?, ?, ?)
        `;
        db.run(insertSql, [attemptId, questionId, answerId, answer.is_correct], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ isCorrect: Boolean(answer.is_correct) });
        });
    });
};

export const completeLessonAttempt = (req, res) => {
    const { attemptId } = req.params;

    const statsSql = `
        SELECT COUNT(*) as total, SUM(is_correct) as correct
        FROM lesson_attempt_answers WHERE lesson_attempt_id = ?
    `;

    db.get(statsSql, [attemptId], (err, stats) => {
        if (err) return res.status(500).json({ error: err.message });

        const score = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
        const passed = score >= 60 ? 1 : 0;

        db.run(
            `UPDATE lesson_attempts SET score = ?, total_questions = ?, passed = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [score, stats.total, passed, attemptId],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });

                db.get(`SELECT user_id, lesson_id FROM lesson_attempts WHERE id = ?`, [attemptId], (err, attempt) => {
                    if (passed) {
                        updateUserProgressAfterCompletedLesson(attempt.user_id, attempt.lesson_id, (err, progress) => {
                            res.json({ score, passed: true, progress });
                        });
                    } else {
                        res.json({ score, passed: false });
                    }
                });
            }
        );
    });
};

export const getLessonAttempts = (req, res) => {
    const { lessonId, userId } = req.params;

    const sql = ` SELECT id, user_id, lesson_id, score, total_questions, passed, started_at, completed_at, created_at FROM lesson_attempts
                  WHERE lesson_id = ? AND user_id = ? ORDER BY score DESC, created_at DESC `;

    db.all(sql, [lessonId, userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            attemptCount: rows.length,
            attempts: rows.map(row => ({
                ...row,
                passed: Boolean(row.passed)
            }))
        });
    });
};


export const getLessonResult = (req, res) => {
    const { lessonId, attemptId } = req.params;
    const lang = getRequestLanguage(req);

    const attemptSql = `
        SELECT id, user_id, lesson_id, score, total_questions, passed, started_at, completed_at, created_at
        FROM lesson_attempts
        WHERE id = ?
          AND lesson_id = ?
    `;

    db.get(attemptSql, [attemptId, lessonId], (err, attempt) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!attempt) return res.status(404).json({ error: 'Lesson attempt not found' });

        const resultSql = `
            SELECT q.id AS question_id,
                   q.question_text,
                   q.tip AS question_tip,
                   q.order_index,
                   laa.is_correct,
                   given_answer.id AS given_answer_id,
                   given_answer.answer_text AS given_answer_text,
                   correct_answer.id AS correct_answer_id,
                   correct_answer.answer_text AS correct_answer_text
            FROM questions q
                     LEFT JOIN lesson_attempt_answers laa ON laa.question_id = q.id AND laa.lesson_attempt_id = ?
                     LEFT JOIN answers given_answer ON given_answer.id = laa.answer_id
                     LEFT JOIN answers correct_answer ON correct_answer.question_id = q.id AND correct_answer.is_correct = 1
            WHERE q.lesson_id = ? ORDER BY q.order_index `;

        db.all(resultSql, [attemptId, lessonId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            const rowsToTranslate = rows.map(row => ({
                ...row,
                answer_text: row.correct_answer_text,
            }));

            const translatedRows = translateContent(rowsToTranslate, lang);

            const questions = translatedRows.map(row => {
                const question = {
                    questionId: row.question_id,
                    questionText: row.question_text,
                    tip: row.question_tip,
                    isCorrect: Boolean(row.is_correct)
                };

                question.correctAnswer = {
                    answerId: row.correct_answer_id,
                    answerText: row.answer_text
                };

                if (!row.is_correct) {
                    question.givenAnswer = {
                        answerId: row.given_answer_id,
                        answerText: row.given_answer_text
                    };
                }

                return question;
            });

            res.json({
                attemptId: Number(attemptId),
                lessonId: Number(lessonId),
                userId: attempt.user_id,
                score: attempt.score,
                totalQuestions: attempt.total_questions,
                passed: Boolean(attempt.passed),
                questions
            });
        });
    });
};

export const resetLessonCompletion = (req, res) => {
    const { userId, lessonId } = req.params;

    const sql = `DELETE FROM user_progress WHERE user_id = ? AND lesson_id = ?`;

    db.run(sql, [userId, lessonId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'Lesson completion reset successful',
            userId: Number(userId),
            lessonId: Number(lessonId),
            deletedRows: this.changes
        });
    });
};