<?php


require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';
require_once __DIR__ . '/security.php';

requireAuth();

$client = new SupabaseClient();
$userId = getCurrentUserId();

try {
    $entries = $client->getEntries($userId, 1000);
    

    $moodCounts = [];
    foreach ($entries as $entry) {
        if (isset($entry['mood']['mood_name'])) {
            $moodName = $entry['mood']['mood_name'];
            $moodCounts[$moodName] = ($moodCounts[$moodName] ?? 0) + 1;
        }
    }
    
    $total = count($entries) ?: 1;
    $emotionData = [
        [
            'emotion' => 'Happy',
            'percentage' => round((($moodCounts['Happy'] ?? 0) / $total) * 100),
            'color' => '#F4D35E'
        ],
        [
            'emotion' => 'Sad',
            'percentage' => round((($moodCounts['Sad'] ?? 0) / $total) * 100),
            'color' => '#8B4513'
        ],
        [
            'emotion' => 'Calm',
            'percentage' => round((($moodCounts['Calm'] ?? 0) / $total) * 100),
            'color' => '#B7E4C7'
        ],
        [
            'emotion' => 'Anxious',
            'percentage' => round((($moodCounts['Anxious'] ?? 0) / $total) * 100),
            'color' => '#9370DB'
        ]
    ];
    
    $emotionData = array_filter($emotionData, function($e) {
        return $e['percentage'] > 0;
    });
    

    usort($emotionData, function($a, $b) {
        return $b['percentage'] - $a['percentage'];
    });
    
    $mostCommonMood = !empty($emotionData) ? $emotionData[0]['emotion'] : 'N/A';
} catch (Exception $e) {
    $error = 'Failed to load data: ' . $e->getMessage();
    $entries = [];
    $emotionData = [];
    $mostCommonMood = 'N/A';
}

$pageTitle = 'Insights - DiaryPro';
include __DIR__ . '/header.php';
?>

<div class="page-container">
    <div class="container-narrow">
        <div class="page-header">
            <h1 class="page-title">Insights</h1>
        </div>
        
        <?php if (isset($error)): ?>
        <div class="alert alert-error">
            <?php echo htmlspecialchars($error); ?>
        </div>
        <?php endif; ?>
        
        <?php if (!empty($emotionData)): ?>
        <div class="card" style="margin-bottom: 2rem;">
            <div class="card-content">
                <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Emotions</h3>
                <p class="text-muted" style="margin-bottom: 1.5rem; font-size: 0.875rem;">
                    Here are four core emotions for your journal
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <?php foreach ($emotionData as $emotion): ?>
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-weight: 500;"><?php echo htmlspecialchars($emotion['emotion']); ?></span>
                            <span style="font-weight: 600;"><?php echo $emotion['percentage']; ?>%</span>
                        </div>
                        <div style="width: 100%; background: var(--color-border); border-radius: 999px; height: 1.5rem; overflow: hidden;">
                            <div style="height: 100%; background: <?php echo htmlspecialchars($emotion['color']); ?>; width: <?php echo $emotion['percentage']; ?>%; border-radius: 0 999px 999px 0; transition: width 0.3s;"></div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
        <?php endif; ?>
        

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div class="card" style="background: linear-gradient(to bottom right, var(--color-accent-yellow), var(--color-accent-orange)); border: none;">
                <div class="card-content">
                    <p style="font-size: 0.875rem; color: var(--color-foreground); margin-bottom: 0.25rem; opacity: 0.9;">Total Entries</p>
                    <p style="font-size: 2rem; font-weight: 700; color: var(--color-foreground);">
                        <?php echo count($entries); ?>
                    </p>
                </div>
            </div>
            
            <div class="card" style="background: linear-gradient(to bottom right, var(--color-accent-green), var(--color-accent-pink)); border: none;">
                <div class="card-content">
                    <p style="font-size: 0.875rem; color: var(--color-foreground); margin-bottom: 0.25rem; opacity: 0.9;">Most Common Mood</p>
                    <p style="font-size: 2rem; font-weight: 700; color: var(--color-foreground);">
                        <?php echo htmlspecialchars($mostCommonMood); ?>
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/footer.php'; ?>

