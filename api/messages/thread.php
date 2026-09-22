<?php
require_once __DIR__ . '/../../config/helpers.php';
requireLogin();
header('Content-Type: application/json');

$other = (int) ($_GET['user_id'] ?? 0);
$me = getCurrentUserId();
if (!$other) jsonResponse(['error' => 'user_id required'], 400);

$db = getDB();
$block = $db->prepare("SELECT id FROM blocked_users WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)");
$block->execute([$me, $other, $other, $me]);
$blocked = (bool) $block->fetch();

$stmt = $db->prepare("SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC");
$stmt->execute([$me, $other, $other, $me]);
$messages = $stmt->fetchAll();
foreach ($messages as &$m) {
    $m['mine'] = (int) $m['sender_id'] === (int) $me;
    $m['time'] = date('h:i A', strtotime($m['created_at']));
}
unset($m);

jsonResponse(['success' => true, 'messages' => $messages, 'blocked' => $blocked]);
