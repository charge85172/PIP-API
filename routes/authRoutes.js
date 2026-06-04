import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Define the registration route
// Note: The path is just '/register' because the prefix '/api' is added in index.js
// POST /api/register
router.post('/register', registerUser);

// POST /api/login
router.post('/login', loginUser);

export default router;