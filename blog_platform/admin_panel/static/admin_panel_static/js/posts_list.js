async function loadAllPosts() {
    const tbody = document.getElementById('postsTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">Loading posts...</td></tr>';
    
    try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const posts = [
            {
                id: 1, 
                title: 'Getting Started with Django', 
                author: 'Admin', 
                status: 'published', 
                views: 245, 
                likes: 12, 
                comments: 5, 
                created: '2024-08-01'
            },
            {
                id: 2, 
                title: 'Advanced Python Techniques', 
                author: 'Admin', 
                status: 'draft', 
                views: 0, 
                likes: 0, 
                comments: 0, 
                created: '2024-08-03'
            },
            {
                id: 3, 
                title: 'React Best Practices', 
                author: 'Admin', 
                status: 'published', 
                views: 189, 
                likes: 8, 
                comments: 3, 
                created: '2024-08-05'
            },
            {
                id: 4, 
                title: 'Database Optimization Tips', 
                author: 'Admin', 
                status: 'pending', 
                views: 45, 
                likes: 2, 
                comments: 1, 
                created: '2024-08-07'
            }
        ];
        
        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>${post.id}</td>
                <td><strong>${post.title}</strong></td>
                <td>${post.author}</td>
                <td><span class="badge status-${post.status}">${post.status.charAt(0).toUpperCase() + post.status.slice(1)}</span></td>
                <td>${post.views}</td>
                <td>${post.likes}</td>
                <td>${post.comments}</td>
                <td>${formatDate(post.created)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <a class="btn btn-outline-primary btn-sm" href="{% url 'post_edit' pk=${post.id} %}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn btn-outline-danger btn-sm" onclick="deletePost(${post.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-outline-info btn-sm" onclick="viewPost(${post.id})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error loading posts</td></tr>';
        console.error('Error loading posts:', error);
        showNotification('Error loading posts: ' + error.message, 'danger');
    }
}

async function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        showNotification('Post deleted successfully!', 'success');
        await loadAllPosts();
    } catch (error) {
        showNotification('Error deleting post: ' + error.message, 'danger');
    }
}

function viewPost(id) {
    showNotification(`Opening post ${id} in new tab...`, 'info');
}