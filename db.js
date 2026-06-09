// C:/Users/ashfa/Development/TLE4/PIP-API/db.js
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./Database/pip.sqlite', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the PIP SQLite database.');
    }
});

// Run this immediately; sqlite3 will queue these to run first
db.serialize(() => {
    // --- 1. Educational Content ---
    db.run(`CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        difficulty_level TEXT,
        is_published INTEGER DEFAULT 0,
        order_index INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        tip TEXT,
        image_url TEXT,
        estimated_minutes INTEGER,
        order_index INTEGER,
        is_published INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES modules(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_id INTEGER,
        question_text TEXT NOT NULL,
        question_type TEXT,
        explanation TEXT,
        order_index INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        answer_text TEXT NOT NULL,
        is_correct INTEGER,
        order_index INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id)
    )`);

    // --- 2. User Management & Gamification ---
    db.run(`CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level_number INTEGER UNIQUE NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        digital_skill_level TEXT DEFAULT 'beginner',
        experience INTEGER DEFAULT 0,
        current_level_id INTEGER DEFAULT 0,
        on_boarding INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (current_level_id) REFERENCES levels(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_streaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        current_streak INTEGER DEFAULT 0,
        highest_streak INTEGER DEFAULT 0,
        last_active_date DATE,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        FOREIGN KEY (level_id) REFERENCES levels(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        reward_id INTEGER,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (reward_id) REFERENCES rewards(id),
        UNIQUE(user_id, reward_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS hamsterverse (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level_user INTEGER,
        user_rewards INTEGER,
        FOREIGN KEY (level_user) REFERENCES users(id),
        FOREIGN KEY (user_rewards) REFERENCES user_rewards(id)
    )`);

    // --- 3. User Progress & History ---
    db.run(`CREATE TABLE IF NOT EXISTS user_course_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        course_id INTEGER,
        status TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id),
        UNIQUE(user_id, course_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        lesson_id INTEGER,
        status TEXT,
        completed INTEGER DEFAULT 0,
        completed_at DATETIME,
        last_opened_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (lesson_id) REFERENCES lessons(id),
        UNIQUE(user_id, lesson_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS lesson_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        lesson_id INTEGER,
        score INTEGER,
        total_questions INTEGER,
        passed INTEGER,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS lesson_attempt_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_attempt_id INTEGER,
        question_id INTEGER,
        answer_id INTEGER,
        is_correct INTEGER,
        answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_attempt_id) REFERENCES lesson_attempts(id),
        FOREIGN KEY (question_id) REFERENCES questions(id),
        FOREIGN KEY (answer_id) REFERENCES answers(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS xp_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        activity_id INTEGER NOT NULL,
        xp_amount INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, activity_type, activity_id)
    )`);
});

export default db;