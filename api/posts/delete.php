<?php
require_once __DIR__ . '/../../config/helpers.php';
requireCanAct();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$postId = (int) ($data['post_id'] ?? 0);
$commentId = isset($data['comment_id']) ? (int) $data['comment_id'] : 0;
$user = getCurrentUser();
$db = getDB();

$stmt = $db->prepare("SELECT id, user_id, group_id FROM posts WHERE id = ?");
$stmt->execute([$postId]);
$post = $stmt->fetch();
if (!$post) jsonResponse(['error' => 'Post not found'], 404);

$can = isAdmin($user) || (int) $post['user_id'] === (int) $user['id'];
if ($post['group_id'] && isGroupManager($post['group_id'], $user)) {
    $can = true;
}
if (!$can) jsonResponse(['error' => 'Not allowed'], 403);

if ($commentId) {
    $db->prepare("DELETE FROM comments WHERE id = ? AND post_id = ?")->execute([$commentId, $postId]);
    jsonResponse(['success' => true, 'message' => 'Comment deleted']);
}

$db->prepare("DELETE FROM posts WHERE id = ?")->execute([$postId]);
jsonResponse(['success' => true, 'message' => 'Post deleted']);
