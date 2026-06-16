import express from 'express';
import {
    startLessonAttempt,
    submitAttemptAnswer,
    completeLessonAttempt,
    getLessonResult,
    getLessonAttempts,
    resetLessonCompletion,
} from '../controllers/progressController.js';
import {handlePostXP} from "../controllers/xpController.js";

const router = express.Router();

// Lesson attempts
router.post('/lessons/:lessonId/start', startLessonAttempt);
router.post('/attempts/:attemptId/answers', submitAttemptAnswer);
router.post('/attempts/:attemptId/complete', completeLessonAttempt);

// POST /api/progress/xp
router.post('/xp', handlePostXP);
router.get('/lessons/:lessonId/attempts/:attemptId', getLessonAttempts);
router.get('/lessons/:lessonId/attempts/:attemptId/result', getLessonResult);

// delete /api/progress/users/:userId/lessons/:lessonId/completion
router.delete('/users/:userId/lessons/:lessonId/completion', resetLessonCompletion);
//hiermee kun je lessen weer "open" zetten voor mensen, was ook nodig om xp in front end te testen.
export default router;
