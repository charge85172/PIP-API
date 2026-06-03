import express from 'express';
import { startLessonAttempt, submitAttemptAnswer, completeLessonAttempt } from '../controllers/progressController.js';

const router = express.Router();

router.post('/lessons/:lessonId/start', startLessonAttempt);
router.post('/attempts/:attemptId/answers', submitAttemptAnswer);
router.post('/attempts/:attemptId/complete', completeLessonAttempt);

export default router;