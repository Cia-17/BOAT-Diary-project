<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';
require_once __DIR__ . '/security.php';

$error = '';
$success = false;
$quote = null;

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


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = sanitizeInput($_POST['name'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    $csrfToken = $_POST['csrf_token'] ?? '';
    

    if (!validateCsrfToken($csrfToken)) {
        $error = 'Security validation failed. Please refresh the page and try again.';
    }

    elseif (!($rateLimit = checkRateLimit("register:{$email}", 3, 3600))['allowed']) {
        $minutesRemaining = ceil(($rateLimit['resetTime'] - time()) / 60);
        $error = "Too many registration attempts. Please try again in {$minutesRemaining} minute(s).";
    }
 
    elseif ($password !== $confirmPassword) {
        $error = 'Passwords do not match.';
    }

    elseif (!($passwordValidation = validatePassword($password))['valid']) {
        $error = $passwordValidation['message'];
    }

    elseif (empty($name) || empty($email) || empty($password)) {
        $error = 'Please fill in all fields.';
    }
    else {
        try {
            $client = new SupabaseClient();
            $response = $client->signUp($email, $password, [
                'name' => $name,
                'full_name' => $name
            ]);
            
            if (isset($response['user'])) {
                $success = true;
                $error = 'Account created successfully! Please check your email to verify your account.';
            } else {
                throw new Exception('Registration failed');
            }
        } catch (Exception $e) {
            $error = 'Registration failed: ' . $e->getMessage();
        }
    }
}

$pageTitle = 'Create Account - DiaryPro';
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
        
        <h1 class="auth-title">Create Account</h1>
        
        <?php if ($error): ?>
        <div class="alert <?php echo $success ? 'alert-success' : 'alert-error'; ?>">
            <?php echo nl2br(htmlspecialchars($error)); ?>
        </div>
        <?php endif; ?>
        
        <?php if (!$success): ?>
        <form method="POST" action="register.php" class="space-y-4" id="registerForm">
            <input type="hidden" name="csrf_token" value="<?php echo $csrfToken; ?>">
            
            <div class="form-group">
                <label for="name" class="form-label">Name</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    class="form-input" 
                    placeholder="Your name" 
                    required
                    value="<?php echo htmlspecialchars($_POST['name'] ?? ''); ?>"
                >
            </div>
            
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
                    minlength="12"
                >
                <div id="passwordStrength" style="margin-top: 0.5rem; display: none;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
                        <span class="text-muted">Password Strength:</span>
                        <span id="strengthLabel" class="font-medium"></span>
                    </div>
                    <div style="width: 100%; background: var(--color-border); border-radius: 999px; height: 6px;">
                        <div id="strengthBar" style="height: 6px; border-radius: 999px; transition: all 0.3s; width: 0%;"></div>
                    </div>
                    <p id="passwordFeedback" class="form-error" style="font-size: 0.75rem; margin-top: 0.25rem;"></p>
                </div>
            </div>
            
            <div class="form-group">
                <label for="confirm_password" class="form-label">Confirm Password</label>
                <input 
                    type="password" 
                    id="confirm_password" 
                    name="confirm_password" 
                    class="form-input" 
                    placeholder="••••••••" 
                    required
                    minlength="12"
                >
            </div>
            
            <button type="submit" class="button button-primary button-full">
                Sign Up
            </button>
        </form>
        <?php else: ?>
        <div class="text-center">
            <p class="mb-4">Account created successfully! Please check your email to verify your account.</p>
            <a href="login.php" class="button button-primary">Go to Sign In</a>
        </div>
        <?php endif; ?>
        
        <div class="mt-6 space-y-3">
            <p class="text-center text-muted">
                Already have an account? 
                <a href="login.php" class="font-medium">Sign in</a>
            </p>
        </div>
    </div>
</div>

<script>

document.getElementById('password')?.addEventListener('input', function(e) {
    const password = e.target.value;
    const strengthDiv = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('strengthBar');
    const strengthLabel = document.getElementById('strengthLabel');
    const feedback = document.getElementById('passwordFeedback');
    
    if (password.length === 0) {
        strengthDiv.style.display = 'none';
        return;
    }
    
    strengthDiv.style.display = 'block';
    
    let strength = 0;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const percentage = (strength / 6) * 100;
    strengthBar.style.width = percentage + '%';
    
    let label = '';
    let color = '';
    if (strength <= 2) {
        label = 'Very Weak';
        color = '#ef4444';
    } else if (strength <= 3) {
        label = 'Weak';
        color = '#f97316';
    } else if (strength <= 4) {
        label = 'Fair';
        color = '#eab308';
    } else if (strength <= 5) {
        label = 'Good';
        color = '#22c55e';
    } else {
        label = 'Strong';
        color = '#22c55e';
    }
    
    strengthBar.style.backgroundColor = color;
    strengthLabel.textContent = label;
    strengthLabel.style.color = color;
    
   
    if (strength < 4) {
        feedback.textContent = 'Password must contain: uppercase, lowercase, numbers, and symbols';
        feedback.style.display = 'block';
    } else {
        feedback.style.display = 'none';
    }
});
</script>

<?php include __DIR__ . '/footer.php'; ?>

