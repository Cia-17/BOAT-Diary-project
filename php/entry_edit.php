<?php
/**
 * Edit Entry Page
 * Edit existing journal entry
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';
require_once __DIR__ . '/security.php';

requireAuth();

$error = '';
$success = '';
$client = new SupabaseClient();
$userId = getCurrentUserId();
$entryId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($entryId <= 0) {
    header('Location: dashboard.php');
    exit;
}

// Load entry
try {
    $entry = $client->getEntryById($entryId, $userId);
    if (!$entry) {
        $error = 'Entry not found or you do not have permission to edit it.';
        $entry = null;
    }
} catch (Exception $e) {
    $error = 'Failed to load entry: ' . $e->getMessage();
    $entry = null;
}

// Load moods
try {
    $moods = $client->getMoods();
} catch (Exception $e) {
    $moods = [];
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $entry) {
    $moodId = intval($_POST['mood_id'] ?? 0);
    $entryText = sanitizeInput($_POST['entry_text'] ?? '');
    $entryDate = $_POST['entry_date'] ?? date('Y-m-d');
    $entryTime = $_POST['entry_time'] ?? date('H:i');
    
    // Validate input
    if (empty($entryText)) {
        $error = 'Please enter some text for your entry.';
    } elseif ($moodId <= 0) {
        $error = 'Please select a mood.';
    } elseif (strlen($entryText) > MAX_ENTRY_TEXT_LENGTH) {
        $error = 'Entry text is too long. Maximum ' . MAX_ENTRY_TEXT_LENGTH . ' characters.';
    } else {
        try {
            $mediaFiles = [];
            
            // Keep existing media files
            if (!empty($entry['media_files'])) {
                foreach ($entry['media_files'] as $existingMedia) {
                    $mediaFiles[] = [
                        'file_name' => $existingMedia['file_name'],
                        'file_type' => $existingMedia['file_type'],
                        'media_category' => $existingMedia['media_category'],
                        'base64_data' => $existingMedia['base64_data']
                    ];
                }
            }
            
            // Process new uploaded media files
            $fileErrors = [];
            if (!empty($_FILES['media_files']['name'][0])) {
                $fileCount = count($_FILES['media_files']['name']);
                
                for ($i = 0; $i < $fileCount; $i++) {
                    // Check for upload errors
                    $uploadError = $_FILES['media_files']['error'][$i];
                    
                    if ($uploadError !== UPLOAD_ERR_OK) {
                        $errorMessages = [
                            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive',
                            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive',
                            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
                        ];
                        $fileErrors[] = $_FILES['media_files']['name'][$i] . ': ' . ($errorMessages[$uploadError] ?? 'Unknown upload error');
                        continue;
                    }
                    
                    if (!isset($_FILES['media_files']['tmp_name'][$i]) || !is_uploaded_file($_FILES['media_files']['tmp_name'][$i])) {
                        $fileErrors[] = $_FILES['media_files']['name'][$i] . ': Invalid file upload';
                        continue;
                    }
                    
                    $file = [
                        'name' => $_FILES['media_files']['name'][$i],
                        'type' => $_FILES['media_files']['type'][$i],
                        'tmp_name' => $_FILES['media_files']['tmp_name'][$i],
                        'size' => $_FILES['media_files']['size'][$i]
                    ];
                    
                    // Validate file size
                    if ($file['size'] > MAX_FILE_SIZE) {
                        $fileErrors[] = $file['name'] . ' is too large. Maximum size is ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB.';
                        continue;
                    }
                    
                    if ($file['size'] == 0) {
                        $fileErrors[] = $file['name'] . ' is empty.';
                        continue;
                    }
                    
                    // Determine file category based on MIME type
                    $category = null;
                    if (strpos($file['type'], 'image/') === 0) {
                        $category = 'image';
                    } elseif (strpos($file['type'], 'audio/') === 0) {
                        $category = 'audio';
                    } elseif (strpos($file['type'], 'video/') === 0) {
                        $category = 'video';
                    } else {
                        // Try to determine from file extension as fallback
                        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                        $imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
                        $audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'webm'];
                        $videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
                        
                        if (in_array($ext, $imageExts)) {
                            $category = 'image';
                        } elseif (in_array($ext, $audioExts)) {
                            $category = 'audio';
                        } elseif (in_array($ext, $videoExts)) {
                            $category = 'video';
                        } else {
                            $fileErrors[] = $file['name'] . ' is not a supported file type.';
                            continue;
                        }
                    }
                    
                    // Validate file type (magic bytes) - but don't fail if validation fails, just warn
                    $validation = validateFileType($file['tmp_name'], $category);
                    if (!$validation['valid']) {
                        // Log warning but continue - MIME type check is primary validation
                        error_log("File type validation warning for {$file['name']}: {$validation['error']}");
                    }
                    
                    // Read file content
                    $fileContent = @file_get_contents($file['tmp_name']);
                    if ($fileContent === false) {
                        $fileErrors[] = $file['name'] . ': Could not read file.';
                        continue;
                    }
                    
                    // Convert to base64
                    $base64 = base64_encode($fileContent);
                    if (empty($base64)) {
                        $fileErrors[] = $file['name'] . ': Failed to encode file.';
                        continue;
                    }
                    
                    // Sanitize file name
                    $sanitizedName = sanitizeFileName($file['name']);
                    
                    $mediaFiles[] = [
                        'file_name' => $sanitizedName,
                        'file_type' => $file['type'],
                        'media_category' => $category,
                        'base64_data' => $base64
                    ];
                }
            }
            
            // Show file errors as warnings but don't prevent submission
            if (!empty($fileErrors)) {
                $error = 'Some files could not be uploaded: ' . implode(', ', $fileErrors);
            }
            
            // Update entry (even if some files failed, as long as we have valid entry data)
            $updatedEntry = $client->updateEntry($entryId, $userId, $moodId, $entryText, $entryDate, $entryTime, $mediaFiles);
            
            if (!empty($fileErrors) && !empty($mediaFiles)) {
                $success = 'Entry updated successfully! ✨ Some files were skipped due to errors.';
            } else {
                $success = 'Entry updated successfully! ✨';
            }
            
            header('Location: entry_view.php?id=' . $entryId);
            exit;
        } catch (Exception $e) {
            $error = 'Failed to update entry: ' . $e->getMessage();
        }
    }
}

$pageTitle = 'Edit Entry - DiaryPro';
include __DIR__ . '/header.php';
?>

<?php if ($error && !$entry): ?>
<div class="page-container">
    <div class="container-narrow">
        <div class="alert alert-error">
            <?php echo htmlspecialchars($error); ?>
        </div>
        <a href="dashboard.php" class="button button-secondary">Back to Dashboard</a>
    </div>
</div>
<?php elseif ($entry): ?>
<div class="page-container">
    <div class="container-narrow">
        <div class="page-header">
            <h1 class="page-title">Edit Entry</h1>
        </div>
        
        <?php if ($error): ?>
        <div class="alert alert-error">
            <?php echo htmlspecialchars($error); ?>
        </div>
        <?php endif; ?>
        
        <form method="POST" action="entry_edit.php?id=<?php echo $entryId; ?>" enctype="multipart/form-data" class="card">
            <div class="card-content">
                <div class="form-group">
                    <label class="form-label">How are you feeling?</label>
                    <div class="mood-grid">
                        <?php foreach ($moods as $mood): ?>
                        <label class="mood-item <?php echo ((isset($_POST['mood_id']) && $_POST['mood_id'] == $mood['mood_id']) || (!isset($_POST['mood_id']) && $entry['mood_id'] == $mood['mood_id'])) ? 'selected' : ''; ?>">
                            <input type="radio" name="mood_id" value="<?php echo $mood['mood_id']; ?>" 
                                   style="display: none;" 
                                   required
                                   <?php echo ((isset($_POST['mood_id']) && $_POST['mood_id'] == $mood['mood_id']) || (!isset($_POST['mood_id']) && $entry['mood_id'] == $mood['mood_id'])) ? 'checked' : ''; ?>>
                            <div class="mood-emoji"><?php echo htmlspecialchars($mood['mood_emoji'] ?? '😊'); ?></div>
                            <div class="mood-name"><?php echo htmlspecialchars($mood['mood_name']); ?></div>
                        </label>
                        <?php endforeach; ?>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="entry_text" class="form-label">What's on your mind?</label>
                    <textarea 
                        id="entry_text" 
                        name="entry_text" 
                        class="form-textarea" 
                        placeholder="Write your thoughts here..."
                        required
                        maxlength="<?php echo MAX_ENTRY_TEXT_LENGTH; ?>"
                    ><?php echo htmlspecialchars(isset($_POST['entry_text']) ? $_POST['entry_text'] : $entry['entry_text']); ?></textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="form-group">
                        <label for="entry_date" class="form-label">Date</label>
                        <input 
                            type="date" 
                            id="entry_date" 
                            name="entry_date" 
                            class="form-input" 
                            value="<?php echo htmlspecialchars(isset($_POST['entry_date']) ? $_POST['entry_date'] : $entry['entry_date']); ?>"
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label for="entry_time" class="form-label">Time</label>
                        <input 
                            type="time" 
                            id="entry_time" 
                            name="entry_time" 
                            class="form-input" 
                            value="<?php echo htmlspecialchars(isset($_POST['entry_time']) ? $_POST['entry_time'] : $entry['entry_time']); ?>"
                            required
                        >
                    </div>
                </div>
                
                <?php if (!empty($entry['media_files'])): ?>
                <div class="form-group">
                    <label class="form-label">Existing Media</label>
                    <div class="media-preview">
                        <?php foreach ($entry['media_files'] as $media): ?>
                        <?php if ($media['media_category'] === 'image'): ?>
                        <div class="media-item">
                            <img src="data:<?php echo htmlspecialchars($media['file_type']); ?>;base64,<?php echo htmlspecialchars($media['base64_data']); ?>" 
                                 alt="<?php echo htmlspecialchars($media['file_name']); ?>">
                        </div>
                        <?php endif; ?>
                        <?php endforeach; ?>
                    </div>
                    <small class="text-muted">Existing media will be kept. Add more files below.</small>
                </div>
                <?php endif; ?>
                
                <div class="form-group">
                    <label for="media_files" class="form-label">Add More Media Files (Optional)</label>
                    <input 
                        type="file" 
                        id="media_files" 
                        name="media_files[]" 
                        class="form-input" 
                        accept="image/*,audio/*,video/*"
                        multiple
                    >
                    <small class="text-muted">Maximum <?php echo (MAX_FILE_SIZE / 1024 / 1024); ?>MB per file.</small>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="submit" id="save-button" class="button button-primary" style="flex: 1;">
                        Update Entry ✨
                    </button>
                    <a href="entry_view.php?id=<?php echo $entryId; ?>" class="button button-secondary">
                        Cancel
                    </a>
                </div>
            </div>
        </form>
    </div>
</div>

<script>
// Ensure save button is always enabled
document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save-button');
    const fileInput = document.getElementById('media_files');
    
    if (saveButton) {
        // Ensure button is always enabled
        saveButton.disabled = false;
        saveButton.style.pointerEvents = 'auto';
        saveButton.style.opacity = '1';
        saveButton.style.cursor = 'pointer';
        
        // Monitor for any attempts to disable the button
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
                    if (saveButton.disabled) {
                        saveButton.disabled = false;
                    }
                }
            });
        });
        
        observer.observe(saveButton, {
            attributes: true,
            attributeFilter: ['disabled', 'style']
        });
    }
    
    // Ensure button stays enabled when files are selected
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.style.pointerEvents = 'auto';
                saveButton.style.opacity = '1';
                saveButton.style.cursor = 'pointer';
            }
        });
    }
});
</script>
<?php endif; ?>

<?php include __DIR__ . '/footer.php'; ?>

