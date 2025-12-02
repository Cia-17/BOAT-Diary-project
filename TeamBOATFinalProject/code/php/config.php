<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}


function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

loadEnv(__DIR__ . '/../.env');

define('SUPABASE_URL', getenv('SUPABASE_URL') ?: $_ENV['SUPABASE_URL'] ?? '');
define('SUPABASE_ANON_KEY', getenv('SUPABASE_ANON_KEY') ?: $_ENV['SUPABASE_ANON_KEY'] ?? '');

if (empty(SUPABASE_URL) || empty(SUPABASE_ANON_KEY)) {
    error_log("ERROR: Supabase configuration is missing. Please check your .env file.");
}

define('APP_NAME', 'DiaryPro');
define('APP_VERSION', '1.0.0');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); 
define('MAX_ENTRY_TEXT_LENGTH', 50000);


if (ini_get('upload_max_filesize')) {
    $uploadMax = ini_get('upload_max_filesize');
    $uploadMaxBytes = intval($uploadMax) * (strpos($uploadMax, 'M') !== false ? 1024 * 1024 : (strpos($uploadMax, 'K') !== false ? 1024 : 1));
    if ($uploadMaxBytes < MAX_FILE_SIZE) {
        error_log("WARNING: PHP upload_max_filesize ({$uploadMax}) is smaller than MAX_FILE_SIZE. Consider increasing it in php.ini");
    }
}

if (ini_get('post_max_size')) {
    $postMax = ini_get('post_max_size');
    $postMaxBytes = intval($postMax) * (strpos($postMax, 'M') !== false ? 1024 * 1024 : (strpos($postMax, 'K') !== false ? 1024 : 1));
    if ($postMaxBytes < MAX_FILE_SIZE * 2) {
        error_log("WARNING: PHP post_max_size ({$postMax}) may be too small for file uploads. Consider increasing it in php.ini");
    }
}

define('CSRF_TOKEN_NAME', 'csrf_token');
define('SESSION_TIMEOUT', 3600);

date_default_timezone_set('UTC');


ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);


function generateCsrfToken() {
    if (empty($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}


function validateCsrfToken($token) {
    return isset($_SESSION[CSRF_TOKEN_NAME]) && 
           hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}


function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}


function isAuthenticated() {
    return isset($_SESSION['user_id']) && isset($_SESSION['access_token']);
}


function requireAuth() {
    if (!isAuthenticated()) {
        header('Location: login.php');
        exit;
    }
}


function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}


function getAccessToken() {
    return $_SESSION['access_token'] ?? null;
}


function logout() {
    $_SESSION = array();
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    session_destroy();
}

