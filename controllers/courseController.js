import db from '../db.js';

// call db calls as Promises
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// GET /api/courses
export const getAllCourses = async (req, res) => {
    try {
        const courses = await dbAll(
            `SELECT 
                id,
                title,
                description,
                difficulty_level,
                order_index,
                created_at,
                updated_at,
                (
                    SELECT COUNT(*) 
                    FROM modules m 
                    WHERE m.course_id = courses.id
                ) as total_modules,
                (
                    SELECT COUNT(*) 
                    FROM modules m
                    INNER JOIN lessons l ON l.module_id = m.id
                    WHERE m.course_id = courses.id AND l.is_published = 1
                ) as total_lessons
            FROM courses 
            WHERE is_published = 1 
            ORDER BY order_index ASC, id ASC`
        );

        const formattedCourses = courses.map(course => ({
            ...course,
            status: 'available',
            is_available: true
        }));

        res.json({
            success: true,
            data: formattedCourses
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// GET /api/courses/:id
export const getCourseById = async (req, res) => {
    try {
        const courseId = parseInt(req.params.id);

        if (isNaN(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID'
            });
        }

        const course = await dbGet(
            `SELECT 
                id,
                title,
                description,
                difficulty_level,
                order_index,
                is_published,
                created_at,
                updated_at
            FROM courses 
            WHERE id = ? AND is_published = 1`,
            [courseId]
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or not available'
            });
        }

        const stats = await dbGet(
            `SELECT 
                COUNT(DISTINCT m.id) as total_modules,
                COUNT(l.id) as total_lessons
            FROM modules m
            LEFT JOIN lessons l ON l.module_id = m.id AND l.is_published = 1
            WHERE m.course_id = ?`,
            [courseId]
        );

        res.json({
            success: true,
            data: {
                ...course,
                status: 'available',
                is_available: true,
                total_modules: stats?.total_modules || 0,
                total_lessons: stats?.total_lessons || 0
            }
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// GET /api/courses/:id/lessons
export const getCourseLessons = async (req, res) => {
    try {
        const courseId = parseInt(req.params.id);

        if (isNaN(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID'
            });
        }

        // Checking if course exists
        const course = await dbGet(
            `SELECT id, title, is_published 
            FROM courses 
            WHERE id = ? AND is_published = 1`,
            [courseId]
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or not available'
            });
        }

        // All published lessons
        const lessons = await dbAll(
            `SELECT 
                l.id,
                l.title,
                l.description,
                l.tip,
                l.image_url,
                l.estimated_minutes as duration,
                l.order_index,
                l.is_published,
                l.created_at,
                l.updated_at,
                m.id as module_id,
                m.title as module_title,
                m.order_index as module_order,
                c.id as course_id,
                c.title as course_title
            FROM lessons l
            INNER JOIN modules m ON m.id = l.module_id
            INNER JOIN courses c ON c.id = m.course_id
            WHERE c.id = ? 
            AND l.is_published = 1
            AND c.is_published = 1
            ORDER BY m.order_index ASC, l.order_index ASC`,
            [courseId]
        );

        const formattedLessons = lessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            tip: lesson.tip,
            image_url: lesson.image_url,
            duration: lesson.duration || 0,
            order_index: lesson.order_index,
            module: {
                id: lesson.module_id,
                title: lesson.module_title,
                order_index: lesson.module_order
            }
        }));

        // Group per module
        const lessonsByModule = formattedLessons.reduce((acc, lesson) => {
            const moduleKey = lesson.module.id;
            if (!acc[moduleKey]) {
                acc[moduleKey] = {
                    module_id: lesson.module.id,
                    module_title: lesson.module.title,
                    module_order: lesson.module.order_index,
                    lessons: []
                };
            }
            acc[moduleKey].lessons.push(lesson);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                course: {
                    id: course.id,
                    title: course.title,
                    status: 'available',
                    is_available: true
                },
                total_lessons: lessons.length,
                lessons: formattedLessons,
                lessons_by_module: Object.values(lessonsByModule)
            }
        });
    } catch (error) {
        console.error('Error fetching course lessons:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};