<?php
/**
 * Journal Page
 * List all entries with search and filter capabilities
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';
require_once __DIR__ . '/security.php';

requireAuth();

$client = new SupabaseClient();
$userId = getCurrentUserId();

// Get filter parameters
$searchQuery = sanitizeInput($_GET['search'] ?? '');
$selectedMood = isset($_GET['mood']) ? intval($_GET['mood']) : 0;
$startDate = $_GET['start_date'] ?? '';
$endDate = $_GET['end_date'] ?? '';
$sortBy = $_GET['sort'] ?? 'date-desc';

// Load data
try {
    $allEntries = $client->getEntries($userId, 1000);
    $moods = $client->getMoods();
    
    // Apply filters
    $filteredEntries = $allEntries;
    
    // Search filter
    if (!empty($searchQuery)) {
        $filteredEntries = array_filter($filteredEntries, function($entry) use ($searchQuery) {
            return stripos($entry['entry_text'], $searchQuery) !== false;
        });
    }
    
    // Mood filter
    if ($selectedMood > 0) {
        $filteredEntries = array_filter($filteredEntries, function($entry) use ($selectedMood) {
            return $entry['mood_id'] == $selectedMood;
        });
    }
    
    // Date range filter
    if (!empty($startDate)) {
        $filteredEntries = array_filter($filteredEntries, function($entry) use ($startDate) {
            return $entry['entry_date'] >= $startDate;
        });
    }
    if (!empty($endDate)) {
        $filteredEntries = array_filter($filteredEntries, function($entry) use ($endDate) {
            return $entry['entry_date'] <= $endDate;
        });
    }
    
    // Sort
    usort($filteredEntries, function($a, $b) use ($sortBy) {
        switch ($sortBy) {
            case 'date-asc':
                $dateA = strtotime($a['entry_date'] . ' ' . $a['entry_time']);
                $dateB = strtotime($b['entry_date'] . ' ' . $b['entry_time']);
                return $dateA - $dateB;
            case 'date-desc':
            default:
                $dateA = strtotime($a['entry_date'] . ' ' . $a['entry_time']);
                $dateB = strtotime($b['entry_date'] . ' ' . $b['entry_time']);
                return $dateB - $dateA;
            case 'mood-asc':
                return strcmp($a['mood']['mood_name'] ?? '', $b['mood']['mood_name'] ?? '');
            case 'mood-desc':
                return strcmp($b['mood']['mood_name'] ?? '', $a['mood']['mood_name'] ?? '');
        }
    });
    
    $filteredEntries = array_values($filteredEntries);
} catch (Exception $e) {
    $error = 'Failed to load entries: ' . $e->getMessage();
    $filteredEntries = [];
    $moods = [];
}

$pageTitle = 'Journal - DiaryPro';
include __DIR__ . '/header.php';
?>

<div class="page-container">
    <div class="container-narrow">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
            <h1 class="page-title">My Journal</h1>
            <a href="entry_new.php" class="button button-primary">+ New Entry</a>
        </div>
        
        <!-- Filters -->
        <div class="card" style="margin-bottom: 2rem;">
            <div class="card-content">
                <form method="GET" action="journal.php" class="space-y-4">
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label for="search" class="form-label">Search</label>
                            <input 
                                type="text" 
                                id="search" 
                                name="search" 
                                class="form-input" 
                                placeholder="Search entries..."
                                value="<?php echo htmlspecialchars($searchQuery); ?>"
                            >
                        </div>
                        <div class="form-group">
                            <label for="sort" class="form-label">Sort By</label>
                            <select id="sort" name="sort" class="form-select">
                                <option value="date-desc" <?php echo $sortBy === 'date-desc' ? 'selected' : ''; ?>>Newest First</option>
                                <option value="date-asc" <?php echo $sortBy === 'date-asc' ? 'selected' : ''; ?>>Oldest First</option>
                                <option value="mood-asc" <?php echo $sortBy === 'mood-asc' ? 'selected' : ''; ?>>Mood A-Z</option>
                                <option value="mood-desc" <?php echo $sortBy === 'mood-desc' ? 'selected' : ''; ?>>Mood Z-A</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label for="mood" class="form-label">Filter by Mood</label>
                            <select id="mood" name="mood" class="form-select">
                                <option value="">All Moods</option>
                                <?php foreach ($moods as $mood): ?>
                                <option value="<?php echo $mood['mood_id']; ?>" <?php echo $selectedMood == $mood['mood_id'] ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($mood['mood_name']); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="start_date" class="form-label">Start Date</label>
                            <input 
                                type="date" 
                                id="start_date" 
                                name="start_date" 
                                class="form-input" 
                                value="<?php echo htmlspecialchars($startDate); ?>"
                            >
                        </div>
                        <div class="form-group">
                            <label for="end_date" class="form-label">End Date</label>
                            <input 
                                type="date" 
                                id="end_date" 
                                name="end_date" 
                                class="form-input" 
                                value="<?php echo htmlspecialchars($endDate); ?>"
                            >
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" class="button button-primary">Apply Filters</button>
                        <a href="journal.php" class="button button-secondary">Clear</a>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Entries List -->
        <div class="card">
            <div class="card-content">
                <?php if (empty($filteredEntries)): ?>
                <p class="text-muted text-center" style="padding: 2rem;">
                    <?php echo empty($searchQuery) && $selectedMood == 0 ? 'No entries yet. Create your first entry!' : 'No entries match your filters.'; ?>
                </p>
                <?php else: ?>
                <p class="text-muted" style="margin-bottom: 1rem;">
                    Showing <?php echo count($filteredEntries); ?> entr<?php echo count($filteredEntries) == 1 ? 'y' : 'ies'; ?>
                </p>
                <div class="space-y-4">
                    <?php foreach ($filteredEntries as $entry): ?>
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
                            <?php 
                            $text = htmlspecialchars($entry['entry_text']);
                            if (strlen($text) > 300) {
                                echo substr($text, 0, 300) . '...';
                            } else {
                                echo $text;
                            }
                            ?>
                        </div>
                        <?php if (!empty($entry['media_files'])): ?>
                        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                            <?php 
                            $imageCount = 0;
                            foreach ($entry['media_files'] as $media) {
                                if ($media['media_category'] === 'image') $imageCount++;
                            }
                            if ($imageCount > 0): ?>
                            <span style="font-size: 0.875rem; color: var(--color-muted);">📷 <?php echo $imageCount; ?> image<?php echo $imageCount > 1 ? 's' : ''; ?></span>
                            <?php endif; ?>
                        </div>
                        <?php endif; ?>
                        <div class="entry-actions" style="margin-top: 1rem;">
                            <a href="entry_view.php?id=<?php echo $entry['entry_id']; ?>" class="button button-secondary" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                                View
                            </a>
                            <a href="entry_edit.php?id=<?php echo $entry['entry_id']; ?>" class="button button-secondary" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                                Edit
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

