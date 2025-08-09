// Import statements (make sure these files exist and paths are correct)
import { get, patch, del } from "/static/core_static/js/api.js";
import { endpoints } from "/static/core_static/js/apiEndpoints.js";

// Add utility functions that might be missing
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

async function loadUsers() {
    const tbody = document.getElementById('usersTbody');
    if (!tbody) {
        console.error('usersTbody element not found');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading users...</td></tr>';
    
    try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Mock data - replace with actual API call when ready
        // const users = [
        //     {id: 1, username: 'admin', email: 'admin@example.com', role: 'Admin', status: 'active', joined: '2024-01-01'},
        //     {id: 2, username: 'john_doe', email: 'john@example.com', role: 'User', status: 'active', joined: '2024-02-15'},
        //     {id: 3, username: 'jane_smith', email: 'jane@example.com', role: 'Editor', status: 'active', joined: '2024-03-20'},
        //     {id: 4, username: 'mike_wilson', email: 'mike@example.com', role: 'User', status: 'inactive', joined: '2024-04-10'}
        // ];
        const {response, data} = await get(endpoints.admin_user_list)
        const users = data
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td><strong>${user.username}</strong></td>
                <td>${user.email}</td>
                <td>User</td>
                <td><span class="badge ${user.is_active ? 'status-published' : 'status-pending'}">
                    ${user.is_active ? 'Active' : 'Inactive'}
                </span></td>
                <td>${formatDate(user.created_at)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <a class="btn btn-outline-primary btn-sm" href="/admin-panel/user-edit/${user.id}/" title="Edit">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteUser(${user.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-outline-warning btn-sm" onclick="toggleUserStatus(${user.id})" title="Toggle Status">
                            <i class="fas fa-toggle-on"></i>
                        </button>
                    </div>
                </td>
            </tr>
`).join('');
        
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading users</td></tr>';
        console.error('Error loading users:', error);
        showNotification('Error loading users: ' + error.message, 'danger');
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        
        await del(endpoints.admin_user_delete(id));
        
        showNotification('User deleted successfully!', 'success');
        await loadUsers(); // Reload the list
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user: ' + error.message, 'danger');
    }
}

async function toggleUserStatus(id) {
    try {

        await patch(endpoints.admin_user_toggle(id));

        showNotification('User status updated!', 'success');
        await loadUsers(); // Reload the list
    } catch (error) {
        console.error('Error updating user status:', error);
        showNotification('Error updating user status: ' + error.message, 'danger');
    }
}

// Make functions globally available for onclick handlers
window.deleteUser = deleteUser;
window.toggleUserStatus = toggleUserStatus;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
});

if (document.readyState === 'loading') {
    // Document still loading, wait for DOMContentLoaded
} else {
    // Document already loaded
    loadUsers();
}