<?php
require_once __DIR__ . '/../../config/helpers.php';
requireAdmin();
header('Content-Type: application/json');
$db = getDB();
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
$stmt = $db->prepare("SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT " . max(1, min($limit, 200)));
$stmt->execute();
$logs = $stmt->fetchAll();
jsonResponse(['success' => true, 'logs' => $logs]);
