import { postFormData } from "../../../../static/js/api.js";
import { endpoints } from "../../../../static/js/apiEndpoints.js";

document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const errorMessage = document.getElementById('error-message');

    const { response, data } = await postFormData(endpoints.login, formData);

    if (response.ok) {
        window.location.href = '/';
    } else {
        errorMessage.classList.remove('d-none');
        errorMessage.innerText = data.detail || 'Invalid credentials. Please try again.';
    }
});