<?php
require_once __DIR__ . '/../../config/helpers.php';
requireLogin();
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
$data = json_decode(file_get_contents('php://input'), true);
$messageId = (int)($data['message_id'] ?? 0);
$me = getCurrentUserId();
if ($messageId) {
    $db = getDB();
    $db->prepare("INSERT IGNORE INTO message_reads (message_id, user_id, read_at) VALUES (?, ?, NOW())")->execute([$messageId, $me]);
    jsonResponse(['success' => true]);
} else {
    $db = getDB();
    $stmt = $db->prepare("SELECT id FROM messages WHERE receiver_id = ? AND is_read = 0");
    $stmt->execute([$me]);
    foreach ($stmt->fetchAll() as $row) {
        $db->prepare("INSERT IGNORE INTO message_reads (message_id, user_id, read_at) VALUES (?, ?, NOW())")->execute([$row['id'], $me]);
        $db->prepare("UPDATE messages SET is_read = 1 WHERE id = ?")->execute([$row['id']]);
    }
    jsonResponse(['success' => true]);
}
