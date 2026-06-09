// C:/Users/ashfa/Development/TLE4/PIP-API/seed.js
import db from './db.js';

console.log("Starting Seeding process...");

db.serialize(() => {
    // 1. Levels
    const levelStmt = db.prepare(`INSERT OR IGNORE INTO levels (id, level_number) VALUES (?, ?)`);
    [1, 2, 3, 4, 5].forEach(i => levelStmt.run(i, i));
    levelStmt.finalize();

    // 2. Rewards
    const rewardStmt = db.prepare(`INSERT OR IGNORE INTO rewards (id, level_id, title, description, image_url) VALUES (?, ?, ?, ?, ?)`);
    rewardStmt.run(1, 1, 'Feeder', 'Hungry hamster!', '/images/feeder.png');
    rewardStmt.run(2, 2, 'Hamsterwheel', 'Workout time!', '/images/wheel.png');
    rewardStmt.finalize();

    // 3. Courses -> Modules -> Lessons
    db.run(`INSERT OR IGNORE INTO courses (id, title, difficulty_level, is_published) VALUES (1, 'Privacy', 'beginner', 1)`);
    db.run(`INSERT OR IGNORE INTO modules (id, course_id, title) VALUES (1, 1, 'Safety')`);
    db.run(`INSERT OR IGNORE INTO lessons (id, module_id, title, tip) VALUES (1, 1, 'Passwords', 'Use 12+ chars')`);

    // 4. Questions -> Answers
    db.run(`INSERT OR IGNORE INTO questions (id, lesson_id, question_text, explanation) VALUES (1, 1, 'Strong Password?', 'Length matters!')`);
    db.run(`INSERT OR IGNORE INTO answers (id, question_id, answer_text, is_correct) VALUES (1, 1, '12 Characters', 1)`);
    db.run(`INSERT OR IGNORE INTO answers (id, question_id, answer_text, is_correct) VALUES (2, 1, 'Password123', 0)`);

    // A final command to log success once the queue is clear
    db.run("SELECT 1", [], () => {
        console.log("Seeding Database successfully completed.");
    });
});