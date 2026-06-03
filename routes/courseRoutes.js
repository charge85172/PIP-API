import express from 'express';
import * as courseController from '../controllers/courseController.js';

const router = express.Router();

// GET /api/courses
router.get('/', courseController.getAllCourses);

// GET /api/courses
router.get('/:id', courseController.getCourseById);

// GET /api/courses/:id/lessons
router.get('/:id/lessons', courseController.getCourseLessons);

export default router;