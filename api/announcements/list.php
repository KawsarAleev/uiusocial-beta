<?php
require_once __DIR__ . '/../../config/helpers.php';
requireLogin();
header('Content-Type: application/json');

$db = getDB();
$me = getCurrentUserId();
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 3;
$clubOnly = isset($_GET['club']) && $_GET['club'] === '1';

$sql = "SELECT a.*, c.name AS club_name, c.image AS club_image
        FROM announcements a
        LEFT JOIN clubs c ON c.id = a.club_id";
if ($clubOnly) $sql .= " WHERE a.club_id IS NOT NULL";
$sql .= " ORDER BY a.created_at DESC LIMIT " . max(1, min($limit, 20));
$rows = $db->query($sql)->fetchAll();

foreach ($rows as &$a) {
    $like = $db->prepare("SELECT COUNT(*) c FROM announcement_likes WHERE announcement_id = ?");
    $like->execute([$a['id']]);
    $a['likes'] = (int) $like->fetch()['c'];
    $mine = $db->prepare("SELECT id FROM announcement_likes WHERE announcement_id = ? AND user_id = ?");
    $mine->execute([$a['id'], $me]);
    $a['liked'] = (bool) $mine->fetch();
    $cm = $db->prepare("SELECT ac.id, ac.content, ac.created_at, u.id as author_id, u.name as author, u.avatar FROM announcement_comments ac JOIN users u ON u.id = ac.user_id WHERE ac.announcement_id = ? ORDER BY ac.created_at ASC");
    $cm->execute([$a['id']]);
    $a['comments'] = $cm->fetchAll();
    $cc = $db->prepare("SELECT COUNT(*) c FROM announcement_comments WHERE announcement_id = ?");
    $cc->execute([$a['id']]);
    $a['comments_count'] = (int) $cc->fetch()['c'];
    $a['time'] = timeAgo($a['created_at']);
}
unset($a);

jsonResponse(['success' => true, 'announcements' => $rows]);
