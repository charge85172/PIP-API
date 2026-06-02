import express from 'express';
import { registerUser } from '../controllers/authController.js';

const router = express.Router();

// Define the registration route
// Note: The path is just '/register' because the prefix '/api' is added in index.js
router.post('/register', registerUser);

export default router;