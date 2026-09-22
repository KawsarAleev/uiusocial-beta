<?php
require 'config/helpers.php';
$db = getDB();
try {
$stmt = $db->query('DESCRIBE verification_queue');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch(Exception $e) { echo "verification_queue error: " . $e->getMessage() . "\n"; }
