import express from 'express';
import { getUserById, getUserProgress } from '../controllers/authController.js';

const router = express.Router();

// GET /api/users/:id
router.get('/:id', getUserById);

// GET /api/users/:id/progress
router.get('/:id/progress', getUserProgress);

export default router;