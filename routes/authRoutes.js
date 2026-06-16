import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimit.js';


const router = express.Router();

// Define the registration route
// Note: The path is just '/register' because the prefix '/api' is added in index.js
// POST /api/register
router.post('/register', authLimiter, registerUser);

// POST /api/login
router.post('/login', authLimiter, loginUser);

export default router;