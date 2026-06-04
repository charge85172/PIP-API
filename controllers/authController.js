import db from '../db.js';
import bcrypt from 'bcrypt';
import { initializeUserProgress } from './progressController.js';

// database promises
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

/**
 * Email validatie
 */
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // Validation
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
        // Check if email exist
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

        // Hash password with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

         // SQL query om nieuwe gebruiker aan te maken
         const result = await dbRun(
             `INSERT INTO users (name, email, password_hash, digital_skill_level, experience, current_level_id, on_boarding, created_at, updated_at) 
              VALUES (?, ?, ?, 'beginner', 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
             [name, email.toLowerCase(), hashedPassword]
         );

         const userId = result.lastID;

        // Initialiseer user progress
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

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required.'
        });
    }

     try {
         // Search user by email
         const user = await dbGet(
             `SELECT id, name, email, password_hash, digital_skill_level, experience, current_level_id, on_boarding 
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

         // password bycrypt
         const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
         }
         const { password_hash: _, ...userWithoutPassword } = user;

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
            success: false, message: 'Internal server error during login.'
        });
    }
};

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
                success: false, message: 'User not found.'
            });
        }

        res.json({
            success: true, data: { user }
        });

    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({
            success: false, message: 'Internal server error.'
        });
    }
};