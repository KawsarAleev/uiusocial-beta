<?php
require_once __DIR__ . '/../../config/helpers.php';
requireAdmin();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = (int) ($data['id'] ?? 0);
$action = $data['action'] ?? 'accept';

$db = getDB();
$stmt = $db->prepare("SELECT * FROM verification_queue WHERE id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) jsonResponse(['error' => 'Request not found'], 404);

if ($action === 'accept') {
    $db->prepare("UPDATE verification_queue SET status = 'approved' WHERE id = ?")->execute([$id]);
    $db->prepare("UPDATE users SET status = 'approved' WHERE id = ?")->execute([$row['user_id']]);
    notifyActivity('join_approved', 0, [$row['user_id']]);
    jsonResponse(['success' => true, 'status' => 'approved']);
}

$db->prepare("UPDATE verification_queue SET status = 'rejected' WHERE id = ?")->execute([$id]);
$db->prepare("UPDATE users SET status = 'rejected' WHERE id = ?")->execute([$row['user_id']]);
notifyActivity('join_rejected', 0, [$row['user_id']]);
jsonResponse(['success' => true, 'status' => 'rejected']);
