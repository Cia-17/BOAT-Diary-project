<?php
/**
 * Settings Page
 * User account settings and preferences
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';
require_once __DIR__ . '/security.php';

requireAuth();

$error = '';
$success = '';
$client = new SupabaseClient();
$userId = getCurrentUserId();

// Get user data
try {
    $user = $client->getUser();
    $userName = $user['user_metadata']['full_name'] ?? $user['user_metadata']['name'] ?? explode('@', $user['email'])[0] ?? 'User';
    $userEmail = $user['email'] ?? '';
    
    $entries = $client->getEntries($userId, 1000);
    $entryCount = count($entries);
} catch (Exception $e) {
    $error = 'Failed to load user data: ' . $e->getMessage();
    $userName = 'User';
    $userEmail = '';
    $entryCount = 0;
}

// Handle password change
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['change_password'])) {
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    if ($newPassword !== $confirmPassword) {
        $error = 'Passwords do not match.';
    } elseif (!($passwordValidation = validatePassword($newPassword))['valid']) {
        $error = $passwordValidation['message'];
    } else {
        try {
            // Note: Supabase password update requires special endpoint
            // This is a simplified version - in production, use Supabase Admin API
            $error = 'Password change functionality requires Supabase Admin API. Please use the Supabase dashboard to change your password.';
        } catch (Exception $e) {
            $error = 'Failed to change password: ' . $e->getMessage();
        }
    }
}

$pageTitle = 'Settings - DiaryPro';
include __DIR__ . '/header.php';
?>

<div class="page-container">
    <div class="container-narrow">
        <div class="page-header">
            <h1 class="page-title">Settings</h1>
        </div>
        
        <?php if ($error): ?>
        <div class="alert alert-error">
            <?php echo htmlspecialchars($error); ?>
        </div>
        <?php endif; ?>
        
        <?php if ($success): ?>
        <div class="alert alert-success">
            <?php echo htmlspecialchars($success); ?>
        </div>
        <?php endif; ?>
        
        <!-- Profile Information -->
        <div class="card" style="margin-bottom: 2rem;">
            <div class="card-header">
                <h2 class="card-title">Profile Information</h2>
            </div>
            <div class="card-content">
                <div class="form-group">
                    <label class="form-label">Name</label>
                    <input type="text" class="form-input" value="<?php echo htmlspecialchars($userName); ?>" disabled>
                    <small class="text-muted">Name cannot be changed from this interface.</small>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" value="<?php echo htmlspecialchars($userEmail); ?>" disabled>
                    <small class="text-muted">Email cannot be changed from this interface.</small>
                </div>
            </div>
        </div>
        
        <!-- Statistics -->
        <div class="card" style="margin-bottom: 2rem;">
            <div class="card-header">
                <h2 class="card-title">Statistics</h2>
            </div>
            <div class="card-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div>
                        <p class="text-muted" style="font-size: 0.875rem; margin-bottom: 0.25rem;">Total Entries</p>
                        <p style="font-size: 2rem; font-weight: 700;"><?php echo $entryCount; ?></p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Change Password -->
        <div class="card" style="margin-bottom: 2rem;">
            <div class="card-header">
                <h2 class="card-title">Change Password</h2>
            </div>
            <div class="card-content">
                <form method="POST" action="settings.php">
                    <input type="hidden" name="change_password" value="1">
                    
                    <div class="form-group">
                        <label for="new_password" class="form-label">New Password</label>
                        <input 
                            type="password" 
                            id="new_password" 
                            name="new_password" 
                            class="form-input" 
                            placeholder="Enter new password"
                            minlength="12"
                            required
                        >
                        <small class="text-muted">Password must be at least 12 characters with uppercase, lowercase, numbers, and symbols.</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirm_password" class="form-label">Confirm New Password</label>
                        <input 
                            type="password" 
                            id="confirm_password" 
                            name="confirm_password" 
                            class="form-input" 
                            placeholder="Confirm new password"
                            minlength="12"
                            required
                        >
                    </div>
                    
                    <button type="submit" class="button button-primary">
                        Change Password
                    </button>
                </form>
            </div>
        </div>
        
        <!-- Danger Zone -->
        <div class="card" style="border-color: #ef4444;">
            <div class="card-header">
                <h2 class="card-title" style="color: #ef4444;">Danger Zone</h2>
            </div>
            <div class="card-content">
                <p class="text-muted" style="margin-bottom: 1rem;">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button type="button" class="button button-danger" onclick="if(confirm('Are you absolutely sure? This will delete all your entries and cannot be undone.')) { alert('Account deletion requires Supabase Admin API. Please contact support.'); }">
                    Delete Account
                </button>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/footer.php'; ?>

