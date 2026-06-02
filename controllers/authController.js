import crypto from 'node:crypto';
import { promisify } from 'node:util';
import db from '../db.js';

const scryptAsync = promisify(crypto.scrypt);

/**
 * Hashes a password asynchronously.
 */
const hashPassword = async (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
};

/**
 * Email validation regex.
 */
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            error: 'Missing credentials',
            message: 'Name, email, and password are required.'
        });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            error: 'Invalid email',
            message: 'Please provide a valid email address.'
        });
    }

    try {
        const hashedPassword = await hashPassword(password);
        const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        const params = [name, email, hashedPassword];

        db.run(sql, params, function (err) {
            if (err) {
                if (err.errno === 19 || err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({
                        error: 'Conflict',
                        message: 'An account with this email already exists.'
                    });
                }
                console.error('Database Error:', err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: this.lastID,
                    name: name,
                    email: email
                }
            });
        });
    } catch (error) {
        console.error('Hashing Error:', error);
        res.status(500).json({ error: 'Internal server error during registration.' });
    }
};