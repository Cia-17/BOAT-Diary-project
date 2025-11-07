<?php
session_start();
include("dbconnect.php");

if (!isset($_SESSION['user_id'])) {
  header("Location: login.php");
  exit();
}

$user_id = $_SESSION['user_id'];
$name = $_SESSION['user_name'];

// Fetch a random motivational quote
$quote = $conn->query("SELECT * FROM quotes ORDER BY RAND() LIMIT 1")->fetch_assoc();
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dashboard - A Day In My Life</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: "Poppins", sans-serif;
    }

    body {
      background: linear-gradient(135deg, #f7c6ff, #c8e7ff);
      min-height: 100vh;
      padding: 40px;
      color: #333;
    }

    .dashboard {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.85);
      border-radius: 25px;
      padding: 40px 50px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(12px);
    }

    h2 {
      font-weight: 600;
      font-size: 1.8rem;
      margin-bottom: 10px;
      text-align: center;
    }

    .quote-box {
      background: linear-gradient(90deg, #b3e5fc, #d1c4e9);
      border-radius: 15px;
      padding: 15px 20px;
      text-align: center;
      margin-bottom: 30px;
      font-style: italic;
      font-size: 0.95rem;
    }

    form {
      background: rgba(255, 255, 255, 0.7);
      padding: 25px;
      border-radius: 20px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
      margin-bottom: 30px;
    }

    textarea {
      width: 100%;
      height: 100px;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #ccc;
      resize: none;
      margin-bottom: 15px;
      outline: none;
      transition: 0.3s;
    }

    textarea:focus {
      border-color: #8a2be2;
      box-shadow: 0 0 5px rgba(138, 43, 226, 0.3);
    }

    select {
      width: 100%;
      padding: 10px;
      border-radius: 12px;
      border: 1px solid #ccc;
      margin-bottom: 15px;
      outline: none;
    }

    button {
      width: 100%;
      padding: 12px;
      border: none;
      background: linear-gradient(90deg, #8a2be2, #ff69b4);
      color: white;
      border-radius: 12px;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s;
    }

    button:hover {
      transform: scale(1.03);
    }

    .entries {
      margin-top: 30px;
    }

    .entry {
      background: linear-gradient(135deg, #e3f2fd, #ede7f6);
      border-radius: 15px;
      padding: 15px 20px;
      margin-bottom: 15px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.05);
    }

    .entry p {
      margin-bottom: 8px;
      font-size: 0.95rem;
    }

    .entry strong {
      color: #8a2be2;
    }

    .mood-icons {
      text-align: center;
      margin: 20px 0;
    }

    .mood-icons span {
      margin: 0 10px;
      font-size: 2rem;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .mood-icons span:hover {
      transform: scale(1.2);
    }

    .logout {
      text-align: right;
      margin-top: 15px;
    }

    .logout a {
      color: #8a2be2;
      text-decoration: none;
      font-weight: 500;
    }

    .logout a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="logout">
      <a href="logout.php">Logout</a>
    </div>

    <h2>Welcome, <?php echo htmlspecialchars($name); ?> 👋</h2>

    <div class="quote-box">
      “<?php echo $quote['text']; ?>”<br>
      <small>— <?php echo $quote['author']; ?></small>
    </div>

    <form action="save_entry.php" method="POST">
      <textarea name="text" placeholder="How was your day?" required></textarea>
      <select name="mood" required>
        <option value="">Select mood</option>
        <option value="Happy">😊 Happy</option>
        <option value="Good">🙂 Good</option>
        <option value="Meh">😐 Meh</option>
        <option value="Bad">☹️ Bad</option>
        <option value="Awful">😣 Awful</option>
      </select>
      <button type="submit">Save Entry</button>
    </form>

    <h3>Your Past Entries</h3>
    <div class="entries">
      <?php
      $entries = $conn->query("SELECT * FROM entries WHERE user_id=$user_id ORDER BY created_at DESC");
      if ($entries->num_rows > 0) {
          while ($row = $entries->fetch_assoc()) {
              echo "<div class='entry'>";
              echo "<p><strong>{$row['mood']}</strong> — " . date("l, j F Y g:i A", strtotime($row['created_at'])) . "</p>";
              echo "<p>" . nl2br(htmlspecialchars($row['text'])) . "</p>";
              echo "</div>";
          }
      } else {
          echo "<p>No entries yet. Start journaling your day!</p>";
      }
      ?>
    </div>
  </div>
</body>
</html>
