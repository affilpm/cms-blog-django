import { postFormData, get, del, patch } from "/static/core_static/js/api.js";
import { endpoints } from "/static/core_static/js/apiEndpoints.js";

// Global variable to store modal instance
let commentModal;

// Initialize modal and event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap modal
    const modalElement = document.getElementById('commentModal');
    if (modalElement) {
        commentModal = new bootstrap.Modal(modalElement);
    }
    
    const approveAllBtn = document.getElementById('approveAllBtn');
    if (approveAllBtn) {
        approveAllBtn.addEventListener('click', approveAllComments);
    }
});

// Function to show comment details in modal
function showCommentModal(commentData) {
    if (!commentModal) return;
    
    // Populate modal with comment data
    document.getElementById('modalCommentId').textContent = commentData.id;
    document.getElementById('modalCommentAuthor').textContent = commentData.author;
    document.getElementById('modalCommentPost').textContent = commentData.post;
    document.getElementById('modalCommentDate').textContent = commentData.date;
    document.getElementById('modalCommentContent').textContent = commentData.content;
    
    // Update status badge
    const statusBadge = document.getElementById('modalCommentStatus');
    statusBadge.textContent = commentData.status;
    statusBadge.className = `badge ms-2 ${commentData.status === 'Approved' ? 'status-published' : 'status-pending'}`;
    
    // Show the modal
    commentModal.show();
}

// Function to show notifications
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification-toast');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span>${message}</span>
            <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Function to toggle comment status with API call
async function toggleCommentStatus(id, currentStatus) {
    const button = document.querySelector(`button[data-comment-id="${id}"]`);
    if (!button) return;

    const originalHTML = button.innerHTML;
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    
    // Update button to loading state
    button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    button.disabled = true;

    try {
       
        
        // Send the PATCH request with the comment ID and new status
        const { response, data } = await patch(endpoints.toggle_comment(id))
        console.log(data)
        if (response.ok) {
            const isApproved = Boolean(data.data.is_approved);
            // Update the status badge
            const statusBadge = button.closest('tr').querySelector('.badge');
            statusBadge.textContent = isApproved ? 'Approved' : 'Pending'
            statusBadge.className = `badge ${isApproved ? 'status-published' : 'status-pending'}`;
            
            // Clear existing button classes
            button.classList.remove('btn-success', 'btn-danger', 'btn-warning', 'btn-outline-success');
            button.classList.add('btn', 'btn-lg');

            if (isApproved) {
                button.className = 'btn btn-success btn-lg';
                button.innerHTML = '<i class="fas fa-check"></i>';
                button.title = 'Approved - Click to set Pending';
            } else {
                button.className = 'btn btn-outline-success btn-lg';
                button.innerHTML = '<i class="fas fa-clock"></i>';
                button.title = 'Pending - Click to Approve';
            }

            button.setAttribute('onclick', `toggleCommentStatus(${id}, '${isApproved ? 'approved' : 'pending'}')`);
            showNotification(`Comment ${isApproved ? 'approved' : 'pending'}!`, 'success');

        } else {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error toggling comment status:', error);
        button.innerHTML = originalHTML;
        showNotification('Error updating comment status: ' + error.message, 'danger');
    } finally {
        button.disabled = false;
    }
}

// Function to approve all comments with API call
async function approveAllComments() {
    if (!confirm('Are you sure you want to approve all pending comments?')) return;

    const btn = document.getElementById('approveAllBtn');
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Approving...';
    btn.disabled = true;

    try {

        
        const { response, data } = await patch(endpoints.approve_all_comments);

        if (response.ok) {
            // Update all pending comments to approved
            const pendingButtons = document.querySelectorAll('button[onclick*="pending"]');
            pendingButtons.forEach(button => {
                const commentId = button.getAttribute('data-comment-id');
                if (commentId) {
                    // Update status badge
                    const statusBadge = button.closest('tr').querySelector('.badge');
                    statusBadge.textContent = 'Approved';
                    statusBadge.className = 'badge status-published';
                    
                    // Update button
                    button.className = 'btn btn-success btn-lg';
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    button.title = 'Approved - Click to set Pending';
                    button.setAttribute('onclick', `toggleCommentStatus(${commentId}, 'approved')`);
                }
            });
            
            if (data.success) {
                if (data.data.approved_count > 0) {
                    showNotification(
                        `Successfully approved ${data.data.approved_count} comments!`, 
                        'success'
                    );
                } else {
                    showNotification(
                        'No pending comments to approve.', 
                        'info'
                    );
                }
            } else {
                showNotification('Something went wrong while approving comments.', 'error');
            }
        } else {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error approving all comments:', error);
        showNotification('Error approving comments: ' + error.message, 'danger');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Make functions globally available for inline onclick handlers
globalThis.showCommentModal = showCommentModal;
globalThis.toggleCommentStatus = toggleCommentStatus;
globalThis.approveAllComments = approveAllComments;