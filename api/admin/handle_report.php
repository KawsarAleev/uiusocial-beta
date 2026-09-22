<?php
require_once __DIR__ . '/../../config/helpers.php';
requireAdmin();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = (int) ($data['id'] ?? 0);
$action = $data['action'] ?? 'dismiss';

$db = getDB();
$stmt = $db->prepare("SELECT * FROM reports WHERE id = ?");
$stmt->execute([$id]);
$report = $stmt->fetch();
if (!$report) jsonResponse(['error' => 'Report not found'], 404);

if ($action === 'delete') {
    $db->prepare("DELETE FROM posts WHERE id = ?")->execute([$report['post_id']]);
    $db->prepare("UPDATE reports SET status = 'reviewed' WHERE post_id = ?")->execute([$report['post_id']]);
    jsonResponse(['success' => true, 'status' => 'deleted']);
}

$db->prepare("UPDATE reports SET status = 'dismissed' WHERE id = ?")->execute([$id]);
jsonResponse(['success' => true, 'status' => 'dismissed']);
