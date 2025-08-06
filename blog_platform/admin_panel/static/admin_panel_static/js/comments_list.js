async function loadComments() {
    const tbody = document.getElementById('commentsTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading comments...</td></tr>';
    
    try {
        await new Promise(resolve => setTimeout(resolve, 700));
        
        const comments = [
            {id: 1, comment: 'Great tutorial! Very helpful for beginners.', author: 'john_doe', post: 'Getting Started with Django', status: 'approved', date: '2024-08-02'},
            {id: 2, comment: 'Very informative, thanks for sharing!', author: 'jane_smith', post: 'Getting Started with Django', status: 'pending', date: '2024-08-03'},
            {id: 3, comment: 'Could you add more examples?', author: 'mike_wilson', post: 'React Best Practices', status: 'approved', date: '2024-08-06'},
            {id: 4, comment: 'This is exactly what I was looking for!', author: 'user123', post: 'Database Optimization Tips', status: 'pending', date: '2024-08-08'}
        ];
        
        tbody.innerHTML = comments.map(comment => `
            <tr>
                <td>${comment.id}</td>
                <td>
                    <div class="comment-text" title="${comment.comment}">
                        ${comment.comment.length > 50 ? comment.comment.substring(0, 50) + '...' : comment.comment}
                    </div>
                </td>
                <td>${comment.author}</td>
                <td>${comment.post}</td>
                <td><span class="badge ${comment.status === 'approved' ? 'status-published' : 'status-pending'}">${comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}</span></td>
                <td>${formatDate(comment.date)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        ${comment.status === 'pending' ? 
                            `<button class="btn btn-outline-success btn-sm" onclick="approveComment(${comment.id})" title="Approve">
                                <i class="fas fa-check"></i>
                            </button>` : ''}
                        <a class="btn btn-outline-info btn-sm" href="{% url 'comment_view' pk=${comment.id} %}" title="View">
                            <i class="fas fa-eye"></i>
                        </a>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteComment(${comment.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading comments</td></tr>';
        console.error('Error loading comments:', error);
        showNotification('Error loading comments: ' + error.message, 'danger');
    }
}

async function approveComment(id) {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        showNotification('Comment approved!', 'success');
        await loadComments();
    } catch (error) {
        showNotification('Error approving comment: ' + error.message, 'danger');
    }
}

async function approveAllComments() {
    if (!confirm('Are you sure you want to approve all pending comments?')) return;

    const btn = document.getElementById('approveAllBtn');
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Approving...';
    btn.disabled = true;

    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        showNotification('All comments approved successfully!', 'success');
        await loadComments();
    } catch (error) {
        showNotification('Error approving comments: ' + error.message, 'danger');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function viewComment(id) {
    showNotification(`Viewing comment ${id}...`, 'info');
}

async function deleteComment(id) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        showNotification('Comment deleted successfully!', 'success');
        await loadComments();
    } catch (error) {
        showNotification('Error deleting comment: ' + error.message, 'danger');
    }
}