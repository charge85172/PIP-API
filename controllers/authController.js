import db from '../db.js';
import bcrypt from 'bcrypt';
import { initializeUserProgress } from './userProgressionController.js';

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
        (err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes }));
    });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
});

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getAllUsers = async (req, res) => {
    try {
        const users = await dbAll(`SELECT id, name, email, digital_skill_level, experience, current_level_id, on_boarding, created_at, updated_at FROM users`);
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await dbGet(`SELECT id, name, email, digital_skill_level, experience, current_level_id, on_boarding, created_at, updated_at FROM users WHERE id = ?`, [id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Get User By ID Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user.' });
    }
};

export const createUser = async (req, res) => {
    const { name, email, password, digital_skill_level, experience, current_level_id, on_boarding } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    try {
        const existingUser = await dbGet(`SELECT id FROM users WHERE email = ?`, [email.toLowerCase()]);
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await dbRun(
            `INSERT INTO users (name, email, password, digital_skill_level, experience, current_level_id, on_boarding) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email.toLowerCase(), hashedPassword, digital_skill_level || 'beginner', experience || 0, current_level_id || 0, on_boarding || 0]
        );

        await initializeUserProgress(result.lastID);

        res.status(201).json({ success: true, message: 'User created successfully', userId: result.lastID });
    } catch (error) {
        res.status(500).json({ success: false, message: 'User creation failed.' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, digital_skill_level, experience, current_level_id, on_boarding } = req.body;

    try {
        const user = await dbGet(`SELECT id FROM users WHERE id = ?`, [id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const fields = [];
        const params = [];

        if (name) { fields.push('name = ?'); params.push(name); }
        if (email) { fields.push('email = ?'); params.push(email.toLowerCase()); }
        if (digital_skill_level) { fields.push('digital_skill_level = ?'); params.push(digital_skill_level); }
        if (experience !== undefined) { fields.push('experience = ?'); params.push(experience); }
        if (current_level_id !== undefined) { fields.push('current_level_id = ?'); params.push(current_level_id); }
        if (on_boarding !== undefined) { fields.push('on_boarding = ?'); params.push(on_boarding); }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update.' });
        }

        params.push(id);
        const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

        await dbRun(sql, params);
        res.json({ success: true, message: 'User updated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed.' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await dbGet(`SELECT id FROM users WHERE id = ?`, [id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        await dbRun(`DELETE FROM user_progress WHERE user_id = ?`, [id]);
        await dbRun(`DELETE FROM lesson_attempts WHERE user_id = ?`, [id]);
        await dbRun(`DELETE FROM user_streaks WHERE user_id = ?`, [id]);
        await dbRun(`DELETE FROM user_rewards WHERE user_id = ?`, [id]);
        await dbRun(`DELETE FROM xp_transactions WHERE user_id = ?`, [id]);
        await dbRun(`DELETE FROM users WHERE id = ?`, [id]);

        res.json({ success: true, message: 'User and all related progress deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Deletion failed.' });
    }
};

export const completeOnboarding = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await dbGet(`SELECT on_boarding FROM users WHERE id = ?`, [id]);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (user.on_boarding === 1) {
            return res.status(400).json({ success: false, message: 'Onboarding already completed.' });
        }

        await dbRun(
            `UPDATE users SET on_boarding = 1, current_level_id = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [id]
        );

        try {
            await dbRun(
                `INSERT INTO user_rewards (user_id, reward_id, unlocked_at) VALUES (?, 1, CURRENT_TIMESTAMP)`,
                [id]
            );
        } catch (rewardErr) {
            console.error('Reward already unlocked or missing:', rewardErr.message);
        }

        res.json({
            success: true,
            message: 'Onboarding completed. Level 1 reached and Hamster Wheel awarded.',
            data: { level: 1, on_boarding: 1 }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error during onboarding.' });
    }
};

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const existingUser = await dbGet(`SELECT id FROM users WHERE email = ?`, [email.toLowerCase()]);
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await dbRun(
            `INSERT INTO users (name, email, password, current_level_id, on_boarding) VALUES (?, ?, ?, 0, 0)`,
            [name, email.toLowerCase(), hashedPassword]
        );

        await initializeUserProgress(result.lastID);

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed.' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await dbGet(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase()]);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, data: { user: userWithoutPassword } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed.' });
    }
};

export const getOnboardingStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await dbGet(`SELECT on_boarding FROM users WHERE id = ?`, [id]);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, data: { on_boarding: !!user.on_boarding } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching status.' });
    }
};