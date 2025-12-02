<?php

if (!isset($pageTitle)) {
    $pageTitle = 'DiaryPro - Your Personal Journal';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="A personal diary web application for documenting daily experiences, emotions, and memories">
    <title><?php echo htmlspecialchars($pageTitle); ?></title>
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <?php if (isAuthenticated()): ?>

    <nav class="navbar">
        <div class="navbar-container">
            <a href="dashboard.php" class="navbar-brand">
                <span class="navbar-logo">📖</span>
                <span class="navbar-title">DiaryPro</span>
            </a>
            <div class="navbar-links">
                <a href="dashboard.php" class="nav-link <?php echo (basename($_SERVER['PHP_SELF']) == 'dashboard.php') ? 'active' : ''; ?>">Dashboard</a>
                <a href="journal.php" class="nav-link <?php echo (basename($_SERVER['PHP_SELF']) == 'journal.php') ? 'active' : ''; ?>">Journal</a>
                <a href="calendar.php" class="nav-link <?php echo (basename($_SERVER['PHP_SELF']) == 'calendar.php') ? 'active' : ''; ?>">Calendar</a>
                <a href="insights.php" class="nav-link <?php echo (basename($_SERVER['PHP_SELF']) == 'insights.php') ? 'active' : ''; ?>">Insights</a>
                <a href="settings.php" class="nav-link <?php echo (basename($_SERVER['PHP_SELF']) == 'settings.php') ? 'active' : ''; ?>">Settings</a>
                <a href="logout.php" class="nav-link">Logout</a>
            </div>
        </div>
    </nav>
    <?php else: ?>

    <nav class="navbar">
        <div class="navbar-container">
            <a href="index.php" class="navbar-brand">
                <span class="navbar-logo">📖</span>
                <span class="navbar-title">DiaryPro</span>
            </a>
            <div class="navbar-links">
                <a href="login.php" class="nav-link">Sign In</a>
                <a href="register.php" class="nav-link button-primary">Get Started</a>
            </div>
        </div>
    </nav>
    <?php endif; ?>

