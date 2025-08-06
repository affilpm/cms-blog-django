async function loadUsers() {
    const tbody = document.getElementById('usersTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading users...</td></tr>';
    
    try {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const users = [
            {id: 1, username: 'admin', email: 'admin@example.com', role: 'Admin', status: 'active', joined: '2024-01-01'},
            {id: 2, username: 'john_doe', email: 'john@example.com', role: 'User', status: 'active', joined: '2024-02-15'},
            {id: 3, username: 'jane_smith', email: 'jane@example.com', role: 'Editor', status: 'active', joined: '2024-03-20'},
            {id: 4, username: 'mike_wilson', email: 'mike@example.com', role: 'User', status: 'inactive', joined: '2024-04-10'}
        ];
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td><strong>${user.username}</strong></td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><span class="badge ${user.status === 'active' ? 'status-published' : 'status-pending'}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span></td>
                <td>${formatDate(user.joined)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <a class="btn btn-outline-primary btn-sm" href="{% url 'user_edit' pk=${user.id} %}" title="Edit">
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
        await new Promise(resolve => setTimeout(resolve, 500));
        showNotification('User deleted successfully!', 'success');
        await loadUsers();
    } catch (error) {
        showNotification('Error deleting user: ' + error.message, 'danger');
    }
}

async function toggleUserStatus(id) {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        showNotification('User status updated!', 'success');
        await loadUsers();
    } catch (error) {
        showNotification('Error updating user status: ' + error.message, 'danger');
    }
}