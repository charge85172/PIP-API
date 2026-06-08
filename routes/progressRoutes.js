import express from 'express';
import {
    startLessonAttempt,
    submitAttemptAnswer,
    completeLessonAttempt,
    getLessonAttempts
} from '../controllers/progressController.js';
import { handlePostXP } from '../controllers/xpController.js';

const router = express.Router();

// Les pogingen
router.post('/lessons/:lessonId/start', startLessonAttempt);
router.post('/attempts/:attemptId/answers', submitAttemptAnswer);
router.post('/attempts/:attemptId/complete', completeLessonAttempt);
router.get('/lessons/:lessonId/attempts/:userId', getLessonAttempts);

// XP Registratie (Nieuw voor User Story #25)
// POST /api/progress/xp
router.post('/xp', handlePostXP);

export default router;
