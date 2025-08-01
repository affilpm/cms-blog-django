import { postFormData } from "../../../../static/js/api.js";
import { endpoints } from "../../../../static/js/apiEndpoints.js";

function setupLoginHandler() {
    const form = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        errorMessage.classList.add('d-none');

        try {
            const { response, data } = await postFormData(endpoints.login, formData);

            if (response.ok) {
                window.location.href = '/';
            } else {
                errorMessage.classList.remove('d-none');
                errorMessage.innerText = data.detail || 'Invalid credentials. Please try again.';
            }
        } catch (err) {
            console.error('Login error:', err);
            errorMessage.classList.remove('d-none');
            errorMessage.innerText = 'Something went wrong. Please try again later.';
        }
    });
}

setupLoginHandler();