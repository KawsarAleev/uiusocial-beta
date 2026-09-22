<?php
require_once __DIR__ . '/../../config/helpers.php';
requireAdmin();
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
$data = json_decode(file_get_contents('php://input'), true);
$userId = (int)($data['user_id'] ?? 0);
$action = $data['action'] ?? 'ban';
$reason = trim($data['reason'] ?? '');
$until = $data['until'] ?? null;
$me = getCurrentUserId();
if (!$userId) jsonResponse(['error' => 'User ID required'], 400);
$db = getDB();
$stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
$stmt->execute([$userId]);
if (!$stmt->fetch()) jsonResponse(['error' => 'User not found'], 404);
if ($action === 'ban') {
    $db->prepare("UPDATE users SET is_banned = 1, banned_reason = ?, banned_until = ? WHERE id = ?")->execute([$reason, $until, $userId]);
    $db->prepare("INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, 'ban', 'user', ?, ?)")->execute([$me, $userId, $reason]);
    jsonResponse(['success' => true, 'message' => 'User banned']);
} elseif ($action === 'unban') {
    $db->prepare("UPDATE users SET is_banned = 0, banned_reason = NULL, banned_until = NULL WHERE id = ?")->execute([$userId]);
    $db->prepare("INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, 'unban', 'user', ?, 'Unbanned')")->execute([$me, $userId]);
    jsonResponse(['success' => true, 'message' => 'User unbanned']);
} else {
    jsonResponse(['error' => 'Invalid action'], 400);
}
