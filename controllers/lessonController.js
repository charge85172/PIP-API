import db from '../db.js';

export const getLessons = (req, res) => { const sql = ` SELECT l.*, m.title AS module_title, c.title AS course_title FROM lessons l 
     JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id ORDER BY c.order_index, m.order_index, l.order_index `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
};

// is hetzelfde maar heb hem wat aangepast
// export const getLesson = (req, res) => {
//     const { lessonId } = req.params;
//     const sql = ` SELECT l.*, m.title AS module_title, c.title AS course_title FROM lessons l JOIN modules m ON m.id = l.module_id
//      JOIN courses c ON c.id = m.course_id WHERE l.id = ? `;
//
//     db.get(sql, [lessonId], (err, row) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         if (!row) {
//             return res.status(404).json({ error: 'Lesson not found' });
//         }
//         res.json(row);
//     });
// };

// GET /api/lessons/{id} - Lesson details
export const getLesson = (req, res) => {
    const { id } = req.params;

    const lessonSql = `
        SELECT  l.id, l.module_id, l.title, l.description, l.tip, l.image_url, l.estimated_minutes, l.order_index,
            l.is_published,  l.created_at, l.updated_at,  m.title AS module_title, m.order_index AS module_order,  c.id AS course_id, c.title AS course_title
        FROM lessons l
        JOIN modules m ON m.id = l.module_id
        JOIN courses c ON c.id = m.course_id
        WHERE l.id = ? AND l.is_published = 1
    `;

    db.get(lessonSql, [id], (err, lesson) => {
        if (err) { return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        if (!lesson) {
            return res.status(404).json({
                success: false, error: 'Lesson not found or not published'
            });
        }

        // all questions
        const questionsSql = `
            SELECT  id, question_text, question_type, explanation, tip, order_index
            FROM questions 
            WHERE lesson_id = ? 
            ORDER BY order_index
        `;

        db.all(questionsSql, [id], (err, questions) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            // If there are no questions, you will be sent
            if (questions.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        lesson,
                        questions: []
                    }
                });
            }

            // For each question, get the answers (without is_correct) and add them to the question object
            let completed = 0;

            questions.forEach((question, index) => {
                const answersSql = `
                    SELECT id, answer_text, order_index
                    FROM answers 
                    WHERE question_id = ? 
                    ORDER BY order_index
                `;

                db.all(answersSql, [question.id], (err, answers) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            error: err.message
                        });
                    }

                    // Add the answers to the question object (even if there are no answers, set it to an empty array)
                    questions[index].answers = answers || [];
                    completed++;

                    // If all questions are processed, send the complete response
                    if (completed === questions.length) {
                        res.json({
                            success: true,
                            data: {
                                lesson,
                                questions: questions,
                                total_questions: questions.length
                            }
                        });
                    }
                });
            });
        });
    });
};