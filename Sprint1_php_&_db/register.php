<?php include("db_connect.php"); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Register - A Day In My Life</title>
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
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .form-container {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border-radius: 25px;
      padding: 40px 50px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      text-align: center;
      width: 360px;
    }

    .form-container h2 {
      font-weight: 600;
      font-size: 1.8rem;
      color: #333;
      margin-bottom: 15px;
    }

    .form-container p.subtitle {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 25px;
    }

    input[type="text"], input[type="email"], input[type="password"] {
      width: 100%;
      padding: 12px 15px;
      margin-bottom: 15px;
      border: 1px solid #ccc;
      border-radius: 12px;
      outline: none;
      transition: 0.3s;
    }

    input:focus {
      border-color: #8a2be2;
      box-shadow: 0 0 5px rgba(138, 43, 226, 0.3);
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

    .toggle-link {
      display: block;
      margin-top: 15px;
      color: #8a2be2;
      text-decoration: none;
      font-weight: 500;
    }

    .toggle-link:hover {
      text-decoration: underline;
    }

    .success, .error {
      margin-top: 15px;
      font-size: 0.9rem;
    }

    .success { color: #2e8b57; }
    .error { color: #d9534f; }
  </style>
</head>
<body>
  <div class="form-container">
    <h2>Create Account</h2>
    <p class="subtitle">Your emotions. Your story. Your journey.</p>

    <form method="POST">
      <input type="text" name="name" placeholder="Full Name" required>
      <input type="email" name="email" placeholder="Email" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit" name="register">Register</button>
    </form>

    <a href="login.php" class="toggle-link">Already have an account? Login</a>

    <?php
    if (isset($_POST['register'])) {
        $name = $_POST['name'];
        $email = $_POST['email'];
        $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

        $sql = "INSERT INTO users (name, email, password) VALUES ('$name','$email','$password')";
        if ($conn->query($sql)) {
            echo "<p class='success'>Registration successful! <a href='login.php'>Login</a></p>";
        } else {
            echo "<p class='error'>Error: " . $conn->error . "</p>";
        }
    }
    ?>
  </div>
</body>
</html>
