import { post} from "/static/core_static/js/api.js";
import { endpoints } from "/static/core_static/js/apiEndpoints.js";

function setupLogoutHandler() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        try {
            const { response } = await post(endpoints.logout, true);

            if (response.ok) {
                window.location.href = '/';
            } else {
                alert('Logout failed');
            }
        } catch (err) {
            console.error('Logout error:', err);
            alert('Something went wrong. Please try again.');
        }
    });
}

// Initialize the logout handler
setupLogoutHandler();