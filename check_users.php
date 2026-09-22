<?php
require_once 'C:\xampp\htdocs\uiusocial\config\database.php';
$db = getDB();
$stmt = $db->query('SELECT id, name FROM users');
echo "Users:\n";
while ($row = $stmt->fetch()) {
    echo $row['id'] . ' - ' . $row['name'] . PHP_EOL;
}