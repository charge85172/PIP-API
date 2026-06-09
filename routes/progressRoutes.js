import express from 'express';
import {
    startLessonAttempt,
    submitAttemptAnswer,
    completeLessonAttempt,
    getLessonAttempts
} from '../controllers/progressController.js';
import { handlePostXP } from '../controllers/xpController.js';
import isUser from "../middleware/isUser.js";
import {validateId} from "../middleware/validateId.js";

const router = express.Router();

// Lesson attempts
router.post('/lessons/:lessonId/start',validateId('lessonId'), startLessonAttempt);
router.post('/attempts/:attemptId/answers',validateId('attemptId'), submitAttemptAnswer);
router.post('/attempts/:attemptId/complete',validateId('attemptId'), completeLessonAttempt);
router.get('/lessons/:lessonId/attempts/:userId',validateId('userId'), isUser, getLessonAttempts);

// XP Registration (New for User Story #25)
// POST /api/progress/xp
router.post('/xp', handlePostXP);

export default router;
