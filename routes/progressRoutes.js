import express from 'express';
import {
    startLessonAttempt,
    submitAttemptAnswer,
    completeLessonAttempt,
    getLessonResult,
    getLessonAttempts,
    deleteLessonAttempt,
    resetLessonCompletion,
    getCompletedLessonsForUser,
    overrideUserXP
} from '../controllers/progressController.js';
import { handlePostXP } from "../controllers/xpController.js";

const router = express.Router();

router.post('/lessons/:lessonId/start', startLessonAttempt);
router.post('/attempts/:attemptId/answers', submitAttemptAnswer);
router.post('/attempts/:attemptId/complete', completeLessonAttempt);
router.get('/lessons/:lessonId/users/:userId/attempts', getLessonAttempts);
router.get('/lessons/:lessonId/attempts/:attemptId/result', getLessonResult);
router.delete('/attempts/:attemptId', deleteLessonAttempt);

router.post('/xp', handlePostXP);
router.patch('/users/:userId/xp/override', overrideUserXP);

router.get('/users/:userId/completed', getCompletedLessonsForUser);
router.delete('/users/:userId/lessons/:lessonId/completion', resetLessonCompletion);

export default router;