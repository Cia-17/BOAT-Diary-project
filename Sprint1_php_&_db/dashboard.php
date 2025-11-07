<?php
session_start();
include("db_connect.php");

if (!isset($_SESSION['user_id'])) {
  header("Location: login.php");
  exit();
}
$user_id = $_SESSION['user_id'];
$name = $_SESSION['user_name'];
?>

<!DOCTYPE html>
<html>
<head>
  <title>Dashboard - Digital Diary</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="dashboard">
    <h2>Welcome, <?php echo $name; ?> 👋</h2>

    <form action="save_entry.php" method="POST">
      <textarea name="text" placeholder="Write your thoughts..." required></textarea><br>
      <select name="mood" required>
        <option value="">Select mood</option>
        <option>Happy</option>
        <option>Sad</option>
        <option>Excited</option>
        <option>Tired</option>
      </select><br>
      <button type="submit">Save Entry</button>
    </form>

    <h3>Your Past Entries</h3>
    <?php
    $entries = $conn->query("SELECT * FROM entries WHERE user_id=$user_id ORDER BY created_at DESC");
    while ($row = $entries->fetch_assoc()) {
        echo "<div class='entry'>";
        echo "<p><strong>{$row['mood']}</strong> — {$row['created_at']}</p>";
        echo "<p>{$row['text']}</p>";
        echo "</div>";
    }
    ?>
  </div>
</body>
</html>
