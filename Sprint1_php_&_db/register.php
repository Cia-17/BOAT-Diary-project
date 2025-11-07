<?php include("db_connect.php"); ?>

<!DOCTYPE html>
<html>
<head>
  <title>Register - Digital Diary</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="form-container">
    <h2>Create Account</h2>
    <form method="POST">
      <input type="text" name="name" placeholder="Full Name" required><br>
      <input type="email" name="email" placeholder="Email" required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <button type="submit" name="register">Register</button>
    </form>
    <p>Already have an account? <a href="login.php">Login</a></p>
  </div>

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
</body>
</html>
