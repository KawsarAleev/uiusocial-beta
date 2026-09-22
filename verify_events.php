<?php
require_once 'C:\xampp\htdocs\uiusocial\config\database.php';
$db = getDB();
$stmt = $db->query('SELECT COUNT(*) as c FROM events');
echo 'Events: ' . $stmt->fetch()['c'] . PHP_EOL;
$stmt = $db->query('SELECT COUNT(*) as c FROM event_rsvps');
echo 'RSVPs: ' . $stmt->fetch()['c'] . PHP_EOL;