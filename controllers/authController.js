// de code is opnieuw geschreven en extra dingen toegevoegd, vond dit een betere manier. IS

// import crypto from 'node:crypto';
// import { promisify } from 'node:util';
import db from '../db.js';
import bcrypt from 'bcrypt';

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

/**
 * Initialiseer een nieuwe gebruiker met standaard progressie
 */
const initializeUserProgress = async (userId) => {
    // get all lessons
    const lessons = await dbAll(
        `SELECT l.id 
         FROM lessons l
         JOIN modules m ON m.id = l.module_id
         WHERE l.is_published = 1
         ORDER BY m.order_index, l.order_index`
    );

    // user_progress entries
    for (const lesson of lessons) {
        await dbRun(
            `INSERT INTO user_progress (user_id, lesson_id, completed, completed_at, last_opened_at)
             VALUES (?, ?, 0, NULL, CURRENT_TIMESTAMP)`,
            [userId, lesson.id]
        );
    }

    // user_streaks entry aan
    await dbRun(
        `INSERT INTO user_streaks (user_id, current_streak, highest_streak, last_active_date)
         VALUES (?, 0, 0, DATE('now'))`,
        [userId]
    );

    console.log(`User progress initialized for user ${userId}, ${lessons.length} lessons added`);
};

/**
 * POST /api/register - Nieuwe gebruiker registreren
 */
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

        // Hash het wachtwoord met bcrypt
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

/**
 * POST /api/login - Gebruiker inloggen
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
            success: false,
            message: 'Internal server error during login.'
        });
    }
};

/**
 * GET /api/users/:id - Gebruiker ophalen
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
 * GET /api/users/:id/progress - Voortgang van een gebruiker ophalen
 */
export const getUserProgress = async (req, res) => {
    const {id} = req.params;

    try {
        // check if user exist
        const user = await dbGet(`SELECT id
                                  FROM users
                                  WHERE id = ?`, [id]);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // get all completed lessons
        const completedLessons = await dbAll(
            `SELECT lesson_id, completed, completed_at
             FROM user_progress
             WHERE user_id = ?
               AND completed = 1`,
            [id]
        );

        // get streak info
        const streak = await dbGet(
            `SELECT current_streak, highest_streak, last_active_date
             FROM user_streaks
             WHERE user_id = ?`,
            [id]
        );

        // get rewatds
        const rewards = await dbAll(
            `SELECT r.title, r.description, ur.unlocked_at
             FROM user_rewards ur
             JOIN rewards r ON r.id = ur.reward_id
             WHERE ur.user_id = ?`,
            [id]
        );

        res.json({
            success: true,
            data: {
                completed_lessons_count: completedLessons.length,
                completed_lessons: completedLessons,
                streak: streak || {current_streak: 0, highest_streak: 0},
                rewards: rewards
            }
        });

    } catch (error) {
        console.error('Get User Progress Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// const scryptAsync = promisify(crypto.scrypt);
//
// /**
//  * Hashes a password asynchronously.
//  */
// const hashPassword = async (password) => {
//     const salt = crypto.randomBytes(16).toString('hex');
//     const derivedKey = await scryptAsync(password, salt, 64);
//     return `${salt}:${derivedKey.toString('hex')}`;
// };
//
// /**
//  * Email validation regex.
//  */
// const isValidEmail = (email) => {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// };
//
// export const registerUser = async (req, res) => {
//     const { name, email, password } = req.body;
//
//     if (!name || !email || !password) {
//         return res.status(400).json({
//             error: 'Missing credentials',
//             message: 'Name, email, and password are required.'
//         });
//     }
//
//     if (!isValidEmail(email)) {
//         return res.status(400).json({
//             error: 'Invalid email',
//             message: 'Please provide a valid email address.'
//         });
//     }
//
//     try {
//         const hashedPassword = await hashPassword(password);
//         const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
//         const params = [name, email, hashedPassword];
//
//         db.run(sql, params, function (err) {
//             if (err) {
//                 if (err.errno === 19 || err.message.includes('UNIQUE constraint failed')) {
//                     return res.status(409).json({
//                         error: 'Conflict',
//                         message: 'An account with this email already exists.'
//                     });
//                 }
//                 console.error('Database Error:', err.message);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }
//
//             res.status(201).json({
//                 message: 'User registered successfully',
//                 user: {
//                     id: this.lastID,
//                     name: name,
//                     email: email
//                 }
//             });
//         });
//     } catch (error) {
//         console.error('Hashing Error:', error);
//         res.status(500).json({ error: 'Internal server error during registration.' });
//     }
// };