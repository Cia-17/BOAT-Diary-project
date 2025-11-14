
-- ============================================
-- A DAY IN MY LIFE - DATABASE SCHEMA
-- Digital Diary Web Application
-- Team 11: Donna, Leslie, Lawrencia, Shepherd
-- ============================================

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS DAILY_QUOTES;
DROP TABLE IF EXISTS MEDIA_FILES;
DROP TABLE IF EXISTS ENTRIES;
DROP TABLE IF EXISTS USER_SESSIONS;
DROP TABLE IF EXISTS MOODS;
DROP TABLE IF EXISTS QUOTES;
DROP TABLE IF EXISTS USERS;

-- ============================================
-- TABLE 1: USERS
-- Stores registered user account information
-- ============================================
CREATE TABLE USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_picture_url VARCHAR(500) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME DEFAULT NULL,
    
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 2: USER_SESSIONS
-- Manages active user sessions for authentication
-- ============================================
CREATE TABLE USER_SESSIONS (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(500) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(500) DEFAULT NULL,
    
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 3: MOODS
-- Predefined mood categories for tracking
-- ============================================
CREATE TABLE MOODS (
    mood_id INT AUTO_INCREMENT PRIMARY KEY,
    mood_name VARCHAR(50) NOT NULL UNIQUE,
    mood_emoji VARCHAR(10) DEFAULT NULL,
    mood_color VARCHAR(7) DEFAULT NULL,
    mood_description TEXT DEFAULT NULL,
    
    INDEX idx_mood_name (mood_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 4: ENTRIES
-- Stores diary entry records
-- ============================================
CREATE TABLE ENTRIES (
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mood_id INT NOT NULL,
    entry_text TEXT NOT NULL,
    entry_date DATE NOT NULL,
    entry_time TIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (mood_id) REFERENCES MOODS(mood_id) ON DELETE RESTRICT,
    
    INDEX idx_user_id (user_id),
    INDEX idx_entry_date (entry_date),
    INDEX idx_user_date (user_id, entry_date),
    INDEX idx_user_deleted (user_id, is_deleted),
    INDEX idx_mood_id (mood_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 5: MEDIA_FILES
-- Stores metadata for uploaded media
-- ============================================
CREATE TABLE MEDIA_FILES (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    entry_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    media_category ENUM('image', 'audio', 'video') NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (entry_id) REFERENCES ENTRIES(entry_id) ON DELETE CASCADE,
    
    INDEX idx_entry_id (entry_id),
    INDEX idx_media_category (media_category),
    
    CHECK (file_size > 0 AND file_size <= 52428800), -- Max 50MB
    CHECK (media_category IN ('image', 'audio', 'video'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 6: QUOTES
-- Repository of motivational quotes
-- ============================================
CREATE TABLE QUOTES (
    quote_id INT AUTO_INCREMENT PRIMARY KEY,
    quote_text TEXT NOT NULL,
    author VARCHAR(100) DEFAULT NULL,
    category VARCHAR(50) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_is_active (is_active),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 7: DAILY_QUOTES
-- Tracks which quotes were shown to users
-- ============================================
CREATE TABLE DAILY_QUOTES (
    daily_quote_id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT NOT NULL,
    user_id INT NOT NULL,
    display_date DATE NOT NULL,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quote_id) REFERENCES QUOTES(quote_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_date (user_id, display_date),
    INDEX idx_user_id (user_id),
    INDEX idx_display_date (display_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert predefined moods
INSERT INTO MOODS (mood_name, mood_emoji, mood_color, mood_description) VALUES
('Happy', '😊', '#FFD700', 'Feeling joyful and content'),
('Sad', '😢', '#4169E1', 'Feeling down or melancholic'),
('Excited', '🤩', '#FF6347', 'Feeling enthusiastic and energized'),
('Tired', '😴', '#A9A9A9', 'Feeling exhausted or sleepy'),
('Motivated', '💪', '#32CD32', 'Feeling driven and determined'),
('Anxious', '😰', '#9370DB', 'Feeling worried or nervous'),
('Calm', '😌', '#87CEEB', 'Feeling peaceful and relaxed'),
('Angry', '😠', '#DC143C', 'Feeling frustrated or upset'),
('Grateful', '🙏', '#FF69B4', 'Feeling thankful and appreciative'),
('Reflective', '🤔', '#DDA0DD', 'Feeling thoughtful and introspective');

-- Insert sample motivational quotes
INSERT INTO QUOTES (quote_text, author, category, is_active) VALUES
('The only way to do great work is to love what you do.', 'Steve Jobs', 'motivation', TRUE),
('Believe you can and you''re halfway there.', 'Theodore Roosevelt', 'inspiration', TRUE),
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'perseverance', TRUE),
('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'dreams', TRUE),
('It does not matter how slowly you go as long as you do not stop.', 'Confucius', 'persistence', TRUE),
('Everything you''ve ever wanted is on the other side of fear.', 'George Addair', 'courage', TRUE),
('Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.', 'Roy T. Bennett', 'self-belief', TRUE),
('The only impossible journey is the one you never begin.', 'Tony Robbins', 'action', TRUE),
('Your limitation—it''s only your imagination.', 'Anonymous', 'mindset', TRUE),
('Great things never come from comfort zones.', 'Anonymous', 'growth', TRUE),
('Dream it. Wish it. Do it.', 'Anonymous', 'achievement', TRUE),
('Success doesn''t just find you. You have to go out and get it.', 'Anonymous', 'ambition', TRUE),
('The harder you work for something, the greater you''ll feel when you achieve it.', 'Anonymous', 'hard work', TRUE),
('Dream bigger. Do bigger.', 'Anonymous', 'aspiration', TRUE),
('Don''t stop when you''re tired. Stop when you''re done.', 'Anonymous', 'endurance', TRUE),
('Wake up with determination. Go to bed with satisfaction.', 'Anonymous', 'dedication', TRUE),
('Do something today that your future self will thank you for.', 'Sean Patrick Flanery', 'future', TRUE),
('Little things make big days.', 'Anonymous', 'gratitude', TRUE),
('It''s going to be hard, but hard does not mean impossible.', 'Anonymous', 'resilience', TRUE),
('Don''t wait for opportunity. Create it.', 'Anonymous', 'initiative', TRUE);

-- ============================================
-- SAMPLE USER DATA (for testing purposes)
-- Password: 'password123' hashed with bcrypt
-- ============================================
INSERT INTO USERS (email, password_hash, first_name, last_name) VALUES
('donna.omaboe@ashesi.edu.gh', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Donna', 'Omaboe'),
('leslie.tettey@ashesi.edu.gh', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Leslie', 'Tettey'),
('lawrencia.kyei@ashesi.edu.gh', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lawrencia', 'Kyei'),
('shepherd.adiko@ashesi.edu.gh', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Shepherd', 'Adiko');

-- ============================================
-- SAMPLE DIARY ENTRIES (for testing)
-- ============================================
INSERT INTO ENTRIES (user_id, mood_id, entry_text, entry_date, entry_time) VALUES
(1, 1, 'Today was an amazing day! I finished my Web Technologies project proposal and felt really proud of our team''s work. We came up with a great idea for a digital diary application.', '2025-10-04', '18:30:00'),
(1, 5, 'Feeling super motivated today. Started working on the database design for our project. The ERD is coming together nicely and I can''t wait to start coding!', '2025-10-05', '14:15:00'),
(2, 7, 'Had a calm and productive study session at the library. Sometimes silence is exactly what you need to focus. Made great progress on my algorithms assignment.', '2025-10-04', '16:45:00'),
(3, 9, 'Grateful for my amazing team members. We had our first project meeting and everyone contributed such creative ideas. This semester is going to be great!', '2025-10-03', '20:00:00');

-- ============================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- ============================================

-- View: User Entry Count and Latest Entry
CREATE VIEW user_entry_stats AS
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(e.entry_id) AS total_entries,
    MAX(e.entry_date) AS last_entry_date
FROM USERS u
LEFT JOIN ENTRIES e ON u.user_id = e.user_id AND e.is_deleted = FALSE
GROUP BY u.user_id, u.first_name, u.last_name, u.email;

-- View: Mood Distribution per User
CREATE VIEW user_mood_distribution AS
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    m.mood_name,
    m.mood_emoji,
    COUNT(e.entry_id) AS mood_count,
    ROUND((COUNT(e.entry_id) * 100.0 / (
        SELECT COUNT(*) 
        FROM ENTRIES 
        WHERE user_id = u.user_id AND is_deleted = FALSE
    )), 2) AS mood_percentage
FROM USERS u
JOIN ENTRIES e ON u.user_id = e.user_id
JOIN MOODS m ON e.mood_id = m.mood_id
WHERE e.is_deleted = FALSE
GROUP BY u.user_id, u.first_name, u.last_name, m.mood_name, m.mood_emoji
ORDER BY u.user_id, mood_count DESC;

-- View: Recent Entries with Media Count
CREATE VIEW recent_entries_with_media AS
SELECT 
    e.entry_id,
    e.user_id,
    u.first_name,
    u.last_name,
    e.entry_date,
    e.entry_time,
    m.mood_name,
    m.mood_emoji,
    LEFT(e.entry_text, 100) AS entry_preview,
    COUNT(mf.media_id) AS media_count
FROM ENTRIES e
JOIN USERS u ON e.user_id = u.user_id
JOIN MOODS m ON e.mood_id = m.mood_id
LEFT JOIN MEDIA_FILES mf ON e.entry_id = mf.entry_id
WHERE e.is_deleted = FALSE
GROUP BY e.entry_id, e.user_id, u.first_name, u.last_name, 
         e.entry_date, e.entry_time, m.mood_name, m.mood_emoji, e.entry_text
ORDER BY e.entry_date DESC, e.entry_time DESC
LIMIT 50;

-- ============================================
-- USEFUL STORED PROCEDURES
-- ============================================

-- Procedure: Get Random Quote for User (avoids recent duplicates)
DELIMITER //
CREATE PROCEDURE get_daily_quote(IN p_user_id INT)
BEGIN
    SELECT q.quote_id, q.quote_text, q.author, q.category
    FROM QUOTES q
    WHERE q.is_active = TRUE
    AND q.quote_id NOT IN (
        SELECT quote_id 
        FROM DAILY_QUOTES 
        WHERE user_id = p_user_id 
        AND display_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    )
    ORDER BY RAND()
    LIMIT 1;
END //
DELIMITER ;

-- Procedure: Get User Mood Statistics
DELIMITER //
CREATE PROCEDURE get_user_mood_stats(
    IN p_user_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        m.mood_name,
        m.mood_emoji,
        m.mood_color,
        COUNT(e.entry_id) AS count,
        ROUND((COUNT(e.entry_id) * 100.0 / (
            SELECT COUNT(*) 
            FROM ENTRIES 
            WHERE user_id = p_user_id 
            AND is_deleted = FALSE
            AND entry_date BETWEEN p_start_date AND p_end_date
        )), 2) AS percentage
    FROM MOODS m
    LEFT JOIN ENTRIES e ON m.mood_id = e.mood_id 
        AND e.user_id = p_user_id 
        AND e.is_deleted = FALSE
        AND e.entry_date BETWEEN p_start_date AND p_end_date
    GROUP BY m.mood_id, m.mood_name, m.mood_emoji, m.mood_color
    HAVING count > 0
    ORDER BY count DESC;
END //
DELIMITER ;

-- Procedure: Clean Expired Sessions
DELIMITER //
CREATE PROCEDURE clean_expired_sessions()
BEGIN
    DELETE FROM USER_SESSIONS
    WHERE expires_at < NOW();
    
    SELECT ROW_COUNT() AS deleted_sessions;
END //
DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update user's last_login on new session
DELIMITER //
CREATE TRIGGER update_last_login
AFTER INSERT ON USER_SESSIONS
FOR EACH ROW
BEGIN
    UPDATE USERS
    SET last_login = NEW.created_at
    WHERE user_id = NEW.user_id;
END //
DELIMITER ;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Display success message
SELECT 'Database schema created successfully!' AS status;