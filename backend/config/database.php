<?php
$dsn = "mysql:host=localhost;dbname=my_cinema;charset=utf8mb4";
$user = "admin" ;
$pass = "sqlnoir" ;
$pdo = new PDO ($dsn , $user , $pass, [
PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);
?>