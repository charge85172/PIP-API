import db from '../db.js';

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
        (err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes }));
    });
});

/**
 * Logica om XP toe te kennen en levels te berekenen
 */
export const awardXP = async (userId, activityType, activityId, amount = 10) => {
    try {
        // 1. Probeer transactie op te slaan (stopt hier bij duplicaat door UNIQUE constraint)
        try {
            await dbRun(
                `INSERT INTO xp_transactions (user_id, activity_type, activity_id, xp_amount)
                 VALUES (?, ?, ?, ?)`,
                [userId, activityType, activityId, amount]
            );
        } catch (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return { success: false, message: 'XP is al toegekend voor deze activiteit.' };
            }
            throw err;
        }

        // 2. Haal huidige XP op van de gebruiker
        const user = await dbGet(`SELECT experience, current_level_id FROM users WHERE id = ?`, [userId]);
        if (!user) throw new Error('Gebruiker niet gevonden');

        let newTotalXP = (user.experience || 0) + amount;

        // 3. Level berekening: 100 XP per level (100xp = lvl 2, 200xp = lvl 3, etc.)
        let newLevel = Math.floor(newTotalXP / 100) + 1;

        // 4. Update de gebruiker
        await dbRun(
            `UPDATE users SET experience = ?, current_level_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [newTotalXP, newLevel, userId]
        );

        return {
            success: true,
            xpAdded: amount,
            totalXP: newTotalXP,
            level: newLevel,
            levelUp: newLevel > user.current_level_id
        };
    } catch (error) {
        console.error('awardXP Error:', error);
        throw error;
    }
};

/**
 * POST /api/progress/xp
 * Endpoint voor de frontend (bijv. na correct antwoord op een vraag)
 */
export const handlePostXP = async (req, res) => {
    const { userId, activityType, activityId } = req.body;
    const DEFAULT_XP = 10;

    if (!userId || !activityType || !activityId) {
        return res.status(400).json({ success: false, message: 'Ontbrekende velden in request body.' });
    }

    try {
        const result = await awardXP(userId, activityType, activityId, DEFAULT_XP);
        if (!result.success) {
            return res.status(409).json(result);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Interne serverfout bij toekennen XP.' });
    }
};