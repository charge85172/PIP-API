import express from 'express';
import { getUserById } from '../controllers/authController.js';
import { getUserProgress, completeLesson, openLesson } from '../controllers/progressController.js';

const router = express.Router();

// GET /api/users/:id
router.get('/:id', getUserById);

// GET /api/users/:id/progress
router.get('/:id/progress', getUserProgress);

// PUT /api/users/:id/progress/lesson/:lessonId
router.put('/:id/progress/lesson/:lessonId', completeLesson);

// PUT /api/users/:id/progress/lesson/:lessonId/open
router.put('/:id/progress/lesson/:lessonId/open', openLesson);

export default router;