<?php
/**
 * Dashboard Page
 * Main application page showing recent entries and quick entry form
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';
require_once __DIR__ . '/security.php';

requireAuth();

$error = '';
$success = '';
$client = new SupabaseClient();
$userId = getCurrentUserId();

// Handle quick entry submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['quick_entry'])) {
    $moodId = intval($_POST['mood_id'] ?? 0);
    $entryText = sanitizeInput($_POST['entry_text'] ?? '');
    $entryDate = $_POST['entry_date'] ?? date('Y-m-d');
    $entryTime = $_POST['entry_time'] ?? date('H:i');
    
    if (empty($entryText)) {
        $error = 'Please enter some text for your entry.';
    } elseif ($moodId <= 0) {
        $error = 'Please select a mood.';
    } else {
        try {
            $client->createEntry($userId, $moodId, $entryText, $entryDate, $entryTime);
            $success = 'Entry saved successfully! ✨';
            // Clear form
            $_POST = [];
        } catch (Exception $e) {
            $error = 'Failed to save entry: ' . $e->getMessage();
        }
    }
}

// Handle entry deletion
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    $entryId = intval($_GET['delete']);
    try {
        $client->deleteEntry($entryId, $userId);
        $success = 'Entry deleted successfully.';
    } catch (Exception $e) {
        $error = 'Failed to delete entry: ' . $e->getMessage();
    }
}

// Load data
try {
    $entries = $client->getEntries($userId, 10);
    $moods = $client->getMoods();
    
    // Fetch random quote
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
            'text' => 'Every day is a fresh start.',
            'author' => 'Unknown'
        ];
    }
} catch (Exception $e) {
    $error = 'Failed to load data: ' . $e->getMessage();
    $entries = [];
    $moods = [];
    $quote = null;
}

$pageTitle = 'Dashboard - DiaryPro';
include __DIR__ . '/header.php';
?>

<div class="page-container">
    <div class="container-narrow">
        <!-- Quote Card -->
        <?php if ($quote): ?>
        <div class="quote-card">
            <p class="quote-text"><?php echo htmlspecialchars($quote['text']); ?></p>
            <p class="quote-author">— <?php echo htmlspecialchars($quote['author']); ?></p>
        </div>
        <?php endif; ?>
        
        <!-- Alerts -->
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
        
        <!-- Quick Entry Form -->
        <div class="card" style="margin-bottom: 2rem;">
            <div class="card-header">
                <h2 class="card-title">Quick Entry</h2>
            </div>
            <div class="card-content">
                <form method="POST" action="dashboard.php">
                    <input type="hidden" name="quick_entry" value="1">
                    
                    <div class="form-group">
                        <label class="form-label">How are you feeling?</label>
                        <div class="mood-grid">
                            <?php foreach ($moods as $mood): ?>
                            <label class="mood-item <?php echo (isset($_POST['mood_id']) && $_POST['mood_id'] == $mood['mood_id']) ? 'selected' : ''; ?>">
                                <input type="radio" name="mood_id" value="<?php echo $mood['mood_id']; ?>" 
                                       style="display: none;" 
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
                        ><?php echo htmlspecialchars($_POST['entry_text'] ?? ''); ?></textarea>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
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
                    
                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" class="button button-primary" style="flex: 1;">
                            Save Entry ✨
                        </button>
                        <a href="entry_new.php" class="button button-secondary">
                            Add Media
                        </a>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Recent Entries -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Recent Entries</h2>
            </div>
            <div class="card-content">
                <?php if (empty($entries)): ?>
                <p class="text-muted text-center" style="padding: 2rem;">
                    No entries yet. Create your first entry above!
                </p>
                <?php else: ?>
                <div class="space-y-4">
                    <?php foreach ($entries as $entry): ?>
                    <div class="entry-card">
                        <div class="entry-header">
                            <div>
                                <div class="entry-date">
                                    <?php 
                                    $date = new DateTime($entry['entry_date']);
                                    echo $date->format('F j, Y') . ' at ' . date('g:i A', strtotime($entry['entry_time']));
                                    ?>
                                </div>
                                <?php if (isset($entry['mood'])): ?>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                                    <span style="font-size: 1.25rem;"><?php echo htmlspecialchars($entry['mood']['mood_emoji'] ?? ''); ?></span>
                                    <span style="font-weight: 500;"><?php echo htmlspecialchars($entry['mood']['mood_name']); ?></span>
                                </div>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="entry-text">
                            <?php echo nl2br(htmlspecialchars($entry['entry_text'])); ?>
                        </div>
                        <?php if (!empty($entry['media_files'])): ?>
                        <div class="media-preview" style="margin-top: 1rem;">
                            <?php foreach ($entry['media_files'] as $media): ?>
                            <?php if ($media['media_category'] === 'image'): ?>
                            <div class="media-item">
                                <img src="data:<?php echo htmlspecialchars($media['file_type']); ?>;base64,<?php echo htmlspecialchars($media['base64_data']); ?>" 
                                     alt="<?php echo htmlspecialchars($media['file_name']); ?>">
                            </div>
                            <?php endif; ?>
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>
                        <div class="entry-actions" style="margin-top: 1rem;">
                            <a href="entry_view.php?id=<?php echo $entry['entry_id']; ?>" class="button button-secondary" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                                View
                            </a>
                            <a href="entry_edit.php?id=<?php echo $entry['entry_id']; ?>" class="button button-secondary" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                                Edit
                            </a>
                            <a href="dashboard.php?delete=<?php echo $entry['entry_id']; ?>" 
                               class="button button-danger" 
                               style="font-size: 0.875rem; padding: 0.5rem 1rem;"
                               onclick="return confirm('Are you sure you want to delete this entry?');">
                                Delete
                            </a>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/footer.php'; ?>

