<?php
/**
 * Security utilities for OWASP compliance
 * Password validation, rate limiting, account lockout, CSRF protection
 */

require_once __DIR__ . '/config.php';

/**
 * OWASP A07: Password strength validation
 */
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
    
    // Check minimum length
    if (strlen($password) >= 12) {
        $result['requirements']['minLength'] = true;
        $result['strength']++;
    }
    
    if (strlen($password) >= 16) {
        $result['strength']++;
    }
    
    // Check character requirements
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
    
    // Check for common passwords
    $commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123', 'admin', 'letmein', 'welcome'];
    $isCommon = false;
    foreach ($commonPasswords as $common) {
        if (stripos($password, $common) !== false) {
            $isCommon = true;
            break;
        }
    }
    $result['requirements']['notCommon'] = !$isCommon;
    
    // Validate all requirements
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

/**
 * OWASP A04: Rate limiting
 */
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
    
    // Reset if window expired
    if ($now > $limit['resetTime']) {
        $_SESSION[$rateLimitKey] = [
            'count' => 1,
            'resetTime' => $now + $windowSeconds
        ];
        return ['allowed' => true, 'remaining' => $maxRequests - 1];
    }
    
    // Check if limit exceeded
    if ($limit['count'] >= $maxRequests) {
        return [
            'allowed' => false,
            'remaining' => 0,
            'resetTime' => $limit['resetTime']
        ];
    }
    
    // Increment count
    $limit['count']++;
    $_SESSION[$rateLimitKey] = $limit;
    
    return [
        'allowed' => true,
        'remaining' => $maxRequests - $limit['count'],
        'resetTime' => $limit['resetTime']
    ];
}

/**
 * OWASP A07: Account lockout
 */
function recordFailedAttempt($identifier) {
    $lockoutKey = 'lockout_' . md5($identifier);
    $now = time();
    $maxAttempts = 5;
    $lockoutDuration = 900; // 15 minutes
    $resetWindow = 1800; // 30 minutes
    
    if (!isset($_SESSION[$lockoutKey])) {
        $_SESSION[$lockoutKey] = [
            'attempts' => 1,
            'lastAttempt' => $now,
            'lockedUntil' => null
        ];
        return ['locked' => false, 'remainingAttempts' => $maxAttempts - 1];
    }
    
    $lockout = $_SESSION[$lockoutKey];
    
    // Reset if window expired
    if ($now - $lockout['lastAttempt'] > $resetWindow) {
        $lockout['attempts'] = 0;
        $lockout['lockedUntil'] = null;
    }
    
    // Check if currently locked
    if ($lockout['lockedUntil'] && $now < $lockout['lockedUntil']) {
        return [
            'locked' => true,
            'remainingAttempts' => 0,
            'lockedUntil' => $lockout['lockedUntil']
        ];
    }
    
    // Reset if lockout expired
    if ($lockout['lockedUntil'] && $now >= $lockout['lockedUntil']) {
        $lockout['attempts'] = 0;
        $lockout['lockedUntil'] = null;
    }
    
    // Increment attempts
    $lockout['attempts']++;
    $lockout['lastAttempt'] = $now;
    
    // Lock if max attempts reached
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
    
    // Lockout expired
    unset($_SESSION[$lockoutKey]);
    return ['locked' => false, 'lockedUntil' => null];
}

function recordSuccessfulLogin($identifier) {
    $lockoutKey = 'lockout_' . md5($identifier);
    unset($_SESSION[$lockoutKey]);
}

/**
 * OWASP A03: File name sanitization
 */
function sanitizeFileName($fileName) {
    // Remove path components
    $basename = basename($fileName);
    $nameParts = explode('.', $basename);
    $extension = count($nameParts) > 1 ? '.' . array_pop($nameParts) : '';
    $name = implode('.', $nameParts);
    
    // Remove special characters
    $sanitized = preg_replace('/[^a-zA-Z0-9._-]/', '_', $name);
    
    // Limit length
    $maxLength = 255;
    $finalName = strlen($sanitized) > ($maxLength - strlen($extension))
        ? substr($sanitized, 0, $maxLength - strlen($extension)) . $extension
        : $sanitized . $extension;
    
    return $finalName ?: 'file';
}

/**
 * OWASP A03: XSS sanitization
 */
function sanitizeText($text) {
    if (empty($text)) return '';
    
    // Escape HTML special characters
    return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}

/**
 * OWASP A08: File type validation (magic bytes)
 * Returns true if file matches expected type, false otherwise
 * This is a best-effort validation - MIME type is primary validation
 */
function validateFileType($filePath, $expectedType) {
    if (!file_exists($filePath)) {
        return ['valid' => false, 'error' => 'File not found'];
    }
    
    $handle = @fopen($filePath, 'rb');
    if (!$handle) {
        return ['valid' => false, 'error' => 'Cannot read file'];
    }
    
    $bytes = @fread($handle, 16); // Read more bytes for better detection
    fclose($handle);
    
    if (strlen($bytes) < 4) {
        return ['valid' => false, 'error' => 'File too small to validate'];
    }
    
    $byteArray = array_values(unpack('C*', $bytes));
    
    // Image signatures (more comprehensive)
    $imageSignatures = [
        [0xFF, 0xD8, 0xFF], // JPEG
        [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
        [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
        [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
        [0x52, 0x49, 0x46, 0x46], // WebP (RIFF header, check further)
        [0x42, 0x4D], // BMP
    ];
    
    // Audio signatures (more comprehensive)
    $audioSignatures = [
        [0xFF, 0xFB], // MP3 (ID3v2)
        [0xFF, 0xF3], // MP3
        [0xFF, 0xF2], // MP3
        [0x49, 0x44, 0x33], // MP3 (ID3v1)
        [0x52, 0x49, 0x46, 0x46], // WAV/RIFF (check for WAVE)
        [0x4F, 0x67, 0x67, 0x53], // OGG
        [0x66, 0x4C, 0x61, 0x43], // FLAC
    ];
    
    // Video signatures (more comprehensive)
    $videoSignatures = [
        [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // MP4
        [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // MP4 variant
        [0x1A, 0x45, 0xDF, 0xA3], // WebM/EBML
        [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70], // QuickTime/MOV
        [0x52, 0x49, 0x46, 0x46], // AVI (RIFF header)
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
    
    // Check each signature
    foreach ($signatures as $sig) {
        $matches = true;
        $sigLength = count($sig);
        
        // For RIFF-based files (WebP, WAV, AVI), check for specific sub-types
        if ($sig[0] === 0x52 && $sig[1] === 0x49 && $sig[2] === 0x46 && $sig[3] === 0x46) {
            // RIFF header - check for specific type markers
            if ($expectedType === 'image' && isset($byteArray[8]) && isset($byteArray[9]) && isset($byteArray[10]) && isset($byteArray[11])) {
                // Check for WEBP
                if ($byteArray[8] === 0x57 && $byteArray[9] === 0x45 && $byteArray[10] === 0x42 && $byteArray[11] === 0x50) {
                    return ['valid' => true];
                }
            }
            if ($expectedType === 'audio' && isset($byteArray[8]) && isset($byteArray[9]) && isset($byteArray[10]) && isset($byteArray[11])) {
                // Check for WAVE
                if ($byteArray[8] === 0x57 && $byteArray[9] === 0x41 && $byteArray[10] === 0x56 && $byteArray[11] === 0x45) {
                    return ['valid' => true];
                }
            }
            if ($expectedType === 'video' && isset($byteArray[8]) && isset($byteArray[9]) && isset($byteArray[10]) && isset($byteArray[11])) {
                // Check for AVI
                if ($byteArray[8] === 0x41 && $byteArray[9] === 0x56 && $byteArray[10] === 0x49 && $byteArray[11] === 0x20) {
                    return ['valid' => true];
                }
            }
        }
        
        // Standard signature matching
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
    
    // If no signature matches, return false but this is not fatal
    // MIME type validation is the primary check
    return [
        'valid' => false,
        'error' => "File signature does not match expected {$expectedType} type. File may be corrupted or have an unusual format."
    ];
}

