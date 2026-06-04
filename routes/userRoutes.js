import express from 'express';
import { getUserById } from '../controllers/authController.js';
import { getUserProgress } from '../controllers/progressController.js';

const router = express.Router();

// GET /api/users/:id
router.get('/:id', getUserById);

// GET /api/users/:id/progress
router.get('/:id/progress', getUserProgress);

export default router;