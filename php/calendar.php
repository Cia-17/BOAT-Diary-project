<?php
/**
 * Calendar Page
 * Monthly calendar view of entries
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';
require_once __DIR__ . '/security.php';

requireAuth();

$client = new SupabaseClient();
$userId = getCurrentUserId();

// Get current month/year from query params or use current date
$currentMonth = isset($_GET['month']) ? intval($_GET['month']) : date('n');
$currentYear = isset($_GET['year']) ? intval($_GET['year']) : date('Y');

// Validate month/year
if ($currentMonth < 1 || $currentMonth > 12) $currentMonth = date('n');
if ($currentYear < 2020 || $currentYear > 2100) $currentYear = date('Y');

// Calculate previous/next month
$prevMonth = $currentMonth - 1;
$prevYear = $currentYear;
if ($prevMonth < 1) {
    $prevMonth = 12;
    $prevYear--;
}

$nextMonth = $currentMonth + 1;
$nextYear = $currentYear;
if ($nextMonth > 12) {
    $nextMonth = 1;
    $nextYear++;
}

try {
    $entries = $client->getEntries($userId, 1000);
    
    // Group entries by date
    $entriesByDate = [];
    foreach ($entries as $entry) {
        $dateKey = $entry['entry_date'];
        if (!isset($entriesByDate[$dateKey])) {
            $entriesByDate[$dateKey] = [];
        }
        $entriesByDate[$dateKey][] = $entry;
    }
} catch (Exception $e) {
    $error = 'Failed to load entries: ' . $e->getMessage();
    $entriesByDate = [];
}

// Get month info
$monthName = date('F', mktime(0, 0, 0, $currentMonth, 1, $currentYear));
$daysInMonth = cal_days_in_month(CAL_GREGORIAN, $currentMonth, $currentYear);
$firstDayOfWeek = date('w', mktime(0, 0, 0, $currentMonth, 1, $currentYear));
$firstDayOfWeek = $firstDayOfWeek == 0 ? 6 : $firstDayOfWeek - 1; // Convert Sunday=0 to Monday=0

$pageTitle = 'Calendar - DiaryPro';
include __DIR__ . '/header.php';
?>

<div class="page-container">
    <div class="container-narrow">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <a href="calendar.php?month=<?php echo $prevMonth; ?>&year=<?php echo $prevYear; ?>" class="button button-secondary">←</a>
                <h1 class="page-title" style="margin: 0;"><?php echo $monthName . ' ' . $currentYear; ?></h1>
                <a href="calendar.php?month=<?php echo $nextMonth; ?>&year=<?php echo $nextYear; ?>" class="button button-secondary">→</a>
            </div>
            <a href="entry_new.php" class="button button-primary">+ New Entry</a>
        </div>
        
        <!-- Calendar Grid -->
        <div class="card">
            <div class="card-content">
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
                    <?php 
                    $weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                    foreach ($weekDays as $day): 
                    ?>
                    <div style="text-align: center; font-weight: 600; padding: 0.5rem; color: var(--color-muted);">
                        <?php echo $day; ?>
                    </div>
                    <?php endforeach; ?>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem;">
                    <?php 
                    // Empty cells for days before month starts
                    for ($i = 0; $i < $firstDayOfWeek; $i++): 
                    ?>
                    <div style="aspect-ratio: 1; background: transparent;"></div>
                    <?php endfor; ?>
                    
                    <?php 
                    // Days of the month
                    for ($day = 1; $day <= $daysInMonth; $day++): 
                        $dateKey = sprintf('%04d-%02d-%02d', $currentYear, $currentMonth, $day);
                        $hasEntries = isset($entriesByDate[$dateKey]);
                        $isToday = ($day == date('j') && $currentMonth == date('n') && $currentYear == date('Y'));
                    ?>
                    <div style="aspect-ratio: 1; border: 2px solid <?php echo $isToday ? 'var(--color-accent-yellow)' : 'var(--color-border)'; ?>; border-radius: var(--radius); padding: 0.5rem; background: <?php echo $hasEntries ? 'var(--color-event-yellow)' : 'transparent'; ?>; cursor: pointer; transition: all 0.2s;" 
                         onclick="window.location.href='journal.php?start_date=<?php echo $dateKey; ?>&end_date=<?php echo $dateKey; ?>'">
                        <div style="font-weight: 600; margin-bottom: 0.25rem;"><?php echo $day; ?></div>
                        <?php if ($hasEntries): ?>
                        <div style="font-size: 0.75rem; color: var(--color-muted);">
                            <?php echo count($entriesByDate[$dateKey]); ?> entr<?php echo count($entriesByDate[$dateKey]) == 1 ? 'y' : 'ies'; ?>
                        </div>
                        <?php endif; ?>
                    </div>
                    <?php endfor; ?>
                </div>
            </div>
        </div>
        
        <!-- Recent Entries -->
        <?php if (!empty($entries)): ?>
        <div class="card" style="margin-top: 2rem;">
            <div class="card-header">
                <h2 class="card-title">Recent Entries</h2>
            </div>
            <div class="card-content">
                <div class="space-y-4">
                    <?php foreach (array_slice($entries, 0, 5) as $entry): ?>
                    <div class="entry-card">
                        <div class="entry-header">
                            <div>
                                <div class="entry-date">
                                    <?php 
                                    $date = new DateTime($entry['entry_date']);
                                    echo $date->format('M j, Y') . ' at ' . date('g:i A', strtotime($entry['entry_time']));
                                    ?>
                                </div>
                                <?php if (isset($entry['mood'])): ?>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                                    <span><?php echo htmlspecialchars($entry['mood']['mood_emoji'] ?? ''); ?></span>
                                    <span style="font-weight: 500;"><?php echo htmlspecialchars($entry['mood']['mood_name']); ?></span>
                                </div>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="entry-text">
                            <?php 
                            $text = htmlspecialchars($entry['entry_text']);
                            echo strlen($text) > 200 ? substr($text, 0, 200) . '...' : $text;
                            ?>
                        </div>
                        <div class="entry-actions" style="margin-top: 1rem;">
                            <a href="entry_view.php?id=<?php echo $entry['entry_id']; ?>" class="button button-secondary" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                                View
                            </a>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>

<?php include __DIR__ . '/footer.php'; ?>
