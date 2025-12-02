<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';
require_once __DIR__ . '/security.php';

requireAuth();

$error = '';
$client = new SupabaseClient();
$userId = getCurrentUserId();
$entryId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($entryId <= 0) {
    header('Location: dashboard.php');
    exit;
}

try {
    $entry = $client->getEntryById($entryId, $userId);
    if (!$entry) {
        $error = 'Entry not found or you do not have permission to view it.';
    }
} catch (Exception $e) {
    $error = 'Failed to load entry: ' . $e->getMessage();
    $entry = null;
}

$pageTitle = 'View Entry - DiaryPro';
include __DIR__ . '/header.php';
?>

<div class="page-container">
    <div class="container-narrow">
        <?php if ($error): ?>
        <div class="alert alert-error">
            <?php echo htmlspecialchars($error); ?>
        </div>
        <a href="dashboard.php" class="button button-secondary">Back to Dashboard</a>
        <?php elseif ($entry): ?>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <a href="dashboard.php" class="button button-secondary">← Back</a>
            <div style="display: flex; gap: 0.5rem;">
                <a href="entry_edit.php?id=<?php echo $entry['entry_id']; ?>" class="button button-secondary">
                    Edit
                </a>
                <a href="dashboard.php?delete=<?php echo $entry['entry_id']; ?>" 
                   class="button button-danger"
                   onclick="return confirm('Are you sure you want to delete this entry?');">
                    Delete
                </a>
            </div>
        </div>
        
        <div class="card">
            <div class="card-content">
                <div class="entry-header">
                    <div>
                        <div class="entry-date">
                            <?php 
                            $date = new DateTime($entry['entry_date']);
                            echo $date->format('F j, Y') . ' at ' . date('g:i A', strtotime($entry['entry_time']));
                            ?>
                        </div>
                        <?php if (isset($entry['mood'])): ?>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                            <span style="font-size: 1.5rem;"><?php echo htmlspecialchars($entry['mood']['mood_emoji'] ?? ''); ?></span>
                            <span style="font-size: 1.125rem; font-weight: 600;"><?php echo htmlspecialchars($entry['mood']['mood_name']); ?></span>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
                
                <div class="entry-text" style="font-size: 1.125rem; line-height: 1.8; margin: 2rem 0;">
                    <?php echo nl2br(htmlspecialchars($entry['entry_text'])); ?>
                </div>
                
                <?php if (!empty($entry['media_files'])): ?>
                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--color-border);">
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Media</h3>
                    <div class="media-preview">
                        <?php foreach ($entry['media_files'] as $media): ?>
                        <div class="media-item">
                            <?php if ($media['media_category'] === 'image'): ?>
                            <img src="data:<?php echo htmlspecialchars($media['file_type']); ?>;base64,<?php echo htmlspecialchars($media['base64_data']); ?>" 
                                 alt="<?php echo htmlspecialchars($media['file_name']); ?>"
                                 style="width: 100%; height: auto; border-radius: var(--radius);">
                            <?php elseif ($media['media_category'] === 'audio'): ?>
                            <div style="padding: 2rem; background: var(--color-border); border-radius: var(--radius); text-align: center;">
                                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎵</div>
                                <p style="font-size: 0.875rem; color: var(--color-muted);"><?php echo htmlspecialchars($media['file_name']); ?></p>
                                <audio controls style="width: 100%; margin-top: 1rem;">
                                    <source src="data:<?php echo htmlspecialchars($media['file_type']); ?>;base64,<?php echo htmlspecialchars($media['base64_data']); ?>" type="<?php echo htmlspecialchars($media['file_type']); ?>">
                                </audio>
                            </div>
                            <?php elseif ($media['media_category'] === 'video'): ?>
                            <div style="padding: 2rem; background: var(--color-border); border-radius: var(--radius); text-align: center;">
                                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎬</div>
                                <p style="font-size: 0.875rem; color: var(--color-muted);"><?php echo htmlspecialchars($media['file_name']); ?></p>
                                <video controls style="width: 100%; margin-top: 1rem; border-radius: var(--radius);">
                                    <source src="data:<?php echo htmlspecialchars($media['file_type']); ?>;base64,<?php echo htmlspecialchars($media['base64_data']); ?>" type="<?php echo htmlspecialchars($media['file_type']); ?>">
                                </video>
                            </div>
                            <?php endif; ?>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>

<?php include __DIR__ . '/footer.php'; ?>

