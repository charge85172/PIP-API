import express from 'express';
import { startLessonAttempt, submitAttemptAnswer, completeLessonAttempt, getLessonAttempts, getLessonResult } from '../controllers/progressController.js';

const router = express.Router();

router.post('/lessons/:lessonId/start', startLessonAttempt);
router.post('/attempts/:attemptId/answers', submitAttemptAnswer);
router.post('/attempts/:attemptId/complete', completeLessonAttempt);

router.get('/lessons/:lessonId/attempts/:userId', getLessonAttempts);
router.get('/lessons/:lessonId/attempts/:attemptId/result', getLessonResult);


export default router;