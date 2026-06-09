import db from '../db.js';

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

/**
 * Logic to award XP and calculate levels, and unlock rewards on level-up.
 */
export const awardXP = async (userId, activityType, activityId, amount = 10) => {
    try {
        // 1. Try to save the XP transaction (UNIQUE constraint prevents duplicate awards for the same activity)
        try {
            await dbRun(
                `INSERT INTO xp_transactions (user_id, activity_type, activity_id, xp_amount)
                 VALUES (?, ?, ?, ?)`,
                [userId, activityType, activityId, amount]
            );
        } catch (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return { success: false, message: 'XP has already been awarded for this activity.' };
            }
            throw err;
        }

        // 2. Retrieve current XP and level from the user
        const user = await dbGet(`SELECT experience, current_level_id FROM users WHERE id = ?`, [userId]);
        if (!user) throw new Error('User not found');

        let newTotalXP = (user.experience || 0) + amount;

        // 3. Level calculation: 100 XP per level (100xp = lvl 2, 200xp = lvl 3, etc.)
        // Levels start from 1, so 0-99 XP is Level 1, 100-199 XP is Level 2.
        let newLevel = Math.floor(newTotalXP / 100) + 1;

        const levelUpOccurred = newLevel > user.current_level_id;
        let unlockedRewards = [];

        // 4. Update the user's experience and level
        await dbRun(
            `UPDATE users SET experience = ?, current_level_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [newTotalXP, newLevel, userId]
        );

        // 5. If a level-up occurred, check for and unlock new rewards
        if (levelUpOccurred) {
            // Fetch all rewards associated with the new level
            const rewardsForNewLevel = await dbAll(
                `SELECT id, title, description FROM rewards WHERE level_id = ?`,
                [newLevel]
            );

            for (const reward of rewardsForNewLevel) {
                try {
                    await dbRun(
                        `INSERT INTO user_rewards (user_id, reward_id, unlocked_at)
                         VALUES (?, ?, CURRENT_TIMESTAMP)`,
                        [userId, reward.id]
                    );
                    unlockedRewards.push({
                        id: reward.id,
                        title: reward.title,
                        description: reward.description
                    });
                } catch (rewardErr) {
                    // If the UNIQUE constraint fails, the reward was already unlocked (e.g., if a user
                    // somehow earned XP for the same activity multiple times before the unique constraint was added,
                    // or if a reward is tied to multiple levels and already unlocked).
                    if (!rewardErr.message.includes('UNIQUE constraint failed')) {
                        console.error(`Error unlocking reward ${reward.id} for user ${userId}:`, rewardErr);
                    }
                }
            }
        }

        return {
            success: true,
            xpAdded: amount,
            totalXP: newTotalXP,
            level: newLevel,
            levelUp: levelUpOccurred,
            unlockedRewards: unlockedRewards
        };
    } catch (error) {
        console.error('awardXP Error:', error);
        throw error;
    }
};

/**
 * POST /api/progress/xp
 * Endpoint for the frontend (e.g., after a correct answer to a question)
 */
export const handlePostXP = async (req, res) => {
    const { userId, activityType, activityId } = req.body;
    const DEFAULT_XP = 10;

    if (!userId || !activityType || !activityId) {
        return res.status(400).json({ success: false, message: 'Missing fields in request body.' });
    }

    try {
        const result = await awardXP(userId, activityType, activityId, DEFAULT_XP);
        if (!result.success) {
            return res.status(409).json(result);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error when awarding XP.' });
    }
};
