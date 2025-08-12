import { postFormData, get, del, patch } from "/static/core_static/js/api.js";
import { endpoints } from "/static/core_static/js/apiEndpoints.js";

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Create a simple notification system if it doesn't exist
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

async function loadAllPosts() {
    const tbody = document.getElementById('postsTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">Loading posts...</td></tr>';
    
    try {
        await new Promise(resolve => setTimeout(resolve, 800));

        const { response, data } = await get(endpoints.list_post)
        const posts = data
        //     {
        //         id: 1, 
        //         title: 'Getting Started with Django', 
        //         author: 'Admin', 
        //         status: 'published', 
        //         views: 245, 
        //         likes: 12, 
        //         comments: 5, 
        //         created: '2024-08-01'
        //     },
        //     {
        //         id: 2, 
        //         title: 'Advanced Python Techniques', 
        //         author: 'Admin', 
        //         status: 'draft', 
        //         views: 0, 
        //         likes: 0, 
        //         comments: 0, 
        //         created: '2024-08-03'
        //     },
        //     {
        //         id: 3, 
        //         title: 'React Best Practices', 
        //         author: 'Admin', 
        //         status: 'published', 
        //         views: 189, 
        //         likes: 8, 
        //         comments: 3, 
        //         created: '2024-08-05'
        //     },
        //     {
        //         id: 4, 
        //         title: 'Database Optimization Tips', 
        //         author: 'Admin', 
        //         status: 'pending', 
        //         views: 45, 
        //         likes: 2, 
        //         comments: 1, 
        //         created: '2024-08-07'
        //     }
        // ];
        
        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>${post.id}</td>
                <td><strong>${post.title}</strong></td>

                <td><span class="badge ${post.is_draft ? 'status-draft' : 'status-published'}">
                    ${post.is_draft ? 'Draft' : 'Published'}
                </span></td>
                <td>${post.view_count}</td>
                <td>${post.like_count}</td>
                <td>${post.comment_count}</td>
                <td>${formatDate(post.created_at)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <a class="btn btn-outline-primary btn-sm" href="/posts/edit-post/${post.id}/" title="Edit">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn btn-outline-danger btn-sm" onclick="deletePost(${post.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <a class="btn btn-outline-info btn-sm" href="/admin-panel/post-detail/${post.id}/"  title="View">
                            <i class="fas fa-eye"></i>
                        </a>
                        <button class="btn btn-outline-warning btn-sm" onclick="toggleDraft(${post.id}, ${post.is_draft})" title="Toggle Draft">
                            <i class="fas fa-toggle-${post.is_draft ? 'on' : 'off'}"></i>
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
        await del(endpoints.delete_post(id));
        showNotification('Post deleted successfully!', 'success');
        await loadAllPosts();
    } catch (error) {
        showNotification('Error deleting post: ' + error.message, 'danger');
    }
}

function viewPost(id) {
    showNotification(`Opening post ${id} in new tab...`, 'info');
}

async function toggleDraft(id) {

    try {
        await patch(endpoints.toggle_status(id))
        showNotification('Post status updated successfully!', 'success');
        await loadAllPosts();
    } catch (error) {
        showNotification('Error deleting post: ' + error.message, 'danger');
    }
}

// global functions
window.deletePost = deletePost;
window.toggleDraft = toggleDraft;

document.addEventListener('DOMContentLoaded', function() {
    loadAllPosts();
});

