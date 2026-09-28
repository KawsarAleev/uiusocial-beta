<?php
// Calculates the shortest path between two nodes using Dijkstra's algorithm.
// Receives start_id and target_id (GET or JSON body) and returns the
// ordered sequence of nodes plus the total distance as JSON.
require_once __DIR__ . '/../../config/helpers.php';
header('Content-Type: application/json');

$input = getJsonInput();
$startId = (int)($_GET['start_id'] ?? $input['start_id'] ?? 0);
$targetId = (int)($_GET['target_id'] ?? $input['target_id'] ?? 0);

if (!$startId || !$targetId) {
    jsonResponse(['success' => false, 'error' => 'start_id and target_id are required'], 400);
}

$db = getDB();

// Load all nodes for this floor into a map keyed by id
$nodes = $db->query("SELECT id, floor_level, node_name, node_type, x_pos, y_pos FROM floor_nodes")->fetchAll();
$nodeMap = [];
foreach ($nodes as $n) {
    $id = (int)$n['id'];
    $nodeMap[$id] = [
        'id'        => $id,
        'floor_level' => (int)$n['floor_level'],
        'node_name' => $n['node_name'],
        'node_type' => $n['node_type'],
        'x_pos'     => (int)$n['x_pos'],
        'y_pos'     => (int)$n['y_pos'],
    ];
}

if (!isset($nodeMap[$startId])) {
    jsonResponse(['success' => false, 'error' => 'Invalid start node'], 404);
}
if (!isset($nodeMap[$targetId])) {
    jsonResponse(['success' => false, 'error' => 'Invalid target node'], 404);
}

// Build a bidirectional adjacency list from the connections table
$adj = [];
$rows = $db->query("SELECT from_node_id, to_node_id, distance FROM floor_connections")->fetchAll();
foreach ($rows as $r) {
    $f = (int)$r['from_node_id'];
    $t = (int)$r['to_node_id'];
    $d = (float)$r['distance'];
    if (!isset($nodeMap[$f]) || !isset($nodeMap[$t])) continue;
    if (!isset($adj[$f])) $adj[$f] = [];
    if (!isset($adj[$t])) $adj[$t] = [];
    // Keep the smaller distance if an edge is defined more than once
    if (!isset($adj[$f][$t]) || $d < $adj[$f][$t]) $adj[$f][$t] = $d;
    if (!isset($adj[$t][$f]) || $d < $adj[$t][$f]) $adj[$t][$f] = $d;
}

// Dijkstra's shortest path
$dist = [];
$prev = [];
$visited = [];
foreach ($nodeMap as $id => $_) {
    $dist[$id] = INF;
    $prev[$id] = null;
}
$dist[$startId] = 0;

while (true) {
    // Select the unvisited node with the smallest tentative distance
    $u = null;
    $min = INF;
    foreach ($nodeMap as $id => $_) {
        if (isset($visited[$id])) continue;
        if ($dist[$id] < $min) {
            $min = $dist[$id];
            $u = $id;
        }
    }
    if ($u === null || $u === $targetId) break;

    $visited[$u] = true;
    if (isset($adj[$u])) {
        foreach ($adj[$u] as $v => $d) {
            if (isset($visited[$v])) continue;
            $alt = $dist[$u] + $d;
            if ($alt < $dist[$v]) {
                $dist[$v] = $alt;
                $prev[$v] = $u;
            }
        }
    }
}

if ($dist[$targetId] === INF) {
    jsonResponse(['success' => false, 'error' => 'No route found between the selected points'], 404);
}

// Reconstruct the path from target back to start
$path = [];
$cur = $targetId;
while ($cur !== null) {
    array_unshift($path, $nodeMap[$cur]);
    $cur = $prev[$cur];
}

jsonResponse([
    'success'         => true,
    'start_id'        => $startId,
    'target_id'       => $targetId,
    'total_distance'  => (float)$dist[$targetId],
    'nodes_count'     => count($path),
    'path'            => $path
]);
