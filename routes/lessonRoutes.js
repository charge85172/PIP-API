import express from 'express';
import { getLessons, getLesson } from '../controllers/lessonController.js';

const router = express.Router();

// GET /api/lessons
router.get('/', getLessons);

// GET /api/lessons/:id Lesson details
router.get('/:id', getLesson);

export default router;