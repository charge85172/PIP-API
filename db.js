import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./pip_app.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the PIP SQLite database.');

        // Ensure the users table exists with a UNIQUE constraint on email
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 name TEXT NOT NULL,
                                                 email TEXT UNIQUE NOT NULL,
                                                 password TEXT NOT NULL,
                                                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
});

export default db;