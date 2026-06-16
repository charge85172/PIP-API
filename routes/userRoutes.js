import express from 'express';
import { completeOnboarding, getOnboardingStatus, getUserById, getAllUsers } from '../controllers/authController.js';
import {getUserProgress, getUserStreaks} from '../controllers/userProgressionController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/:id/progress', getUserProgress);
router.get('/:id/onboarding-status', getOnboardingStatus);
router.get('/:userId/streak', getUserStreaks);

// New onboarding completion route
router.post('/:id/complete-onboarding', completeOnboarding);

export default router;