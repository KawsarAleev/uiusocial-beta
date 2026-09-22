<?php
require_once __DIR__ . '/../../config/helpers.php';
requireCanAct();
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
$data = json_decode(file_get_contents('php://input'), true);
$annId = (int)($data['id'] ?? 0);
if (!$annId) jsonResponse(['error' => 'Announcement ID required'], 400);
$db = getDB();
$stmt = $db->prepare("SELECT club_id FROM announcements WHERE id = ?");
$stmt->execute([$annId]);
$ann = $stmt->fetch();
if (!$ann) jsonResponse(['error' => 'Announcement not found'], 404);
if (!isClubManager($ann['club_id']) && !isAdmin()) jsonResponse(['error' => 'Not allowed'], 403);
$db->prepare("DELETE FROM announcement_comments WHERE announcement_id = ?")->execute([$annId]);
$db->prepare("DELETE FROM announcement_likes WHERE announcement_id = ?")->execute([$annId]);
$db->prepare("DELETE FROM announcements WHERE id = ?")->execute([$annId]);
jsonResponse(['success' => true, 'message' => 'Announcement deleted']);
