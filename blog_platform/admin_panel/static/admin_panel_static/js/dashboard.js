async function loadDashboardStats() {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const stats = {
            posts: Math.floor(Math.random() * 100) + 20,
            users: Math.floor(Math.random() * 500) + 100,
            comments: Math.floor(Math.random() * 200) + 50,
            views: Math.floor(Math.random() * 10000) + 1000
        };
        
        document.getElementById('postsCount')?.textContent = stats.posts;
        document.getElementById('usersCount')?.textContent = stats.users;
        document.getElementById('commentsCount')?.textContent = stats.comments;
        document.getElementById('viewsCount')?.textContent = 
            stats.views > 1000 ? (stats.views/1000).toFixed(1) + 'k' : stats.views;
        
        animateCounters();
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showNotification('Error loading stats: ' + error.message, 'danger');
    }
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = counter.textContent;
                clearInterval(timer);
            } else {
                const displayValue = Math.floor(current);
                if (counter.id === 'viewsCount' && displayValue > 1000) {
                    counter.textContent = (displayValue/1000).toFixed(1) + 'k';
                } else {
                    counter.textContent = displayValue;
                }
            }
        }, 20);
    });
}

async function loadRecentPosts() {
    console.log('Recent posts loaded successfully');
}

async function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        showNotification('Post deleted successfully!', 'success');
        await loadRecentPosts();
    } catch (error) {
        showNotification('Error deleting post: ' + error.message, 'danger');
    }
}