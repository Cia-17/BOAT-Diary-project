<?php


require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';
require_once __DIR__ . '/security.php';

requireAuth();

$error = '';
$success = '';
$client = new SupabaseClient();
$userId = getCurrentUserId();


try {
    $moods = $client->getMoods();
} catch (Exception $e) {
    $error = 'Failed to load moods: ' . $e->getMessage();
    $moods = [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $moodId = intval($_POST['mood_id'] ?? 0);
    $entryText = sanitizeInput($_POST['entry_text'] ?? '');
    $entryDate = $_POST['entry_date'] ?? date('Y-m-d');
    $entryTime = $_POST['entry_time'] ?? date('H:i');
    
    if (empty($entryText)) {
        $error = 'Please enter some text for your entry.';
    } elseif ($moodId <= 0) {
        $error = 'Please select a mood.';
    } elseif (strlen($entryText) > MAX_ENTRY_TEXT_LENGTH) {
        $error = 'Entry text is too long. Maximum ' . MAX_ENTRY_TEXT_LENGTH . ' characters.';
    } else {
        try {
            $mediaFiles = [];
            $fileErrors = [];
            

            if (!empty($_FILES['media_files']['name'][0])) {
                $fileCount = count($_FILES['media_files']['name']);
                
                for ($i = 0; $i < $fileCount; $i++) {
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
                    
                    if ($file['size'] > MAX_FILE_SIZE) {
                        $fileErrors[] = $file['name'] . ' is too large. Maximum size is ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB.';
                        continue;
                    }
                    
                    if ($file['size'] == 0) {
                        $fileErrors[] = $file['name'] . ' is empty.';
                        continue;
                    }
                    
                    $category = null;
                    if (strpos($file['type'], 'image/') === 0) {
                        $category = 'image';
                    } elseif (strpos($file['type'], 'audio/') === 0) {
                        $category = 'audio';
                    } elseif (strpos($file['type'], 'video/') === 0) {
                        $category = 'video';
                    } else {

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
                    

                    $validation = validateFileType($file['tmp_name'], $category);
                    if (!$validation['valid']) {
                        error_log("File type validation warning for {$file['name']}: {$validation['error']}");
                    }
                    
                    $fileContent = @file_get_contents($file['tmp_name']);
                    if ($fileContent === false) {
                        $fileErrors[] = $file['name'] . ': Could not read file.';
                        continue;
                    }
                    
                    $base64 = base64_encode($fileContent);
                    if (empty($base64)) {
                        $fileErrors[] = $file['name'] . ': Failed to encode file.';
                        continue;
                    }
                    
                    $sanitizedName = sanitizeFileName($file['name']);
                    
                    $mediaFiles[] = [
                        'file_name' => $sanitizedName,
                        'file_type' => $file['type'],
                        'media_category' => $category,
                        'base64_data' => $base64
                    ];
                }
            }
            
            if (!empty($fileErrors)) {
                $error = 'Some files could not be uploaded: ' . implode(', ', $fileErrors);
            }
            
            $entry = $client->createEntry($userId, $moodId, $entryText, $entryDate, $entryTime, $mediaFiles);
            
            if (!empty($fileErrors) && !empty($mediaFiles)) {
                $success = 'Entry saved successfully! ✨ Some files were skipped due to errors.';
            } else {
                $success = 'Entry saved successfully! ✨';
            }
            
            header('Location: entry_view.php?id=' . $entry['entry_id']);
            exit;
        } catch (Exception $e) {
            $error = 'Failed to save entry: ' . $e->getMessage();
            error_log("Entry creation error: " . $e->getMessage());
        }
    }
}

$pageTitle = 'New Entry - DiaryPro';
include __DIR__ . '/header.php';
?>

<div class="page-container">
    <div class="container-narrow">
        <div class="page-header">
            <h1 class="page-title">New Entry</h1>
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
        
        <form method="POST" action="entry_new.php" enctype="multipart/form-data" class="card">
            <div class="card-content">
                <div class="form-group">
                    <label class="form-label">How are you feeling?</label>
                    <div class="mood-grid">
                        <?php foreach ($moods as $mood): ?>
                        <label class="mood-item <?php echo (isset($_POST['mood_id']) && $_POST['mood_id'] == $mood['mood_id']) ? 'selected' : ''; ?>">
                            <input type="radio" name="mood_id" value="<?php echo $mood['mood_id']; ?>" 
                                   style="display: none;" 
                                   required
                                   <?php echo (isset($_POST['mood_id']) && $_POST['mood_id'] == $mood['mood_id']) ? 'checked' : ''; ?>>
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
                    ><?php echo htmlspecialchars($_POST['entry_text'] ?? ''); ?></textarea>
                    <small class="text-muted">Maximum <?php echo number_format(MAX_ENTRY_TEXT_LENGTH); ?> characters</small>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="form-group">
                        <label for="entry_date" class="form-label">Date</label>
                        <input 
                            type="date" 
                            id="entry_date" 
                            name="entry_date" 
                            class="form-input" 
                            value="<?php echo htmlspecialchars($_POST['entry_date'] ?? date('Y-m-d')); ?>"
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
                            value="<?php echo htmlspecialchars($_POST['entry_time'] ?? date('H:i')); ?>"
                            required
                        >
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="media_files" class="form-label">Media Files (Optional)</label>
                    <input 
                        type="file" 
                        id="media_files" 
                        name="media_files[]" 
                        class="form-input" 
                        accept="image/*,audio/*,video/*"
                        multiple
                    >
                    <small class="text-muted">You can upload images, audio, or video files. Maximum <?php echo (MAX_FILE_SIZE / 1024 / 1024); ?>MB per file.</small>
                    <div id="file-preview" style="margin-top: 1rem; display: none;">
                        <p style="font-weight: 500; margin-bottom: 0.5rem;">Selected files:</p>
                        <ul id="file-list" style="list-style: none; padding: 0;"></ul>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="submit" id="save-button" class="button button-primary" style="flex: 1;">
                        Save Entry ✨
                    </button>
                    <a href="dashboard.php" class="button button-secondary">
                        Cancel
                    </a>
                </div>
            </div>
        </form>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('media_files');
    const filePreview = document.getElementById('file-preview');
    const fileList = document.getElementById('file-list');
    const saveButton = document.getElementById('save-button');
    const form = fileInput ? fileInput.closest('form') : null;
    
    if (saveButton) {
        saveButton.disabled = false;
        saveButton.style.pointerEvents = 'auto';
        saveButton.style.opacity = '1';
        saveButton.style.cursor = 'pointer';
    }
    
    if (fileInput && form) {
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            

            if (saveButton) {
                saveButton.disabled = false;
                saveButton.style.pointerEvents = 'auto';
                saveButton.style.opacity = '1';
                saveButton.style.cursor = 'pointer';
            }
            
            if (files.length === 0) {
                filePreview.style.display = 'none';
                fileList.innerHTML = '';
                return;
            }
            
            filePreview.style.display = 'block';
            fileList.innerHTML = '';
            
            files.forEach((file, index) => {
                const li = document.createElement('li');
                li.style.padding = '0.5rem';
                li.style.marginBottom = '0.25rem';
                li.style.background = 'var(--color-border)';
                li.style.borderRadius = 'var(--radius)';
                
                const fileSize = (file.size / 1024 / 1024).toFixed(2);
                const maxSize = <?php echo (MAX_FILE_SIZE / 1024 / 1024); ?>;
                
                let status = '';
                if (file.size > <?php echo MAX_FILE_SIZE; ?>) {
                    status = ' <span style="color: #ef4444;">(Too large - max ' + maxSize + 'MB)</span>';
                } else if (!file.type.match(/^(image|audio|video)\//)) {
                    status = ' <span style="color: #ef4444;">(Unsupported type)</span>';
                } else {
                    status = ' <span style="color: #22c55e;">(OK)</span>';
                }
                
                li.innerHTML = '<strong>' + file.name + '</strong> (' + fileSize + ' MB)' + status;
                fileList.appendChild(li);
            });
        });
        
        form.addEventListener('submit', function(e) {

            if (saveButton) {
                saveButton.disabled = false;
            }
        });
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
                    if (saveButton && saveButton.disabled) {
                        saveButton.disabled = false;
                    }
                }
            });
        });
        
        if (saveButton) {
            observer.observe(saveButton, {
                attributes: true,
                attributeFilter: ['disabled', 'style']
            });
        }
    }
});
</script>

<?php include __DIR__ . '/footer.php'; ?>

