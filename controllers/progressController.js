import db from '../db.js';

const updateUserProgressAfterCompletedLesson = (userId, lessonId, callback) => {
    const lessonSql = ` SELECT l.id AS lesson_id, l.module_id, m.course_id FROM lessons l JOIN modules m ON m.id = l.module_id WHERE l.id = ? `;

    db.get(lessonSql, [lessonId], (err, lesson) => {
        if (err) {
            return callback(err);
        }

        if (!lesson) {
            return callback(new Error('Lesson not found while updating user progress'));
        }

        const progressSql = ` INSERT INTO user_progress (user_id, lesson_id, status, completed_at, last_opened_at, created_at, updated_at)
              VALUES (?, ?, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(user_id, lesson_id) DO UPDATE SET status = 'completed', completed_at = COALESCE(user_progress.completed_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP `;

        db.run(progressSql, [userId, lessonId], function (err) {
            if (err) {
                return callback(err);
            }

            const moduleSql = ` SELECT COUNT(*) AS total_lessons, SUM(CASE WHEN up.status = 'completed' THEN 1 ELSE 0 END) 
            AS completed_lessons FROM lessons l LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = ? WHERE l.module_id = ? AND l.is_published = 1 `;

            db.get(moduleSql, [userId, lesson.module_id], (err, moduleProgress) => {
                if (err) {
                    return callback(err);
                }

                const moduleCompleted =
                    moduleProgress.total_lessons > 0 &&
                    moduleProgress.total_lessons === moduleProgress.completed_lessons;

                const updateCourseStatus = () => {
                    const courseSql = ` SELECT COUNT(*) AS total_modules, SUM(CASE WHEN ums.status = 'completed' THEN 1 ELSE 0 END) AS completed_modules 
                    FROM modules m LEFT JOIN user_module_status ums ON ums.module_id = m.id AND ums.user_id = ? WHERE m.course_id = ? `;

                    db.get(courseSql, [userId, lesson.course_id], (err, courseProgress) => {
                        if (err) {
                            return callback(err);
                        }

                        const courseCompleted =
                            courseProgress.total_modules > 0 &&
                            courseProgress.total_modules === courseProgress.completed_modules;

                        if (!courseCompleted) {
                            return callback(null, { lessonCompleted: true, moduleCompleted, courseCompleted: false, moduleId: lesson.module_id, courseId: lesson.course_id });
                        }

                        const updateCourseSql = ` INSERT INTO user_course_status (user_id, course_id, status, created_at, updated_at)
                              VALUES (?, ?, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(user_id, course_id) DO UPDATE SET status = 'completed', updated_at = CURRENT_TIMESTAMP `;

                        db.run(updateCourseSql, [userId, lesson.course_id], function (err) {
                            if (err) {
                                return callback(err);
                            }
                            callback(null, { lessonCompleted: true, moduleCompleted, courseCompleted: true, moduleId: lesson.module_id, courseId: lesson.course_id });
                        });
                    });
                };
                if (!moduleCompleted) {
                    return updateCourseStatus();
                }

                const updateModuleSql = ` INSERT INTO user_module_status (user_id, module_id, status, created_at, updated_at) 
                    VALUES (?, ?, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(user_id, module_id) DO UPDATE SET status = 'completed', updated_at = CURRENT_TIMESTAMP `;

                db.run(updateModuleSql, [userId, lesson.module_id], function (err) {
                    if (err) {
                        return callback(err);
                    }

                    updateCourseStatus();
                });
            });
        });
    });
};

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

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Lesson attempt not found' });
            }

            const attemptSql = ` SELECT la.user_id, la.lesson_id, lessons.tip AS lessonTip FROM lesson_attempts la JOIN lessons ON lessons.id = la.lesson_id WHERE la.id = ? `;

            db.get(attemptSql, [attemptId], (err, attempt) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (!attempt) {
                    return res.status(404).json({ error: 'Lesson attempt not found' });
                }
                if (!passed) {
                    return res.json({ attemptId: Number(attemptId), score, totalQuestions, correctAnswers, passed: Boolean(passed), lessonTip: attempt?.lessonTip || null, progress: null });
                }

                updateUserProgressAfterCompletedLesson(attempt.user_id, attempt.lesson_id, (err, progress) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ attemptId: Number(attemptId), score, totalQuestions, correctAnswers, passed: Boolean(passed), lessonTip: attempt?.lessonTip || null, progress });
                });
            });
        });
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