<?php

require_once __DIR__ . '/config.php';

$pageTitle = 'Upload Configuration Test';
include __DIR__ . '/header.php';
?>

<div class="page-container">
    <div class="container-narrow">
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">PHP Upload Configuration</h2>
            </div>
            <div class="card-content">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <td style="padding: 0.5rem; font-weight: 600;">Setting</td>
                        <td style="padding: 0.5rem; font-weight: 600;">Value</td>
                        <td style="padding: 0.5rem; font-weight: 600;">Status</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <td style="padding: 0.5rem;">upload_max_filesize</td>
                        <td style="padding: 0.5rem;"><?php echo ini_get('upload_max_filesize'); ?></td>
                        <td style="padding: 0.5rem;">
                            <?php 
                            $uploadMax = ini_get('upload_max_filesize');
                            $uploadMaxBytes = intval($uploadMax) * (strpos($uploadMax, 'M') !== false ? 1024 * 1024 : (strpos($uploadMax, 'K') !== false ? 1024 : 1));
                            echo $uploadMaxBytes >= MAX_FILE_SIZE ? '<span style="color: #22c55e;">✓ OK</span>' : '<span style="color: #ef4444;">⚠ Too small</span>';
                            ?>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <td style="padding: 0.5rem;">post_max_size</td>
                        <td style="padding: 0.5rem;"><?php echo ini_get('post_max_size'); ?></td>
                        <td style="padding: 0.5rem;">
                            <?php 
                            $postMax = ini_get('post_max_size');
                            $postMaxBytes = intval($postMax) * (strpos($postMax, 'M') !== false ? 1024 * 1024 : (strpos($postMax, 'K') !== false ? 1024 : 1));
                            echo $postMaxBytes >= MAX_FILE_SIZE * 2 ? '<span style="color: #22c55e;">✓ OK</span>' : '<span style="color: #ef4444;">⚠ May be too small</span>';
                            ?>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <td style="padding: 0.5rem;">max_file_uploads</td>
                        <td style="padding: 0.5rem;"><?php echo ini_get('max_file_uploads'); ?></td>
                        <td style="padding: 0.5rem;"><span style="color: #22c55e;">✓ OK</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <td style="padding: 0.5rem;">file_uploads</td>
                        <td style="padding: 0.5rem;"><?php echo ini_get('file_uploads') ? 'Enabled' : 'Disabled'; ?></td>
                        <td style="padding: 0.5rem;">
                            <?php echo ini_get('file_uploads') ? '<span style="color: #22c55e;">✓ OK</span>' : '<span style="color: #ef4444;">✗ Disabled</span>'; ?>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <td style="padding: 0.5rem;">MAX_FILE_SIZE (App)</td>
                        <td style="padding: 0.5rem;"><?php echo (MAX_FILE_SIZE / 1024 / 1024); ?>MB</td>
                        <td style="padding: 0.5rem;"><span style="color: #22c55e;">✓ OK</span></td>
                    </tr>
                </table>
                
                <div style="margin-top: 2rem; padding: 1rem; background: var(--color-event-yellow); border-radius: var(--radius);">
                    <h3 style="margin-bottom: 0.5rem;">Test File Upload</h3>
                    <form method="POST" action="upload_test.php" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="test_file" class="form-label">Select a test file</label>
                            <input type="file" id="test_file" name="test_file" class="form-input" accept="image/*,audio/*,video/*">
                        </div>
                        <button type="submit" class="button button-primary">Test Upload</button>
                    </form>
                    
                    <?php
                    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['test_file'])) {
                        echo '<div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: var(--radius);">';
                        echo '<h4>Upload Result:</h4>';
                        
                        if ($_FILES['test_file']['error'] === UPLOAD_ERR_OK) {
                            echo '<p style="color: #22c55e;">✓ File uploaded successfully!</p>';
                            echo '<p><strong>Name:</strong> ' . htmlspecialchars($_FILES['test_file']['name']) . '</p>';
                            echo '<p><strong>Type:</strong> ' . htmlspecialchars($_FILES['test_file']['type']) . '</p>';
                            echo '<p><strong>Size:</strong> ' . number_format($_FILES['test_file']['size'] / 1024, 2) . ' KB</p>';
                            echo '<p><strong>Temporary Path:</strong> ' . htmlspecialchars($_FILES['test_file']['tmp_name']) . '</p>';
                        } else {
                            $errorMessages = [
                                UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive',
                                UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive',
                                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                                UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                                UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
                            ];
                            echo '<p style="color: #ef4444;">✗ Upload failed: ' . ($errorMessages[$_FILES['test_file']['error']] ?? 'Unknown error') . '</p>';
                        }
                        echo '</div>';
                    }
                    ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/footer.php'; ?>

