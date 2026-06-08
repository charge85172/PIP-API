import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./Database/pip.sqlite', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the PIP SQLite database.');

        db.serialize(() => {
            // Gebruikers tabel (reeds aanwezig, toegevoegd ter controle)
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

            // XP Transacties tabel (Nieuw voor User Story #25)
            // De UNIQUE constraint op user_id, activity_type en activity_id voorkomt dubbele XP
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
        });
    }
});

export default db;