<?php
require_once __DIR__ . '/../../config/helpers.php';
requireAdmin();
header('Content-Type: application/json');
$db = getDB();
$stats = [
    'total_users' => $db->query("SELECT COUNT(*) FROM users")->fetch()['COUNT(*)'],
    'approved_users' => $db->query("SELECT COUNT(*) FROM users WHERE status = 'approved'")->fetch()['COUNT(*)'],
    'pending_users' => $db->query("SELECT COUNT(*) FROM users WHERE status = 'pending'")->fetch()['COUNT(*)'],
    'total_posts' => $db->query("SELECT COUNT(*) FROM posts")->fetch()['COUNT(*)'],
    'total_groups' => $db->query("SELECT COUNT(*) FROM groups_table")->fetch()['COUNT(*)'],
    'total_clubs' => $db->query("SELECT COUNT(*) FROM clubs")->fetch()['COUNT(*)'],
    'total_events' => $db->query("SELECT COUNT(*) FROM events")->fetch()['COUNT(*)'],
    'total_messages' => $db->query("SELECT COUNT(*) FROM messages")->fetch()['COUNT(*)'],
    'pending_reports' => $db->query("SELECT COUNT(*) FROM reports WHERE status = 'pending'")->fetch()['COUNT(*)'],
    'pending_verifications' => $db->query("SELECT COUNT(*) FROM verification_queue WHERE status = 'pending'")->fetch()['COUNT(*)'],
];
jsonResponse(['success' => true, 'stats' => $stats]);
