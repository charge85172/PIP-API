import db from '../db.js';

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
 * Fetches the progression data for a specific user
 */
export const getUserProgress = async (req, res) => {
    const { id } = req.params;

    try {
        const progress = await dbGet(
            `SELECT * FROM user_progress WHERE user_id = ?`,
            [id]
        );

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Progress data not found for this user.'
            });
        }

        res.json({
            success: true,
            data: { progress }
        });

    } catch (error) {
        console.error('Get User Progress Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

/**
 * Initializes progress for a new user (called by registerUser)
 */
export const initializeUserProgress = async (userId) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO user_progress (user_id, current_level, points) VALUES (?, 1, 0)`,
            [userId],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
};
