import db from '../db.js';
import bcrypt from 'bcrypt';
import { initializeUserProgress } from './userProgressionController.js';

/**
 * Helper to wrap db.get in a Promise for single-row queries
 */
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

/**
 * Helper to wrap db.all in a Promise for multi-row queries
 */
const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

/**
 * Helper to wrap db.run in a Promise for insert/update/delete operations
 */
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

/**
 * Validates the email format using a regular expression
 */
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Registers a new user, hashes the password, and initializes progression
 */
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and password are required.'
        });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address.'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long.'
        });
    }

    try {
        const existingUser = await dbGet(
            `SELECT id FROM users WHERE email = ?`,
            [email.toLowerCase()]
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Updated column name to 'password'
        const result = await dbRun(
            `INSERT INTO users (name, email, password, digital_skill_level, experience, current_level_id, on_boarding, created_at, updated_at)
             VALUES (?, ?, ?, 'beginner', 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, //onboarding staat nu ff op 1 voro continuiteit maar we moeten deze wel ff op 0 zetten als de onboarding screen moet werken.!!!
            [name, email.toLowerCase(), hashedPassword]
        );

        const userId = result.lastID;

        try {
            await initializeUserProgress(userId);
        } catch (progressError) {
            console.error('Error initializing user progress:', progressError);
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: userId,
                    name: name,
                    email: email.toLowerCase()
                }
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration.'
        });
    }
};

/**
 * Authenticates a user and returns their profile (excluding password)
 */
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required.'
        });
    }

    try {
        // Updated column name to 'password'
        const user = await dbGet(
            `SELECT id, name, email, password, digital_skill_level, experience, current_level_id, on_boarding
             FROM users
             WHERE email = ?`,
            [email.toLowerCase()]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Compare using the 'password' field from the database
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Remove password before sending user data back
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login.'
        });
    }
};

/**
 * Fetches all users from the database for administrative/testing purposes
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await dbAll(
            `SELECT id, name, email, digital_skill_level, experience, on_boarding, created_at FROM users`
        );

        res.json({
            success: true,
            count: users.length,
            data: { users }
        });
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching users.'
        });
    }
};

/**
 * Fetches profile data for a specific user ID
 */
export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await dbGet(
            `SELECT id, name, email, digital_skill_level, experience, current_level_id, on_boarding, created_at, updated_at
             FROM users
             WHERE id = ?`,
            [id]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

/**
 * Fetches the onboarding completion status for a specific user ID
 */
export const getOnboardingStatus = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid User ID is required.'
        });
    }

    try {
        const user = await dbGet(
            `SELECT on_boarding FROM users WHERE id = ?`,
            [id]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        res.json({
            success: true,
            data: {
                on_boarding: !!user.on_boarding
            }
        });

    } catch (error) {
        console.error('Get Onboarding Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching onboarding status.'
        });
    }
};