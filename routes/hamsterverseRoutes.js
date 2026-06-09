import express from 'express';
import { getHamsterverseData } from '../controllers/hamsterverseController.js';

const router = express.Router();

// GET /api/hamsterverse/:userId
router.get('/:userId', getHamsterverseData);

export default router;
