import express from 'express';
import {
    startLessonAttempt,
    submitAttemptAnswer,
    completeLessonAttempt,
    getLessonResult,
    getLessonAttempts
} from '../controllers/progressController.js';
import {handlePostXP} from "../controllers/xpController.js";

const router = express.Router();

// Lesson attempts
router.post('/lessons/:lessonId/start', startLessonAttempt);
router.post('/attempts/:attemptId/answers', submitAttemptAnswer);
router.post('/attempts/:attemptId/complete', completeLessonAttempt);

// XP Registration (New for User Story #25)
// POST /api/progress/xp
router.post('/xp', handlePostXP);
router.get('/lessons/:lessonId/attempts/:attemptId', getLessonAttempts);
router.get('/lessons/:lessonId/attempts/:attemptId/result', getLessonResult);


export default router;
