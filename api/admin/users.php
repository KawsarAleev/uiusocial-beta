<?php
require_once __DIR__ . '/../../config/helpers.php';
requireAdmin();
header('Content-Type: application/json');
$db = getDB();
$search = trim($_GET['q'] ?? '');
$role = $_GET['role'] ?? '';
$sql = "SELECT id, name, email, department, role, avatar, status, is_banned, banned_reason, created_at FROM users WHERE role != 'guest'";
$params = [];
if ($search) { $sql .= " AND name LIKE ?"; $params[] = "%$search%"; }
if ($role) { $sql .= " AND role = ?"; $params[] = $role; }
$sql .= " ORDER BY created_at DESC";
$stmt = $db->prepare($sql);
$stmt->execute($params);
$users = $stmt->fetchAll();
jsonResponse(['success' => true, 'users' => $users]);
