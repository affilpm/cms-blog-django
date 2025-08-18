import { postFormData } from "/static/core_static/js/api.js";
import { endpoints } from "/static/core_static/js/apiEndpoints.js";

const form = document.getElementById('registerForm');
const errorBox = document.getElementById('errorMessage');
const successBox = document.getElementById('successMessage');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    if (!form) {
        console.error('Form not found!');
        return;
    }

    // Real-time validation
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', validateField);
    });

    // Form submission
    form.addEventListener('submit', handleFormSubmit);
});

function validateField(e) {
    const field = e.target;
    const feedback = field.parentElement.querySelector('.invalid-feedback');

    field.classList.remove('is-invalid', 'is-valid');

    if (!field.checkValidity()) {
        field.classList.add('is-invalid');
        if (feedback) feedback.textContent = getCustomErrorMessage(field);
    } else if (field.value.trim() !== '') {
        field.classList.add('is-valid');
    }
}

function getCustomErrorMessage(field) {
    if (field.validity.valueMissing) {
        const label = field.labels && field.labels[0] ? field.labels[0].textContent : field.name;
        return `${label} is required`;
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

async function handleFormSubmit(e) {
    e.preventDefault();

    // Hide previous messages
    if (errorBox) errorBox.classList.add('d-none');
    if (successBox) successBox.classList.add('d-none');

    // Clear previous validation states
    form.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.remove('is-invalid');
    });

    // Validate all required fields
    let isValid = true;
    const requiredFields = form.querySelectorAll('input[required]');
    
    requiredFields.forEach(field => {
        if (!field.checkValidity()) {
            isValid = false;
            field.classList.add('is-invalid');
            const feedback = field.parentElement.querySelector('.invalid-feedback');
            if (feedback) feedback.textContent = getCustomErrorMessage(field);
        }
    });

    // Check if terms checkbox exists and is checked (uncomment if needed)
    // const termsCheckbox = form.querySelector('input[name="terms"]');
    // if (termsCheckbox && !termsCheckbox.checked) {
    //     isValid = false;
    //     showError('You must agree to the Terms and Privacy Policy');
    // }

    if (!isValid) return;

    // Prepare form data
    const formData = new FormData(form);
    
    // Add submit button loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
        // Make API call
        const { response, data } = await postFormData(endpoints.admin_user_create, formData);

        if (response.ok) {
            // Success
            showSuccess('Account created successfully!');
            form.reset();
            // Remove validation classes
            form.querySelectorAll('.is-valid, .is-invalid').forEach(field => {
                field.classList.remove('is-valid', 'is-invalid');
            });
            
            window.location.href = "/admin-panel/";
        } else {
            // Handle validation errors from server
            let hasFieldErrors = false;
            
            if (data && typeof data === 'object') {
                for (const [fieldName, messages] of Object.entries(data)) {
                    const input = form.querySelector(`[name="${fieldName}"]`);
                    if (input) {
                        input.classList.add('is-invalid');
                        const feedback = input.parentElement.querySelector('.invalid-feedback');
                        if (feedback) {
                            feedback.textContent = Array.isArray(messages) ? messages[0] : messages;
                        }
                        hasFieldErrors = true;
                    }
                }
            }

            // Show general errors if no field-specific errors
            if (!hasFieldErrors && data) {
                if (typeof data === 'string') {
                    showError(data);
                } else if (typeof data === 'object') {
                    const errorMessages = Object.values(data).flat();
                    showError(errorMessages.join('. '));
                } else {
                    showError('Registration failed. Please check your information and try again.');
                }
            }
        }
    } catch (err) {
        console.error('Registration error:', err);
        showError('Network error. Please check your connection and try again.');
    } finally {
        // Reset submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function showError(message) {
    if (errorBox) {
        if (typeof message === 'string') {
            errorBox.textContent = message;
        } else if (Array.isArray(message)) {
            errorBox.innerHTML = message.map(msg => `<li>${msg}</li>`).join('');
        }
        errorBox.classList.remove('d-none');
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function showSuccess(message) {
    if (successBox) {
        successBox.textContent = message;
        successBox.classList.remove('d-none');
        successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}