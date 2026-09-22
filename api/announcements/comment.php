<?php
require_once __DIR__ . '/../../config/helpers.php';
requireCanAct();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = (int) ($data['announcement_id'] ?? 0);
$content = trim($data['content'] ?? '');
if ($content === '') jsonResponse(['error' => 'Comment cannot be empty'], 400);

$db = getDB();
$stmt = $db->prepare("INSERT INTO announcement_comments (announcement_id, user_id, content) VALUES (?, ?, ?)");
$stmt->execute([$id, getCurrentUserId(), $content]);
$cid = $db->lastInsertId();
$c = $db->prepare("SELECT ac.id, ac.content, ac.created_at, u.id as author_id, u.name as author, u.avatar FROM announcement_comments ac JOIN users u ON u.id = ac.user_id WHERE ac.id = ?");
$c->execute([$cid]);
jsonResponse(['success' => true, 'comment' => $c->fetch()], 201);
