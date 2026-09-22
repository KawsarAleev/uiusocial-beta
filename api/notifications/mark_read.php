<?php
require_once __DIR__ . '/../../config/helpers.php';
requireLogin();
header('Content-Type: application/json');
$me = getCurrentUserId();
$db = getDB();
$stmt = $db->prepare("SELECT id, user_id, type, title, body, link, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$me]);
$notifications = $stmt->fetchAll();
$unread = 0;
foreach ($notifications as $n) { if (!$n['is_read']) $unread++; }
foreach ($notifications as &$n) { $n['time'] = timeAgo($n['created_at']); }
jsonResponse(['success' => true, 'notifications' => $notifications, 'unread' => $unread]);
