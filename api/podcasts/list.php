<?php
require_once __DIR__ . '/../../config/helpers.php';
requireLogin();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$db = getDB();

$category = trim((string) ($_GET['category'] ?? ''));
$kind = trim((string) ($_GET['kind'] ?? ''));
$search = trim((string) ($_GET['q'] ?? ''));
$limit = max(1, min(100, (int) ($_GET['limit'] ?? 60)));

$where = [];
$args = [];

if ($category !== '' && $category !== 'all') {
    $where[] = 'category = ?';
    $args[] = $category;
}
if ($kind === 'video' || $kind === 'audio') {
    $where[] = 'kind = ?';
    $args[] = $kind;
}
if ($search !== '') {
    $where[] = '(title LIKE ? OR description LIKE ? OR source_name LIKE ?)';
    $like = '%' . $search . '%';
    array_push($args, $like, $like, $like);
}

$sql = 'SELECT * FROM podcasts';
if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
$sql .= ' ORDER BY kind ASC, category ASC, title ASC LIMIT ' . $limit;

$stmt = $db->prepare($sql);
$stmt->execute($args);
$rows = $stmt->fetchAll();

$items = [];
$skipped = 0;
foreach ($rows as $row) {
    // podcastPublicRow drops any row whose provider/id no longer validates, so a
    // tampered database value can never reach an iframe src.
    $safe = podcastPublicRow($row);
    if ($safe) $items[] = $safe;
    else $skipped++;
}

$catStmt = $db->query("SELECT category, COUNT(*) AS c FROM podcasts GROUP BY category ORDER BY category");
$categories = [];
foreach ($catStmt->fetchAll() as $c) {
    $categories[] = ['name' => $c['category'], 'count' => (int) $c['c']];
}

$canManage = isAdmin();

jsonResponse([
    'success' => true,
    'podcasts' => $items,
    'categories' => $categories,
    'kinds' => [
        ['name' => 'video', 'count' => (int) $db->query("SELECT COUNT(*) FROM podcasts WHERE kind='video'")->fetchColumn()],
        ['name' => 'audio', 'count' => (int) $db->query("SELECT COUNT(*) FROM podcasts WHERE kind='audio'")->fetchColumn()],
    ],
    'can_manage' => $canManage,
    'skipped_invalid' => $skipped,
]);
