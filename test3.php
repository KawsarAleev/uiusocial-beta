<?php
require 'config/helpers.php';
$db = getDB();
try {
$stmt=$db->prepare("INSERT INTO users (name, email, student_id, department, password, role, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
$stmt->execute(['test3', 'test3@uiu.ac.bd', '1234', 'CSE', 'pass', 'student', 'img']);
echo 'OK';
} catch(Exception $e) { echo $e->getMessage(); }
