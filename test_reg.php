<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST = ['name'=>'test user', 'email'=>'newuser@uiu.ac.bd', 'student_id'=>'', 'department'=>'CSE', 'password'=>'pass', 'role'=>'faculty'];
require 'api/auth/register.php';
