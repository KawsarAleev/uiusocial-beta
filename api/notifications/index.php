<?php
require_once __DIR__ . '/../../config/helpers.php';
requireLogin();
header('Content-Type: application/json');

$db = getDB();
$me = getCurrentUserId();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!empty($data['id'])) {
        $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?")->execute([(int)$data['id'], $me]);
    } else {
        $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?")->execute([$me]);
    }
    jsonResponse(['success' => true]);
}

$stmt = $db->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30");
$stmt->execute([$me]);
$rows = $stmt->fetchAll();
foreach ($rows as &$n) {
    $n['time'] = timeAgo($n['created_at']);
}
unset($n);
$unread = $db->prepare("SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND is_read = 0");
$unread->execute([$me]);
jsonResponse(['success' => true, 'notifications' => $rows, 'unread' => (int) $unread->fetch()['c']]);
