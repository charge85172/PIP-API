import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./Database/pip.sqlite', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the PIP SQLite database.');

        db.serialize(() => {
            // Users table (already present, added for verification)
            db.run(`CREATE TABLE IF NOT EXISTS users (
                                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         name TEXT NOT NULL,
                                                         email TEXT UNIQUE NOT NULL,
                                                         password TEXT NOT NULL,
                                                         digital_skill_level TEXT DEFAULT 'beginner',
                                                         experience INTEGER DEFAULT 0,
                                                         current_level_id INTEGER DEFAULT 1,
                                                         on_boarding INTEGER DEFAULT 1,
                                                         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`);


            // XP Transactions table (New for User Story #25)
            // The UNIQUE constraint on user_id, activity_type, and activity_id prevents duplicate XP awards
            db.run(`CREATE TABLE IF NOT EXISTS xp_transactions (
                                                                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                   user_id INTEGER NOT NULL,
                                                                   activity_type TEXT NOT NULL,
                                                                   activity_id INTEGER NOT NULL,
                                                                   xp_amount INTEGER NOT NULL,
                                                                   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                                   UNIQUE(user_id, activity_type, activity_id),
                FOREIGN KEY (user_id) REFERENCES users (id)
                )`);

            // Rewards table (already present, added for verification)
            db.run(`CREATE TABLE IF NOT EXISTS rewards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                level_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE ON UPDATE CASCADE
            )`);

            // User Rewards table (already present, added for verification)
            db.run(`CREATE TABLE IF NOT EXISTS user_rewards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                reward_id INTEGER NOT NULL,
                unlocked_at TEXT NOT NULL,
                UNIQUE (user_id, reward_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE ON UPDATE CASCADE
            )`);
        });
    }
});

export default db;
