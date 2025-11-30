<?php
/**
 * Login Page
 * Handles user authentication with OWASP security features
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';
require_once __DIR__ . '/security.php';

$error = '';
$quote = null;

// Fetch random quote
try {
    $quoteResponse = file_get_contents('https://zenquotes.io/api/random');
    $quoteData = json_decode($quoteResponse, true);
    if (!empty($quoteData[0])) {
        $quote = [
            'text' => $quoteData[0]['q'] ?? 'Every day is a fresh start.',
            'author' => $quoteData[0]['a'] ?? 'Unknown'
        ];
    }
} catch (Exception $e) {
    $quote = [
        'text' => 'Every day is a fresh start. What you do today matters more than what happened yesterday.',
        'author' => 'Unknown'
    ];
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitizeInput($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    // CSRF Protection
    if (!validateCsrfToken($csrfToken)) {
        $error = 'Security validation failed. Please refresh the page and try again.';
    }
    // Check account lockout
    elseif (($lockoutStatus = isAccountLocked($email)) && $lockoutStatus['locked']) {
        $minutesRemaining = ceil(($lockoutStatus['lockedUntil'] - time()) / 60);
        $error = "Account is locked due to too many failed login attempts. Please try again in {$minutesRemaining} minute(s).";
    }
    // Rate limiting
    elseif (!($rateLimit = checkRateLimit("login:{$email}", 5, 900))['allowed']) {
        $minutesRemaining = ceil(($rateLimit['resetTime'] - time()) / 60);
        $error = "Too many login attempts. Please try again in {$minutesRemaining} minute(s).";
    }
    // Validate input
    elseif (empty($email) || empty($password)) {
        $error = 'Please enter both email and password.';
    }
    else {
        try {
            $client = new SupabaseClient();
            $response = $client->signIn($email, $password);
            
            if (isset($response['access_token'])) {
                recordSuccessfulLogin($email);
                header('Location: dashboard.php');
                exit;
            } else {
                throw new Exception('Invalid credentials');
            }
        } catch (Exception $e) {
            $lockoutResult = recordFailedAttempt($email);
            
            if ($lockoutResult['locked']) {
                $minutesRemaining = ceil(($lockoutResult['lockedUntil'] - time()) / 60);
                $error = "Login failed. Account locked due to too many failed attempts. Please try again in {$minutesRemaining} minute(s).";
            } else {
                $remaining = $lockoutResult['remainingAttempts'];
                $error = "Login failed: " . $e->getMessage();
                if ($remaining <= 2) {
                    $error .= "\n\nWarning: {$remaining} attempt(s) remaining before account lockout.";
                }
            }
        }
    }
}

$pageTitle = 'Sign In - DiaryPro';
$csrfToken = generateCsrfToken();

include __DIR__ . '/header.php';
?>

<div class="auth-container">
    <div class="auth-card">
        <?php if ($quote): ?>
        <div class="quote-card">
            <p class="quote-text"><?php echo htmlspecialchars($quote['text']); ?></p>
            <p class="quote-author">— <?php echo htmlspecialchars($quote['author']); ?></p>
        </div>
        <?php endif; ?>
        
        <h1 class="auth-title">Welcome Back</h1>
        
        <?php if ($error): ?>
        <div class="alert alert-error">
            <?php echo nl2br(htmlspecialchars($error)); ?>
        </div>
        <?php endif; ?>
        
        <form method="POST" action="login.php" class="space-y-4">
            <input type="hidden" name="csrf_token" value="<?php echo $csrfToken; ?>">
            
            <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    class="form-input" 
                    placeholder="your@email.com" 
                    required
                    value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>"
                >
            </div>
            
            <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    class="form-input" 
                    placeholder="••••••••" 
                    required
                >
            </div>
            
            <button type="submit" class="button button-primary button-full">
                Sign In
            </button>
        </form>
        
        <div class="mt-6 space-y-3">
            <p class="text-center text-muted">
                Don't have an account? 
                <a href="register.php" class="font-medium">Sign up</a>
            </p>
            <div style="position: relative; margin: 1rem 0;">
                <div style="position: absolute; inset: 0; display: flex; align-items: center;">
                    <span style="width: 100%; border-top: 1px solid var(--color-border);"></span>
                </div>
                <div style="position: relative; display: flex; justify-content: center;">
                    <span style="background: var(--color-background); padding: 0 0.5rem; font-size: 0.75rem; text-transform: uppercase; color: var(--color-muted);">Or</span>
                </div>
            </div>
            <a href="index.php" class="button button-secondary button-full">
                Continue as Guest
            </a>
        </div>
    </div>
</div>

<?php include __DIR__ . '/footer.php'; ?>

