import express from 'express';
import { getHamsterverseData } from '../controllers/hamsterverseController.js';
import isUser from "../middleware/isUser.js";

const router = express.Router();

// GET /api/hamsterverse/:userId
router.get('/:userId',isUser, getHamsterverseData);

export default router;
