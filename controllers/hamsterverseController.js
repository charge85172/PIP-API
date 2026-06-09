// C:/Users/ashfa/Development/TLE4/PIP-API/controllers/hamsterverseController.js

import db from '../db.js';

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
});

// Fetching Hamsterverse data
export const getHamsterverseData = async (req, res) => {
    const { userId } = req.params;

    try {
        // User current status
        const user = await dbGet(`SELECT id, current_level_id, experience FROM users WHERE id = ?`, [userId]);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        // Fetching all rewards (NU INCLUSIEF image_url)
        const allRewards = await dbAll(`SELECT id, level_id, title, description, image_url FROM rewards ORDER BY level_id ASC`);

        // Fetching unlocked rewards
        const unlockedRewards = await dbAll(
            `SELECT reward_id FROM user_rewards WHERE user_id = ?`, [userId]
        );

        const unlockedIds = unlockedRewards.map(r => r.reward_id);

        // Mapping data for frontend
        const rewardsStatus = allRewards.map(reward => ({
            ...reward,
            isUnlocked: unlockedIds.includes(reward.id)
        }));

        res.json({
            success: true,
            data: {
                currentLevel: user.current_level_id,
                experience: user.experience,
                rewards: rewardsStatus
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching Hamsterverse data.' });
    }
};
