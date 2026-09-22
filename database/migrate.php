<?php
require_once __DIR__ . '/../config/helpers.php';

header('Content-Type: application/json');

$db = getDB();

function ensureColumn(PDO $db, $table, $column, $definition) {
    if (!columnExists($db, $table, $column)) {
        $db->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
    }
}

try {
    $db->exec("ALTER TABLE users MODIFY COLUMN role ENUM('student','faculty','guest','admin') NOT NULL DEFAULT 'student'");
} catch (Exception $e) {}

ensureColumn($db, 'users', 'status', "ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved'");
ensureColumn($db, 'users', 'cover_photo', "VARCHAR(255) DEFAULT NULL");

ensureColumn($db, 'posts', 'group_id', "INT DEFAULT NULL");
ensureColumn($db, 'comments', 'parent_id', "INT DEFAULT NULL");
ensureColumn($db, 'clubs', 'owner_id', "INT DEFAULT NULL");
ensureColumn($db, 'events', 'club_id', "INT DEFAULT NULL");
ensureColumn($db, 'announcements', 'club_id', "INT DEFAULT NULL");

if (!tableExists($db, 'notifications')) {
    $db->exec("
        CREATE TABLE notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(200) NOT NULL,
            body TEXT DEFAULT NULL,
            link VARCHAR(255) DEFAULT NULL,
            is_read TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
}

if (!tableExists($db, 'verification_queue')) {
    $db->exec("
        CREATE TABLE verification_queue (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            requested_role VARCHAR(50) NOT NULL,
            status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
}

if (!tableExists($db, 'connections')) {
    $db->exec("
        CREATE TABLE connections (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            connected_user_id INT NOT NULL,
            status ENUM('pending', 'accepted') NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_conn (user_id, connected_user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (connected_user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
}

if (!tableExists($db, 'messages')) {
    $db->exec("
        CREATE TABLE messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NOT NULL,
            content TEXT NOT NULL,
            message_type VARCHAR(20) DEFAULT 'text',
            is_read TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
}

if (!tableExists($db, 'blocked_users')) {
    $db->exec("
        CREATE TABLE blocked_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            blocker_id INT NOT NULL,
            blocked_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_block (blocker_id, blocked_id),
            FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
}

if (!tableExists($db, 'announcement_likes')) {
    $db->exec("
        CREATE TABLE announcement_likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            announcement_id INT NOT NULL,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_ann_like (announcement_id, user_id),
            FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
}

if (!tableExists($db, 'announcement_comments')) {
    $db->exec("
        CREATE TABLE announcement_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            announcement_id INT NOT NULL,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
}

try {
    $db->exec("ALTER TABLE club_members MODIFY COLUMN role ENUM('member','admin','owner','requested') DEFAULT 'member'");
} catch (Exception $e) {}

$db->exec("UPDATE users SET status = 'approved' WHERE status IS NULL OR status = ''");
$db->exec("UPDATE clubs SET owner_id = 6 WHERE id = 1 AND owner_id IS NULL");
$db->exec("UPDATE clubs SET owner_id = 2 WHERE id = 2 AND owner_id IS NULL");
$db->exec("UPDATE clubs SET owner_id = 5 WHERE id = 3 AND owner_id IS NULL");
$db->exec("UPDATE clubs SET owner_id = 4 WHERE id = 4 AND owner_id IS NULL");
$db->exec("UPDATE clubs SET owner_id = 2 WHERE id = 5 AND owner_id IS NULL");
$db->exec("UPDATE clubs SET owner_id = 5 WHERE id = 6 AND owner_id IS NULL");

$memberCount = $db->query("SELECT COUNT(*) AS c FROM group_members")->fetch()['c'];
if ((int) $memberCount === 0) {
    $db->exec("INSERT IGNORE INTO group_members (group_id, user_id, role) VALUES (1,6,'admin'),(3,6,'member'),(1,2,'member'),(1,3,'member'),(3,2,'admin')");
}

$clubMemberCount = $db->query("SELECT COUNT(*) AS c FROM club_members")->fetch()['c'];
if ((int) $clubMemberCount === 0) {
    $db->exec("INSERT IGNORE INTO club_members (club_id, user_id, role) VALUES
        (1,6,'owner'),(2,2,'owner'),(3,5,'owner'),(4,4,'owner'),(5,2,'owner'),(6,5,'owner'),
        (1,3,'member'),(2,6,'member'),(4,3,'member')");
}

$clubEventCount = $db->query("SELECT COUNT(*) AS c FROM events WHERE club_id IS NOT NULL")->fetch()['c'];
if ((int) $clubEventCount === 0) {
    $db->exec("INSERT INTO events (title, description, category, event_date, event_time, location, image, event_type, organizer, attendees_count, is_featured, created_by, club_id) VALUES
        ('Robotics Workshop 101', 'Hands-on intro to sensors, motors, and Arduino for new members.', 'workshop', '2026-09-12', '14:00:00', 'Main Auditorium', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=500&q=80', 'in_person', 'Robotics Club', 47, 0, 4, 4),
        ('Inter University Debate Qualifiers', 'Team formation and briefing for the national debate competition.', 'academic', '2026-10-05', '16:00:00', 'Room 402', NULL, 'in_person', 'UIU Debate Club', 32, 0, 2, 5),
        ('App Forum Hack Night', 'Overnight prototyping session for campus utility apps.', 'workshop', '2026-10-18', '18:00:00', 'CS Lab', '/assets/images/uiu/web-hackathon.png', 'in_person', 'App Forum', 28, 0, 6, 1)");
}

$clubAnnCount = $db->query("SELECT COUNT(*) AS c FROM announcements WHERE club_id IS NOT NULL")->fetch()['c'];
if ((int) $clubAnnCount === 0) {
    $db->exec("INSERT INTO announcements (title, content, created_by, club_id) VALUES
        ('New 3D Printers arrived!', 'We are excited to announce that the lab has received three new Bambu Lab printers. Orientation for new members starts this Friday.', 4, 4),
        ('Regional Qualifiers Registration', 'The registration for the upcoming Inter University National Debate Competition is now open. Team formation meetings at Room 402.', 2, 5),
        ('Autumn App Showcase', 'Submit your prototype by next Wednesday to present at the monthly App Forum showcase.', 6, 1)");
}

echo json_encode(['success' => true, 'message' => 'Database migrated']);

// New tables
if (!tableExists($db, 'password_resets')) {
    $db->exec("CREATE TABLE password_resets (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(150) NOT NULL, token VARCHAR(255) NOT NULL, expires_at TIMESTAMP NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_token (token)) ENGINE=InnoDB");
}
if (!tableExists($db, 'post_saves')) {
    $db->exec("CREATE TABLE post_saves (id INT AUTO_INCREMENT PRIMARY KEY, post_id INT NOT NULL, user_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY unique_save (post_id, user_id), FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
}
if (!tableExists($db, 'comment_likes')) {
    $db->exec("CREATE TABLE comment_likes (id INT AUTO_INCREMENT PRIMARY KEY, comment_id INT NOT NULL, user_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY unique_comment_like (comment_id, user_id), FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
}
if (!tableExists($db, 'follows')) {
    $db->exec("CREATE TABLE follows (id INT AUTO_INCREMENT PRIMARY KEY, follower_id INT NOT NULL, following_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY unique_follow (follower_id, following_id), FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
}
if (!tableExists($db, 'user_settings')) {
    $db->exec("CREATE TABLE user_settings (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, message_privacy ENUM('everyone','connections','none') DEFAULT 'everyone', post_privacy ENUM('everyone','connections','none') DEFAULT 'everyone', email_notifications TINYINT(1) DEFAULT 1, push_notifications TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY unique_settings (user_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
}
if (!tableExists($db, 'admin_logs')) {
    $db->exec("CREATE TABLE admin_logs (id INT AUTO_INCREMENT PRIMARY KEY, admin_id INT NOT NULL, action VARCHAR(100) NOT NULL, target_type VARCHAR(50) NOT NULL, target_id INT NOT NULL, details TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
}
if (!tableExists($db, 'message_reads')) {
    $db->exec("CREATE TABLE message_reads (id INT AUTO_INCREMENT PRIMARY KEY, message_id INT NOT NULL, user_id INT NOT NULL, read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY unique_read (message_id, user_id), FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
}

if (!tableExists($db, 'club_post_likes')) {
    $db->exec("CREATE TABLE club_post_likes (id INT AUTO_INCREMENT PRIMARY KEY, post_id INT NOT NULL, user_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY unique_club_like (post_id, user_id), FOREIGN KEY (post_id) REFERENCES club_posts(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
}
if (!tableExists($db, 'club_post_comments')) {
    $db->exec("CREATE TABLE club_post_comments (id INT AUTO_INCREMENT PRIMARY KEY, post_id INT NOT NULL, user_id INT NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (post_id) REFERENCES club_posts(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB");
}

// Add new columns
ensureColumn($db, 'posts', 'edited_at', 'TIMESTAMP NULL DEFAULT NULL');
ensureColumn($db, 'posts', 'views_count', 'INT DEFAULT 0');
ensureColumn($db, 'posts', 'shares_count', 'INT DEFAULT 0');
ensureColumn($db, 'users', 'last_seen_at', 'TIMESTAMP NULL DEFAULT NULL');
ensureColumn($db, 'users', 'is_banned', "TINYINT(1) DEFAULT 0");
ensureColumn($db, 'users', 'banned_reason', 'TEXT');
ensureColumn($db, 'users', 'banned_until', 'TIMESTAMP NULL DEFAULT NULL');
ensureColumn($db, 'comments', 'edited_at', 'TIMESTAMP NULL DEFAULT NULL');
ensureColumn($db, 'comments', 'likes_count', 'INT DEFAULT 0');
ensureColumn($db, 'groups_table', 'is_private', "TINYINT(1) DEFAULT 0");
ensureColumn($db, 'groups_table', 'rules', 'TEXT');
ensureColumn($db, 'groups_table', 'updated_at', 'TIMESTAMP NULL DEFAULT NULL');
ensureColumn($db, 'clubs', 'is_verified', "TINYINT(1) DEFAULT 0");
ensureColumn($db, 'clubs', 'updated_at', 'TIMESTAMP NULL DEFAULT NULL');
ensureColumn($db, 'events', 'max_attendees', 'INT DEFAULT NULL');
ensureColumn($db, 'events', 'registration_deadline', 'TIMESTAMP NULL DEFAULT NULL');
ensureColumn($db, 'events', 'updated_at', 'TIMESTAMP NULL DEFAULT NULL');
