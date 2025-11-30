<?php
/**
 * Landing Page
 * Marketing/homepage for non-authenticated users
 */

$pageTitle = 'DiaryPro - Your Personal Journal';
include __DIR__ . '/header.php';
?>

<div style="min-height: 100vh; background: white;">
    <!-- Hero Section -->
    <section style="position: relative; overflow: hidden; background: linear-gradient(to bottom right, #FFF7D1, #FFE7EF, #B7E4C7); padding: 5rem 1rem;">
        <div class="container" style="position: relative; z-index: 10;">
            <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                <h1 style="font-size: 3rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--color-foreground);">
                    Document Your Life, One Entry at a Time
                </h1>
                <p style="font-size: 1.25rem; color: var(--color-muted); margin-bottom: 2rem; line-height: 1.6;">
                    DiaryPro helps you capture your daily experiences, emotions, and memories in a beautiful, secure digital journal.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="register.php" class="button button-primary" style="font-size: 1.125rem; padding: 1rem 2rem;">
                        Get Started Free
                    </a>
                    <a href="login.php" class="button button-secondary" style="font-size: 1.125rem; padding: 1rem 2rem;">
                        Sign In
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section style="padding: 4rem 1rem; background: white;">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; font-weight: 700; margin-bottom: 3rem;">
                Everything You Need to Journal
            </h2>
            
            <div class="dashboard-grid">
                <div class="card">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">Rich Text Entries</h3>
                    <p class="text-muted">Write your thoughts, feelings, and experiences with our intuitive editor.</p>
                </div>
                
                <div class="card">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎭</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">Mood Tracking</h3>
                    <p class="text-muted">Track your emotional patterns and see how your moods change over time.</p>
                </div>
                
                <div class="card">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📸</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">Media Support</h3>
                    <p class="text-muted">Add photos, audio recordings, and videos to make your entries come alive.</p>
                </div>
                
                <div class="card">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">Insights & Analytics</h3>
                    <p class="text-muted">Visualize your journaling patterns and emotional trends with beautiful charts.</p>
                </div>
                
                <div class="card">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">Secure & Private</h3>
                    <p class="text-muted">Your entries are encrypted and private. Only you can access your journal.</p>
                </div>
                
                <div class="card">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">Daily Quotes</h3>
                    <p class="text-muted">Get inspired with daily motivational quotes to start your journaling journey.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section style="padding: 4rem 1rem; background: linear-gradient(to right, var(--color-accent-yellow), var(--color-accent-orange));">
        <div class="container" style="text-align: center;">
            <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: var(--color-foreground);">
                Ready to Start Your Journey?
            </h2>
            <p style="font-size: 1.25rem; margin-bottom: 2rem; color: var(--color-foreground);">
                Join thousands of people documenting their lives with DiaryPro.
            </p>
            <a href="register.php" class="button" style="background: var(--color-foreground); color: white; font-size: 1.125rem; padding: 1rem 2rem;">
                Create Your Free Account
            </a>
        </div>
    </section>
</div>

<?php include __DIR__ . '/footer.php'; ?>

