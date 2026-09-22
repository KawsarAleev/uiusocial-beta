<?php
require 'config/helpers.php';
$db = getDB();
$stmt = $db->query('DESCRIBE users');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
