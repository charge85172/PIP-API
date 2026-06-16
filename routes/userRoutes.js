import express from 'express';
import {
    completeOnboarding,
    getOnboardingStatus,
    getUserById,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/authController.js';
import { getUserProgress, getUserStreaks } from '../controllers/userProgressionController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

router.get('/:id/progress', getUserProgress);
router.get('/:id/onboarding-status', getOnboardingStatus);
router.get('/:userId/streak', getUserStreaks);

router.post('/:id/complete-onboarding', completeOnboarding);

export default router;