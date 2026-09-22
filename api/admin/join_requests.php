<?php
require_once __DIR__ . '/../../config/helpers.php';
requireAdmin();
header('Content-Type: application/json');

$db = getDB();
$rows = $db->query("
    SELECT v.id, v.requested_role, v.status, v.created_at,
           u.id AS user_id, u.name, u.email, u.avatar, u.department, u.student_id, u.role
    FROM verification_queue v
    JOIN users u ON u.id = v.user_id
    WHERE v.status = 'pending'
    ORDER BY v.created_at DESC
")->fetchAll();

jsonResponse(['success' => true, 'requests' => $rows]);
