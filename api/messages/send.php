<?php
require_once __DIR__ . '/../../config/helpers.php';
requireCanAct();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$to = (int) ($data['receiver_id'] ?? 0);
$content = trim($data['content'] ?? '');
$me = getCurrentUserId();
if (!$to || $content === '') jsonResponse(['error' => 'Message required'], 400);

$db = getDB();
$block = $db->prepare("SELECT id FROM blocked_users WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)");
$block->execute([$me, $to, $to, $me]);
if ($block->fetch()) jsonResponse(['error' => 'This conversation is blocked'], 403);

$stmt = $db->prepare("INSERT INTO messages (sender_id, receiver_id, content, message_type) VALUES (?, ?, ?, 'text')");
$stmt->execute([$me, $to, $content]);
$messageId = $db->lastInsertId();

notifyActivity('message', $me, [$to], ['snippet' => $content]);

jsonResponse(['success' => true, 'message_id' => $messageId], 201);
