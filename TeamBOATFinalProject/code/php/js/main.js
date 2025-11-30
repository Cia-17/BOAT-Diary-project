/**
 * Main JavaScript file
 * Minimal vanilla JavaScript for enhanced UX
 */

// Form validation helpers
document.addEventListener('DOMContentLoaded', function() {
    // Auto-submit mood selection on dashboard
    const moodItems = document.querySelectorAll('.mood-item');
    moodItems.forEach(item => {
        item.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                // Update visual state
                moodItems.forEach(m => m.classList.remove('selected'));
                this.classList.add('selected');
            }
        });
    });
    
    // Confirm delete actions
    const deleteLinks = document.querySelectorAll('a[href*="delete"]');
    deleteLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this entry?')) {
                e.preventDefault();
            }
        });
    });
    
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s';
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 500);
        }, 5000);
    });
});

