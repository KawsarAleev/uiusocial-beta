<?php
require_once __DIR__ . '/session.php';

function getJsonInput() {
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

function isAdmin($user = null) {
    $user = $user ?? getCurrentUser();
    return $user && strtolower($user['role']) === 'admin';
}

function isGuestUser($user = null) {
    $user = $user ?? getCurrentUser();
    return $user && strtolower($user['role']) === 'guest';
}

function isApprovedMember($user = null) {
    $user = $user ?? getCurrentUser();
    if (!$user) return false;
    if (strtolower($user['role']) === 'guest') return false;
    $status = $user['status'] ?? 'approved';
    return $status === 'approved';
}

function canAct($user = null) {
    return isApprovedMember($user);
}

function requireCanAct() {
    requireLogin();
    if (!canAct()) {
        jsonResponse(['error' => 'Only approved students and faculty can perform this action.'], 403);
    }
}

function requireAdmin() {
    requireLogin();
    if (!isAdmin()) {
        jsonResponse(['error' => 'Admin access required'], 403);
    }
}

function columnExists(PDO $db, $table, $column) {
    $stmt = $db->prepare("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?");
    $stmt->execute([$table, $column]);
    return (bool) $stmt->fetch();
}

function tableExists(PDO $db, $table) {
    $stmt = $db->prepare("SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?");
    $stmt->execute([$table]);
    return (bool) $stmt->fetch();
}

function uploadImage($fileKey, $subdir) {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $uploadDir = __DIR__ . '/../uploads/' . trim($subdir, '/') . '/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    $fileInfo = pathinfo($_FILES[$fileKey]['name']);
    $extension = strtolower($fileInfo['extension'] ?? '');
    if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
        return null;
    }
    $newFilename = uniqid($subdir . '_') . '.' . $extension;
    $destination = $uploadDir . $newFilename;
    if (move_uploaded_file($_FILES[$fileKey]['tmp_name'], $destination)) {
        return 'uploads/' . trim($subdir, '/') . '/' . $newFilename;
    }
    return null;
}

function notifyUser($userId, $type, $title, $body, $link = null) {
    try {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $type, $title, $body, $link]);
    } catch (Exception $e) {
        error_log('notifyUser: ' . $e->getMessage());
    }
}

function notifyAdmins($type, $title, $body, $link = null) {
    try {
        $db = getDB();
        $stmt = $db->query("SELECT id FROM users WHERE role = 'admin'");
        foreach ($stmt->fetchAll() as $admin) {
            notifyUser($admin['id'], $type, $title, $body, $link);
        }
    } catch (Exception $e) {
        error_log('notifyAdmins: ' . $e->getMessage());
    }
}

function isGroupManager($groupId, $user = null) {
    $user = $user ?? getCurrentUser();
    if (!$user) return false;
    if (isAdmin($user)) return true;
    $db = getDB();
    $stmt = $db->prepare("SELECT created_by FROM groups_table WHERE id = ?");
    $stmt->execute([$groupId]);
    $group = $stmt->fetch();
    if ($group && (int) $group['created_by'] === (int) $user['id']) {
        return true;
    }
    $stmt = $db->prepare("SELECT role FROM group_members WHERE group_id = ? AND user_id = ?");
    $stmt->execute([$groupId, $user['id']]);
    $row = $stmt->fetch();
    return $row && $row['role'] === 'admin';
}

function isClubManager($clubId, $user = null) {
    $user = $user ?? getCurrentUser();
    if (!$user) return false;
    if (isAdmin($user)) return true;
    $db = getDB();
    $stmt = $db->prepare("SELECT owner_id FROM clubs WHERE id = ?");
    $stmt->execute([$clubId]);
    $club = $stmt->fetch();
    if ($club && (int) $club['owner_id'] === (int) $user['id']) {
        return true;
    }
    $stmt = $db->prepare("SELECT role FROM club_members WHERE club_id = ? AND user_id = ?");
    $stmt->execute([$clubId, $user['id']]);
    $row = $stmt->fetch();
    return $row && in_array($row['role'], ['admin', 'owner'], true);
}
