<?php
require_once __DIR__ . '/../../config/helpers.php';
requireAdmin();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$data = is_array($data) ? $data : [];
$action = (string) ($data['action'] ?? '');

$db = getDB();
$me = getCurrentUserId();

if ($action === 'delete') {
    $id = (int) ($data['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'Podcast id required'], 400);

    $stmt = $db->prepare('SELECT id, title FROM podcasts WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) jsonResponse(['error' => 'Podcast not found'], 404);

    $db->prepare('DELETE FROM podcasts WHERE id = ?')->execute([$id]);
    logAdminAction('delete_podcast', 'podcast', $id, 'Removed podcast #' . $id . ': "' . $row['title'] . '"');
    jsonResponse(['success' => true, 'message' => 'Podcast removed']);
}

if ($action !== 'create') {
    jsonResponse(['error' => 'Unknown action'], 400);
}

$title = trim((string) ($data['title'] ?? ''));
$description = trim((string) ($data['description'] ?? ''));
$provider = strtolower(trim((string) ($data['provider'] ?? 'youtube')));
$kind = (string) ($data['kind'] ?? 'video') === 'audio' ? 'audio' : 'video';
$category = trim((string) ($data['category'] ?? 'General'));
$duration = trim((string) ($data['duration'] ?? ''));
$sourceName = trim((string) ($data['source_name'] ?? ''));
$rawLink = trim((string) ($data['link'] ?? ''));

if ($title === '') jsonResponse(['error' => 'Title is required'], 400);
if (mb_strlen($title) > 200) jsonResponse(['error' => 'Title is too long'], 400);
if (mb_strlen($description) > 2000) jsonResponse(['error' => 'Description is too long'], 400);
if ($category === '' || mb_strlen($category) > 60) jsonResponse(['error' => 'Category must be 1-60 characters'], 400);

// Accept a pasted link or a bare id, then keep only the extracted id. The stored
// row never contains a URL, so there is nothing for an admin to inject one into.
$providerId = podcastParseInput($provider, $rawLink);
if ($providerId === '') {
    jsonResponse(['error' => 'That link or id is not a recognised ' . $provider . ' reference'], 400);
}

if (!podcastEmbedInfo($provider, $providerId)) {
    jsonResponse(['error' => 'That reference did not pass validation'], 400);
}

$dup = $db->prepare('SELECT id FROM podcasts WHERE provider = ? AND provider_id = ?');
$dup->execute([$provider, $providerId]);
if ($dup->fetch()) jsonResponse(['error' => 'That episode is already in the library'], 409);

$stmt = $db->prepare(
    "INSERT INTO podcasts (title, description, provider, provider_id, kind, category, duration, source_name, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
);
$stmt->execute([
    $title,
    $description !== '' ? $description : null,
    $provider,
    $providerId,
    $kind,
    $category,
    $duration !== '' ? mb_substr($duration, 0, 20) : null,
    $sourceName !== '' ? mb_substr($sourceName, 0, 120) : null,
    $me,
]);

$id = (int) $db->lastInsertId();
logAdminAction('create_podcast', 'podcast', $id, 'Added ' . $provider . ' episode "' . $title . '"');

$row = $db->prepare('SELECT * FROM podcasts WHERE id = ?');
$row->execute([$id]);

jsonResponse(['success' => true, 'podcast' => podcastPublicRow($row->fetch())], 201);
