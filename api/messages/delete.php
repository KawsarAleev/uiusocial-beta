<?php
require_once __DIR__ . '/../../config/helpers.php';
requireCanAct();
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
$data = json_decode(file_get_contents('php://input'), true);
$messageId = (int)($data['message_id'] ?? 0);
$me = getCurrentUserId();
if (!$messageId) jsonResponse(['error' => 'Message ID required'], 400);
$db = getDB();
$stmt = $db->prepare("SELECT * FROM messages WHERE id = ? AND (sender_id = ? OR receiver_id = ?)");
$stmt->execute([$messageId, $me, $me]);
if (!$stmt->fetch()) jsonResponse(['error' => 'Message not found'], 404);
$db->prepare("DELETE FROM messages WHERE id = ?")->execute([$messageId]);
jsonResponse(['success' => true, 'message' => 'Message deleted']);
