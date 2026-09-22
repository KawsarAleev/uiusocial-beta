<?php
require_once __DIR__ . '/../../config/helpers.php';
requireCanAct();
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
$data = json_decode(file_get_contents('php://input'), true);
$commentId = (int)($data['comment_id'] ?? 0);
if (!$commentId) jsonResponse(['error' => 'Comment ID required'], 400);
$db = getDB();
$me = getCurrentUserId();
$stmt = $db->prepare('SELECT id, user_id FROM comments WHERE id = ?');
$stmt->execute([$commentId]);
$comment = $stmt->fetch();
if (!$comment) jsonResponse(['error' => 'Comment not found'], 404);
$check = $db->prepare('SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?');
$check->execute([$commentId, $me]);
if ($row = $check->fetch()) {
    $db->prepare('DELETE FROM comment_likes WHERE id = ?')->execute([$row['id']]);
    $status = 'unliked';
} else {
    $db->prepare('INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)')->execute([$commentId, $me]);
    $status = 'liked';
    $db->prepare('UPDATE comments SET likes_count = likes_count + 1 WHERE id = ?')->execute([$commentId]);
}
$cnt = $db->prepare('SELECT COUNT(*) c FROM comment_likes WHERE comment_id = ?');
$cnt->execute([$commentId]);
jsonResponse(['success' => true, 'status' => $status, 'likes' => (int)$cnt->fetch()['c']]);
