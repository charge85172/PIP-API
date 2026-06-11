import db from './db.js';

console.log("Ff seeden hoor brb...");

db.serialize(() => {
    console.log("buhbye old data...");

    // Disable foreign keys temporarily to allow cleaning in any order
    db.run("PRAGMA foreign_keys = OFF");

    const tables = [
        'answers',
        'questions',
        'lessons',
        'modules',
        'courses', // Toegevoegd zodat ook de courses tabel wordt schoongeveegd
        'user_rewards',
        'rewards',
        'user_streaks',
        'hamsterverse',
        'user_progress',
        'lesson_attempts',
        'lesson_attempt_answers',
        'xp_transactions',
        'users',
        'levels'
    ];

    // Delete all data from tables
    tables.forEach(table => {
        db.run(`DELETE FROM ${table}`);
    });

    // Reset auto-increment counters
    db.run("DELETE FROM sqlite_sequence");

    // Re-enable foreign keys
    db.run("PRAGMA foreign_keys = ON");

    console.log("nice, nu ff seeden...");

    // 1. Levels
    const levelStmt = db.prepare(`INSERT OR IGNORE INTO levels (id, level_number) VALUES (?, ?)`);
    [1, 2, 3, 4, 5].forEach(i => levelStmt.run(i, i));
    levelStmt.finalize();

    // 2. Rewards
    const rewardStmt = db.prepare(`INSERT OR IGNORE INTO rewards (id, level_id, title, description, image_url) VALUES (?, ?, ?, ?, ?)`);
    rewardStmt.run(1, 1, 'Feeder', 'Hungry hamster!', '/images/rewards/feeder.png');
    rewardStmt.run(2, 2, 'Hamsterwheel', 'Workout time!', '/images/rewards/wheel.png');
    rewardStmt.finalize();

    // 3. Courses
    const courseStmt = db.prepare(`INSERT OR IGNORE INTO courses (id, title, description, difficulty_level, is_published, order_index) VALUES (?, ?, ?, ?, ?, ?)`);
    courseStmt.run(1, 'modules', 'first module', 'beginner', 1, 1);
    courseStmt.finalize();

    // --- MODULES ---
    // Verbeterd: 'course_id' toegevoegd aan de kolommen en de VALUES
    const moduleStmt = db.prepare(`INSERT OR IGNORE INTO modules (id, course_id, title, description, order_index) VALUES (?, ?, ?, ?, ?)`);
    // Verbeterd: Het cijfer 1 meegegeven als tweede argument om te koppelen aan course 1
    moduleStmt.run(1, 1, 'Social Media Basics', 'Discover the world of social media — learn how the most popular platforms work and how to use them safely and confidently.', 1);
    moduleStmt.run(2, 1, 'General Knowledge', 'Test and expand your understanding of the digital world with a variety of general knowledge questions.', 2);
    moduleStmt.finalize();

    // --- LESSONS ---
    const lessonStmt = db.prepare(`INSERT OR IGNORE INTO lessons (id, module_id, title, description, tip, image_url, estimated_minutes, order_index, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // Lessons for Module 1: Social Media Basics
    lessonStmt.run(1, 1, 'Social media', 'Learn the essential terms and concepts you need to navigate social media safely.', "Cybercriminals are getting smarter every day. They use fake messages, urgent requests, and familiar faces to trick you into acting fast — before you can think. Whether it's a suspicious text, a LinkedIn request, or a WhatsApp message from an 'unknown' number asking for money: always pause, verify, and think critically. When something feels off, it probably is. Protect yourself and others by staying alert online.", null, 8, 1, 1);
    lessonStmt.run(2, 1, 'Advertisements', 'Learn how advertisements and scams work on social media — discover how to recognise suspicious content, avoid', "Not everything you see online is what it seems. Scammers use eye-catching ads, fake pop-ups, and too-good-to-be-true job offers to lure you in. Before you click, download, or share anything — ask yourself: does this make sense? Legitimate companies never ask you to download unknown apps to make a payment, and no website randomly gives away free iPhones. Stay sceptical, protect your data, and think twice before you act.", null, 8, 2, 1);

    // Lessons for Module 2: General Knowledge
    lessonStmt.run(3, 2, 'Digital Actions', 'Develop practical digital skills by learning how to perform common online tasks safely and efficiently.', "Before performing any digital action online—such as logging in, sharing information, or downloading files—always take a moment to check if the source is trustworthy and the action is necessary. Small habits like verifying links, using secure passwords, and double-checking permissions can greatly reduce the risk of scams, data loss, and privacy issues.", null, 10, 1, 1);
    lessonStmt.run(4, 2, 'Digital Basics', 'Learn the essential terms and concepts that help you safe online.', "Digital basics start with understanding how to safely and effectively use everyday technology. Always keep your devices updated, use strong and unique passwords, and be careful about what personal information you share online. Building these simple habits helps you stay secure and confident in the digital world.", null, 8, 2, 1);
    lessonStmt.finalize();

    // --- QUESTIONS & ANSWERS ---
    const qStmt = db.prepare(`INSERT OR IGNORE INTO questions (id, lesson_id, question_text, question_type, explanation, image_url, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const aStmt = db.prepare(`INSERT OR IGNORE INTO answers (id, question_id, answer_text, is_correct, order_index) VALUES (?, ?, ?, ?, ?)`);

    // Lesson 1
    qStmt.run(1, 1, 'Smishing is best described as...', 'multiple_choice', 'Smishing is a type of phishing that comes as a text message, often with a link or a phone number to call.', null, 1);
    aStmt.run(1, 1, 'Phishing over SMS or text messages', 1, 1);
    aStmt.run(2, 1, 'A virus that spreads via Bluetooth', 0, 2);
    aStmt.run(3, 1, 'A scam using only phone calls', 0, 3);
    aStmt.run(4, 1, 'A type of password manager', 0, 4);

    qStmt.run(2, 1, 'Which term matches this phishing message?', 'multiple_choice', 'This is a typical \'friend in need\' WhatsApp message used to steal money.', '/images/questions/whatsapp_fraude.png', 2);
    aStmt.run(5, 2, 'Helpdesk fraud', 0, 1);
    aStmt.run(6, 2, 'WhatsApp fraud', 1, 2);
    aStmt.run(7, 2, 'Phone Spoofing', 0, 3);
    aStmt.run(8, 2, 'Skimming', 0, 4);

    qStmt.run(3, 1, 'Your child sees a dangerous online challenge that many classmates are trying. What is the best response?', 'multiple_choice', 'When your child encounters dangerous online challenges, the most important thing is to start the conversation. Talk about peer pressure and the risks involved, so your child learns to think critically and say no. Ignoring or encouraging it won\'t help — open communication will.', null, 3);
    aStmt.run(9, 3, 'Encourage them to try it once for fun.', 0, 1);
    aStmt.run(10, 3, 'Talk about peer pressure and the possible risks involved.', 1, 2);
    aStmt.run(11, 3, 'Ignore the situation completely.', 0, 3);

    qStmt.run(4, 1, 'How can one avoid falling victim to LinkedIn scams?', 'multiple_choice', 'Always carefully check profiles before accepting connection requests on LinkedIn. Scammers use fake profiles to steal personal information or lure you with unrealistic job offers — so think before you connect.', null, 4);
    aStmt.run(12, 4, 'Accept all connection requests from strangers to expand the network', 0, 1);
    aStmt.run(13, 4, 'Carefully scrutinize the profiles and backgrounds of those sending connection requests', 1, 2);
    aStmt.run(14, 4, 'Share personal and company information directly on LinkedIn with those who send connection requests', 0, 3);
    aStmt.run(15, 4, 'Engage deeply with anyone who claims to offer high-paying jobs', 0, 4);

    qStmt.run(5, 1, 'You receive a text message warning you that your bank account has been suspended. It says that you must click on the link in the SMS and update your credentials within the next 24 hours. Is this message safe or unsafe?', 'true_false', 'This is a classic phishing scam. Legitimate banks never ask you to click a link via SMS to update your credentials. The urgency ("within 24 hours") is a pressure tactic to make you act without thinking. Always contact your bank directly through their official website or phone number', null, 5);
    aStmt.run(16, 5, 'Safe', 0, 1);
    aStmt.run(17, 5, 'Unsafe', 1, 2);

    // Lesson 2
    qStmt.run(6, 2, 'Malvertising refers to...', 'multiple_choice', 'Malvertising is when online ads are used to trick you into downloading harmful files or visiting fake websites.', null, 1);
    aStmt.run(18, 6, 'Malware hidden in online advertisements', 1, 1);
    aStmt.run(19, 6, 'A marketing plan for security teams', 0, 2);
    aStmt.run(20, 6, 'Spam sent through calendar invites', 0, 3);
    aStmt.run(21, 6, 'A firewall configuration issue', 0, 4);

    qStmt.run(7, 2, 'An advertisement for cheap cleaning services appears on your Facebook newsfeed. You contact the company and you are instructed to download an application to make the payment. What should you do?', 'multiple_choice', 'Be careful of fake advertisements posted on social media sites. Scammers may use these advertisements to trick you into downloading a malware onto your device.', null, 2);
    aStmt.run(22, 7, 'Download the application as instructed.', 0, 1);
    aStmt.run(23, 7, 'Share this advertisement with my family and friends so that they can enjoy the attractive rates.', 0, 2);
    aStmt.run(24, 7, 'Ignore request to download application and stop further contact with the company', 1, 3);

    qStmt.run(8, 2, 'When visiting your favorite website, a pop-up appears that reads "You have won a free Apple iPod!" What should you do?', 'multiple_choice', 'If a pop-up claims you\'ve won a free prize, don\'t click it. These are common online scams designed to steal your personal information or install malware on your device. No website randomly gives away free products. Close it immediately and report it if you can.', null, 3);
    aStmt.run(25, 8, 'Click the pop-up, enter your information and claim the prize', 0, 1);
    aStmt.run(26, 8, 'Share the link with all your friends and family so that they too can get free stuff', 0, 2);
    aStmt.run(27, 8, 'Do not click the pop-up - close it, and if possible, report it to an administrative contact on the page you were on', 1, 3);

    qStmt.run(9, 2, 'You receive an unsolicited job offer via messaging apps (Telegram, WhatsApp etc) that promises high commissions for receiving and transferring money. What should you do next?', 'multiple_choice', 'Be careful of unsolicited job offers promising high commissions with very little effort. Do not transfer money to people you have not met in person or pay upfront for a job.', null, 4);
    aStmt.run(28, 9, 'Reply to the sender to find out more about the job offer.', 0, 1);
    aStmt.run(29, 9, 'Ignore and block the sender.', 1, 2);
    aStmt.run(30, 9, 'Share it with my family and friends so we can all earn high pay from an easy job.', 0, 3);

    qStmt.run(10, 2, 'What does a “digital footprint” mean?', 'multiple_choice', 'Your digital footprint is everything you leave behind online — posts, likes, searches, and website visits. Think before you share, because it can last a long time and be seen by others', null, 5);
    aStmt.run(31, 10, 'How fast someone can type online.', 0, 1);
    aStmt.run(32, 10, 'All the information and actions a person leaves behind online.', 1, 2);
    aStmt.run(33, 10, 'A password for social media accounts.', 0, 3);

    // Lesson 3
    qStmt.run(11, 3, 'Which is the strongest password option?', 'multiple_choice', 'Longer passwords are better than complicated ones. A long passphrase is both harder to break and easier to remember.', null, 1);
    aStmt.run(34, 11, 'Summer2026!', 0, 1);
    aStmt.run(35, 11, 'Password123', 0, 2);
    aStmt.run(36, 11, 'PeterPassword@!', 0, 3);
    aStmt.run(37, 11, 'ocean-camping-mango-satellite-47', 1, 4);

    qStmt.run(12, 3, 'A best practice for using mobile devices is to update software and apps every three years.', 'true_false', 'Updating software and apps every three years is not considered a best practice because security vulnerabilities, bugs, and performance issues are discovered regularly. Software updates often contain important security patches that protect devices from new threats. Waiting three years to update can leave a device exposed to malware, cyberattacks, and compatibility problems. A better practice is to install updates as soon as they become available or enable automatic updates whenever possible.', null, 2);
    aStmt.run(38, 12, 'True', 0, 1);
    aStmt.run(39, 12, 'False', 1, 2);

    qStmt.run(13, 3, 'You receive an email asking you to urgently reset your password using a link. What is the safest first step?', 'multiple_choice', 'Phishing links may lead you to fake login pages. Always go to the real site by typing the address yourself, not by clicking links in messages.', null, 3);
    aStmt.run(40, 13, 'Click the link, then change it quickly', 0, 1);
    aStmt.run(41, 13, 'Go to the official site by typing the address yourself', 1, 2);
    aStmt.run(42, 13, 'Reply and ask if it is real', 0, 3);
    aStmt.run(43, 13, 'Forward it to a coworker to check if it\'s a legit request', 0, 4);

    qStmt.run(14, 3, 'Scanning all email attachments before opening them is an effective way to help prevent viruses and malicious code.', 'true_false', 'Email attachments are a common way for viruses, malware, and other malicious code to spread. Scanning attachments with security software before opening them can help detect and block harmful files before they infect your device. While no method provides complete protection, regularly scanning email attachments is an important cybersecurity best practice that reduces the risk of malware infections.', null, 4);
    aStmt.run(44, 14, 'True', 1, 1);
    aStmt.run(45, 14, 'False', 0, 2);

    qStmt.run(15, 3, 'Which of the following are best practices for using AI services?', 'multiple_choice', 'When using AI tools, it is important to follow safe and responsible practices to protect your privacy and data. This includes reading and understanding the service’s privacy policy, avoiding the use of sensitive or confidential information such as company names or customer data, and staying alert to fake AI apps or browser extensions. Together, these practices help ensure safe, secure, and responsible use of AI technology.', null, 5);
    aStmt.run(46, 15, 'Read and understand the data privacy policy of the relevant service provider before using the service', 0, 1);
    aStmt.run(47, 15, 'Avoid mentioning company names, personnel, or customers when using AI tools', 0, 2);
    aStmt.run(48, 15, 'Beware of fake AI apps and browser extensions', 0, 3);
    aStmt.run(49, 15, 'All of the above', 1, 4);

    // Lesson 4
    qStmt.run(16, 4, 'What is \'social engineering\'?', 'multiple_choice', 'Social engineering exploits human traits such as curiosity, trust, greed, fear or ignorance. Criminals fish for confidential information in order to maintain a weak link in your security.', null, 1);
    aStmt.run(50, 16, 'Creating a clear profile on social media channels', 0, 1);
    aStmt.run(51, 16, 'Multidisciplinary collaboration on a software project', 0, 2);
    aStmt.run(52, 16, 'Extracting personal information through personal contact, via a trust-inspiring email or smooth talk', 1, 3);
    aStmt.run(53, 16, 'Building a network of social contacts', 0, 4);

    qStmt.run(17, 4, 'Multi factor authentication (MFA) helps most because it adds an extra check beyond your password', 'true_false', 'If someone gets your password, MFA still protects you by asking for something else, like a code or prompt, before letting anyone in.', null, 2);
    aStmt.run(54, 17, 'True', 1, 1);
    aStmt.run(55, 17, 'False', 0, 2);

    qStmt.run(18, 4, 'Which statement about phishing is correct?', 'multiple_choice', 'Phising is also known as \'social engineering\'. You can be deceived into giving your password, transferring money or installing malicious software with a click on a link. Criminals are increasingly succeeding in spelling phishing messages correctly. A spam filter can certainly help block phishing emails. Unfortunately it does not guarantee that a phishing message will never get through.', null, 3);
    aStmt.run(56, 18, 'Phishing only occurs in emails', 0, 1);
    aStmt.run(57, 18, 'Phishing is dangerous but you can easily recognize it by language errors', 0, 2);
    aStmt.run(58, 18, 'With a good spam filter you will not become a victim of phishing', 0, 3);
    aStmt.run(59, 18, 'With phishing, someone is deceived into disclosing information or performing actions', 1, 4);

    qStmt.run(19, 4, 'A common sign of a phishing email is...', 'multiple_choice', 'Attackers often try to rush you so you don’t have time to think. Feeling pressured is a big warning sign.', null, 4);
    aStmt.run(60, 19, 'It creates urgency and pushes you to act fast', 1, 1);
    aStmt.run(61, 19, 'It uses your name', 0, 2);
    aStmt.run(62, 19, 'It contains perfect spelling', 0, 3);
    aStmt.run(63, 19, 'It is sent during business hours', 0, 4);

    qStmt.run(20, 4, 'Which relationship between phishing and ransomware is correct?', 'multiple_choice', 'ransomware is hostage software that can be placed in your systems after a successful phishing attack. It \'holds hostage\' your files and asks you to pay a ransom.', null, 5);
    aStmt.run(64, 20, 'Ransomware is a variant of phishing', 0, 1);
    aStmt.run(65, 20, 'To prevent phishing you need reliable ransomware', 0, 2);
    aStmt.run(66, 20, 'Ransomware can follow a successful phishing attack', 1, 3);
    aStmt.run(67, 20, 'Phishing is a type of ransomware', 0, 4);

    qStmt.finalize();
    aStmt.finalize();

    db.run("SELECT 1", [], () => {
        console.log("klaar wlehhh :p");
    });
});