import { endpoints } from "./apiEndpoints.js";
import { postFormData } from "../../../../static/js/api.js";

const form = document.getElementById('registerForm');
const errorBox = document.getElementById('errorMessage');
const successBox = document.getElementById('successMessage');

// Real-time validation for all fields
form.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', validateField);
});

function validateField(e) {
    const field = e.target;
    const feedback = field.parentElement.querySelector('.invalid-feedback');

    field.classList.remove('is-invalid', 'is-valid');

    if (!field.checkValidity()) {
        field.classList.add('is-invalid');
        if (feedback) feedback.textContent = getCustomErrorMessage(field);
    } else if (field.value.trim() !== '') {
        if (field.id === 'confirm_password') {
            const password = form.password.value;
            if (field.value !== password) {
                field.classList.add('is-invalid');
                if (feedback) feedback.textContent = 'Passwords do not match';
                return;
            }
        }
        field.classList.add('is-valid');
    }
}

function getCustomErrorMessage(field) {
    if (field.validity.valueMissing) {
        return `${field.labels[0].textContent} is required`;
    }
    if (field.validity.tooShort) {
        return `Minimum ${field.minLength} characters required`;
    }
    if (field.validity.patternMismatch) {
        switch (field.id) {
            case 'username':
                return '4-30 characters. Letters, numbers, and _ . - only';
            case 'email':
                return 'Please enter a valid email address (e.g., user@example.com)';
            case 'password':
                return 'Must contain uppercase, lowercase, number, and special character';
            case 'first_name':
            case 'last_name':
                return 'Only letters allowed';
            default:
                return 'Invalid format';
        }
    }
    if (field.validity.typeMismatch && field.type === 'email') {
        return 'Please enter a valid email address';
    }
    return field.validationMessage;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorBox.classList.add('d-none');
    successBox.classList.add('d-none');

    form.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.remove('is-invalid');
    });

    let isValid = true;
    form.querySelectorAll('input[required]').forEach(field => {
        if (!field.checkValidity()) {
            isValid = false;
            field.classList.add('is-invalid');
            const feedback = field.parentElement.querySelector('.invalid-feedback');
            if (feedback) feedback.textContent = getCustomErrorMessage(field);
        }
    });

    if (form.password.value !== form.confirm_password.value) {
        isValid = false;
        form.confirm_password.classList.add('is-invalid');
        const feedback = form.confirm_password.parentElement.querySelector('.invalid-feedback');
        if (feedback) feedback.textContent = 'Passwords do not match';
    }

    if (!form.terms.checked) {
        isValid = false;
        errorBox.innerHTML = '<li>You must agree to the Terms and Privacy Policy</li>';
        errorBox.classList.remove('d-none');
    }

    if (!isValid) return;

    const formData = new FormData(form);

    try {
        const { response, data } = await postFormData(endpoints.register, formData);

        if (response.ok) {
            successBox.textContent = 'Account created successfully!';
            successBox.classList.remove('d-none');
            form.reset();
            window.location.href = "{% url 'login' %}";
        } else {
            let hasFieldErrors = false;
            for (const [field, messages] of Object.entries(data)) {
                const input = form[field];
                if (input) {
                    input.classList.add('is-invalid');
                    const feedback = input.parentElement.querySelector('.invalid-feedback');
                    if (feedback) feedback.textContent = Array.isArray(messages) ? messages[0] : messages;
                    hasFieldErrors = true;
                }
            }

            if (!hasFieldErrors) {
                errorBox.innerHTML = Object.values(data).flat().map(msg => `<li>${msg}</li>`).join('');
                errorBox.classList.remove('d-none');
            }
        }
    } catch (err) {
        errorBox.textContent = 'Network error. Please try again.';
        errorBox.classList.remove('d-none');
    }
});