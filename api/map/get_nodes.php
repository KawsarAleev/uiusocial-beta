<?php
// Returns all waypoints/nodes for a given floor for populating
// dropdowns and rendering map markers.
require_once __DIR__ . '/../../config/helpers.php';
header('Content-Type: application/json');

$floor = isset($_GET['floor']) ? (int)$_GET['floor'] : 2;

$db = getDB();
$stmt = $db->prepare("SELECT id, floor_level, node_name, node_type, x_pos, y_pos FROM floor_nodes WHERE floor_level = ? ORDER BY FIELD(node_type, 'lift', 'stair', 'room', 'corridor'), node_name");
$stmt->execute([$floor]);
$nodes = $stmt->fetchAll();

jsonResponse(['success' => true, 'floor' => $floor, 'count' => count($nodes), 'nodes' => $nodes]);
