import express from 'express';
import { startLessonAttempt, submitAttemptAnswer, completeLessonAttempt, getLessonResult, getLessonAttempts, deleteLessonAttempt, resetLessonCompletion, getCompletedLessonsForUser, } from '../controllers/progressController.js';
import { handlePostXP } from "../controllers/xpController.js";
import isUser from "../middleware/isUser.js";
import { validateId } from "../middleware/validateId.js";

const router = express.Router();

router.post('/lessons/:lessonId/start', validateId('lessonId'), startLessonAttempt);
router.post('/attempts/:attemptId/answers', validateId('attemptId'), submitAttemptAnswer);
router.post('/attempts/:attemptId/complete', validateId('attemptId'), completeLessonAttempt);
router.get('/lessons/:lessonId/users/:userId/attempts', validateId('userId'), isUser, getLessonAttempts);
router.get('/lessons/:lessonId/attempts/:attemptId/result', validateId('attemptId'), getLessonResult);
router.delete('/attempts/:attemptId', validateId('attemptId'), deleteLessonAttempt);

router.post('/xp', handlePostXP);
router.patch('/users/:userId/xp/override', validateId('userId'), overrideUserXP);

router.get('/users/:userId/completed', validateId('userId'), getCompletedLessonsForUser);
router.delete('/users/:userId/lessons/:lessonId/completion', validateId('lessonId'), validateId('userId'), resetLessonCompletion);

export default router;