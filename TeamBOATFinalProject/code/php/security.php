<?php

require_once __DIR__ . '/config.php';

function validatePassword($password) {
    $result = [
        'valid' => false,
        'message' => '',
        'strength' => 0,
        'requirements' => [
            'minLength' => false,
            'hasUppercase' => false,
            'hasLowercase' => false,
            'hasNumber' => false,
            'hasSymbol' => false,
            'notCommon' => false
        ]
    ];
    
    if (strlen($password) >= 12) {
        $result['requirements']['minLength'] = true;
        $result['strength']++;
    }
    
    if (strlen($password) >= 16) {
        $result['strength']++;
    }
    
    if (preg_match('/[A-Z]/', $password)) {
        $result['requirements']['hasUppercase'] = true;
        $result['strength']++;
    }
    
    if (preg_match('/[a-z]/', $password)) {
        $result['requirements']['hasLowercase'] = true;
        $result['strength']++;
    }
    
    if (preg_match('/[0-9]/', $password)) {
        $result['requirements']['hasNumber'] = true;
        $result['strength']++;
    }
    
    if (preg_match('/[^a-zA-Z0-9]/', $password)) {
        $result['requirements']['hasSymbol'] = true;
        $result['strength']++;
    }
    
    $commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123', 'admin', 'letmein', 'welcome'];
    $isCommon = false;
    foreach ($commonPasswords as $common) {
        if (stripos($password, $common) !== false) {
            $isCommon = true;
            break;
        }
    }
    $result['requirements']['notCommon'] = !$isCommon;
    
    $allMet = array_reduce($result['requirements'], function($carry, $req) {
        return $carry && $req;
    }, true);
    
    if ($allMet && $result['strength'] >= 4) {
        $result['valid'] = true;
    } else {
        $missing = [];
        if (!$result['requirements']['minLength']) $missing[] = 'at least 12 characters';
        if (!$result['requirements']['hasUppercase']) $missing[] = 'uppercase letter';
        if (!$result['requirements']['hasLowercase']) $missing[] = 'lowercase letter';
        if (!$result['requirements']['hasNumber']) $missing[] = 'number';
        if (!$result['requirements']['hasSymbol']) $missing[] = 'symbol';
        if (!$result['requirements']['notCommon']) $missing[] = 'not be a common password';
        
        $result['message'] = 'Password must contain: ' . implode(', ', $missing);
    }
    
    return $result;
}

function checkRateLimit($key, $maxRequests = 5, $windowSeconds = 900) {
    $rateLimitKey = 'rate_limit_' . md5($key);
    $now = time();
    
    if (!isset($_SESSION[$rateLimitKey])) {
        $_SESSION[$rateLimitKey] = [
            'count' => 1,
            'resetTime' => $now + $windowSeconds
        ];
        return ['allowed' => true, 'remaining' => $maxRequests - 1];
    }
    
    $limit = $_SESSION[$rateLimitKey];
    
    if ($now > $limit['resetTime']) {
        $_SESSION[$rateLimitKey] = [
            'count' => 1,
            'resetTime' => $now + $windowSeconds
        ];
        return ['allowed' => true, 'remaining' => $maxRequests - 1];
    }
    
    if ($limit['count'] >= $maxRequests) {
        return [
            'allowed' => false,
            'remaining' => 0,
            'resetTime' => $limit['resetTime']
        ];
    }
    
    $limit['count']++;
    $_SESSION[$rateLimitKey] = $limit;
    
    return [
        'allowed' => true,
        'remaining' => $maxRequests - $limit['count'],
        'resetTime' => $limit['resetTime']
    ];
}


function recordFailedAttempt($identifier) {
    $lockoutKey = 'lockout_' . md5($identifier);
    $now = time();
    $maxAttempts = 5;
    $lockoutDuration = 900; 
    $resetWindow = 1800; 
    
    if (!isset($_SESSION[$lockoutKey])) {
        $_SESSION[$lockoutKey] = [
            'attempts' => 1,
            'lastAttempt' => $now,
            'lockedUntil' => null
        ];
        return ['locked' => false, 'remainingAttempts' => $maxAttempts - 1];
    }
    
    $lockout = $_SESSION[$lockoutKey];
    
    if ($now - $lockout['lastAttempt'] > $resetWindow) {
        $lockout['attempts'] = 0;
        $lockout['lockedUntil'] = null;
    }
    
    if ($lockout['lockedUntil'] && $now < $lockout['lockedUntil']) {
        return [
            'locked' => true,
            'remainingAttempts' => 0,
            'lockedUntil' => $lockout['lockedUntil']
        ];
    }
    
    if ($lockout['lockedUntil'] && $now >= $lockout['lockedUntil']) {
        $lockout['attempts'] = 0;
        $lockout['lockedUntil'] = null;
    }
    
    $lockout['attempts']++;
    $lockout['lastAttempt'] = $now;
    
    if ($lockout['attempts'] >= $maxAttempts) {
        $lockout['lockedUntil'] = $now + $lockoutDuration;
    }
    
    $_SESSION[$lockoutKey] = $lockout;
    
    return [
        'locked' => $lockout['lockedUntil'] !== null && $now < $lockout['lockedUntil'],
        'remainingAttempts' => max(0, $maxAttempts - $lockout['attempts']),
        'lockedUntil' => $lockout['lockedUntil']
    ];
}

function isAccountLocked($identifier) {
    $lockoutKey = 'lockout_' . md5($identifier);
    $now = time();
    
    if (!isset($_SESSION[$lockoutKey])) {
        return ['locked' => false, 'lockedUntil' => null];
    }
    
    $lockout = $_SESSION[$lockoutKey];
    
    if ($lockout['lockedUntil'] && $now < $lockout['lockedUntil']) {
        return [
            'locked' => true,
            'lockedUntil' => $lockout['lockedUntil'],
            'remainingTime' => $lockout['lockedUntil'] - $now
        ];
    }
    

    unset($_SESSION[$lockoutKey]);
    return ['locked' => false, 'lockedUntil' => null];
}

function recordSuccessfulLogin($identifier) {
    $lockoutKey = 'lockout_' . md5($identifier);
    unset($_SESSION[$lockoutKey]);
}


function sanitizeFileName($fileName) {
  
    $basename = basename($fileName);
    $nameParts = explode('.', $basename);
    $extension = count($nameParts) > 1 ? '.' . array_pop($nameParts) : '';
    $name = implode('.', $nameParts);
    

    $sanitized = preg_replace('/[^a-zA-Z0-9._-]/', '_', $name);
    

    $maxLength = 255;
    $finalName = strlen($sanitized) > ($maxLength - strlen($extension))
        ? substr($sanitized, 0, $maxLength - strlen($extension)) . $extension
        : $sanitized . $extension;
    
    return $finalName ?: 'file';
}


function sanitizeText($text) {
    if (empty($text)) return '';
    

    return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}


function validateFileType($filePath, $expectedType) {
    if (!file_exists($filePath)) {
        return ['valid' => false, 'error' => 'File not found'];
    }
    
    $handle = @fopen($filePath, 'rb');
    if (!$handle) {
        return ['valid' => false, 'error' => 'Cannot read file'];
    }
    
    $bytes = @fread($handle, 16); 
    fclose($handle);
    
    if (strlen($bytes) < 4) {
        return ['valid' => false, 'error' => 'File too small to validate'];
    }
    
    $byteArray = array_values(unpack('C*', $bytes));
    
 
    $imageSignatures = [
        [0xFF, 0xD8, 0xFF],
        [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], 
        [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], 
        [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], 
        [0x52, 0x49, 0x46, 0x46], 
        [0x42, 0x4D], 
    ];
    
  
    $audioSignatures = [
        [0xFF, 0xFB], 
        [0xFF, 0xF3], 
        [0xFF, 0xF2], 
        [0x49, 0x44, 0x33], 
        [0x52, 0x49, 0x46, 0x46], 
        [0x4F, 0x67, 0x67, 0x53],
        [0x66, 0x4C, 0x61, 0x43], 
    ];
    
   
    $videoSignatures = [
        [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], 
        [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], 
        [0x1A, 0x45, 0xDF, 0xA3], 
        [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70], 
        [0x52, 0x49, 0x46, 0x46], 
    ];
    
    $signatures = [];
    switch ($expectedType) {
        case 'image':
            $signatures = $imageSignatures;
            break;
        case 'audio':
            $signatures = $audioSignatures;
            break;
        case 'video':
            $signatures = $videoSignatures;
            break;
        default:
            return ['valid' => false, 'error' => 'Invalid file type category'];
    }
    
 
    foreach ($signatures as $sig) {
        $matches = true;
        $sigLength = count($sig);
        
  
        if ($sig[0] === 0x52 && $sig[1] === 0x49 && $sig[2] === 0x46 && $sig[3] === 0x46) {

            if ($expectedType === 'image' && isset($byteArray[8]) && isset($byteArray[9]) && isset($byteArray[10]) && isset($byteArray[11])) {

                if ($byteArray[8] === 0x57 && $byteArray[9] === 0x45 && $byteArray[10] === 0x42 && $byteArray[11] === 0x50) {
                    return ['valid' => true];
                }
            }
            if ($expectedType === 'audio' && isset($byteArray[8]) && isset($byteArray[9]) && isset($byteArray[10]) && isset($byteArray[11])) {

                if ($byteArray[8] === 0x57 && $byteArray[9] === 0x41 && $byteArray[10] === 0x56 && $byteArray[11] === 0x45) {
                    return ['valid' => true];
                }
            }
            if ($expectedType === 'video' && isset($byteArray[8]) && isset($byteArray[9]) && isset($byteArray[10]) && isset($byteArray[11])) {
                if ($byteArray[8] === 0x41 && $byteArray[9] === 0x56 && $byteArray[10] === 0x49 && $byteArray[11] === 0x20) {
                    return ['valid' => true];
                }
            }
        }
        
        for ($i = 0; $i < $sigLength; $i++) {
            if (!isset($byteArray[$i]) || $byteArray[$i] !== $sig[$i]) {
                $matches = false;
                break;
            }
        }
        if ($matches) {
            return ['valid' => true];
        }
    }
    

    return [
        'valid' => false,
        'error' => "File signature does not match expected {$expectedType} type. File may be corrupted or have an unusual format."
    ];
}

