<?php
session_start();
include("db_connect.php");

if (!isset($_SESSION['user_id'])) {
  header("Location: login.php");
  exit();
}

$user_id = $_SESSION['user_id'];
$text = $_POST['text'];
$mood = $_POST['mood'];

$sql = "INSERT INTO entries (user_id, text, mood) VALUES ('$user_id', '$text', '$mood')";
$conn->query($sql);

header("Location: dashboard.php");
?>
