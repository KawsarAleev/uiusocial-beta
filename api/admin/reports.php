<?php
require_once __DIR__ . '/../../config/helpers.php';
requireAdmin();
header('Content-Type: application/json');

$db = getDB();
$rows = $db->query("
    SELECT r.*, p.content AS post_content, p.image AS post_image, p.user_id AS post_author_id,
           u.name AS reporter_name, a.name AS author_name
    FROM reports r
    JOIN posts p ON p.id = r.post_id
    JOIN users u ON u.id = r.reported_by
    JOIN users a ON a.id = p.user_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at DESC
")->fetchAll();

foreach ($rows as &$r) {
    $r['time'] = timeAgo($r['created_at']);
}
unset($r);

jsonResponse(['success' => true, 'reports' => $rows]);
