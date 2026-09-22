<?php
session_start();
require 'config/helpers.php';
$_SESSION['user_id'] = 10;
print_r(getCurrentUser());
