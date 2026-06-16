import express from 'express';
import { completeOnboarding, getOnboardingStatus, getUserById, getAllUsers, createUser, updateUser, } from '../controllers/authController.js';
import { getUserProgress, getUserStreaks } from '../controllers/userProgressionController.js';
import isUser from "../middleware/isUser.js";
import { validateId } from "../middleware/validateId.js";

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', validateId('Id'), isUser, getUserById);
router.put('/:id', validateId('Id'), isUser, updateUser);
router.delete('/:id', validateId('Id'), isUser, deleteUser);

router.get('/:id/progress', validateId('Id'), isUser, getUserProgress);
router.get('/:id/onboarding-status', validateId('Id'), isUser, getOnboardingStatus);
router.get('/:userId/streak', validateId('userId'), isUser, getUserStreaks);

router.post('/:id/complete-onboarding', validateId('Id'), isUser, completeOnboarding);

export default router;