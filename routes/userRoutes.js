import express from 'express';
import { getUserById, getOnboardingStatus, getAllUsers } from '../controllers/authController.js';
import { getUserProgress } from '../controllers/userProgressionController.js';
import isUser from "../middleware/isUser.js";
import {validateId} from "../middleware/validateId.js";

const router = express.Router();

/**
 * GET /api/users
 * Returns a list of all registered users
 */
router.get('/', getAllUsers);

/**
 * GET /api/users/:id
 * Returns profile details for a specific user
 */
router.get('/:id', validateId('Id'),isUser, getUserById);

/**
 * GET /api/users/:id/onboarding-status
 * Returns whether the user has completed the onboarding process
 */
router.get('/:id/onboarding-status',validateId('Id'), isUser, getOnboardingStatus);

/**
 * GET /api/users/:id/progress
 * Returns the progression data for a specific user
 */
router.get('/:id/progress',validateId('Id'), isUser, getUserProgress);

export default router;