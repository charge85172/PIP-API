import express from 'express';
import { completeOnboarding, getOnboardingStatus, getUserById, getAllUsers, createUser, updateUser, deleteUser } from '../controllers/authController.js';
import { getUserProgress, getUserStreaks } from '../controllers/userProgressionController.js';
import isUser from "../middleware/isUser.js";
import { validateId } from "../middleware/validateId.js";

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', validateId('id'), isUser, getUserById);
router.put('/:id', validateId('id'), isUser, updateUser);
router.delete('/:id', validateId('id'), isUser, deleteUser);

router.get('/:id/progress', validateId('id'), isUser, getUserProgress);
router.get('/:id/onboarding-status', validateId('id'), isUser, getOnboardingStatus);
router.get('/:userId/streak', validateId('userId'), isUser, getUserStreaks);

router.post('/:id/complete-onboarding', validateId('id'), isUser, completeOnboarding);

export default router;