<?php
require 'config/helpers.php';
$db = getDB();
$stmt = $db->query('SELECT id, name, email, role, status FROM users');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
