import { get , patch } from "/static/core_static/js/api.js";
import { endpoints } from "/static/core_static/js/apiEndpoints.js";

const form = document.getElementById('registerForm');
const errorBox = document.getElementById('errorMessage');
const successBox = document.getElementById('successMessage');
let originalUserData = {}
const userId = document.getElementById('user-edit-container').dataset.userId;

document.addEventListener("DOMContentLoaded", () => {
    loadUserData();
    setupFormHandlers();
});

async function loadUserData() {
    try {
        const { response, data } = await get(endpoints.admin_user_detail(userId));
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const userData = data
        originalUserData = userData

        // Populate form fields
        document.getElementById("username").value = userData.username || '';
        document.getElementById("email").value = userData.email || '';
        document.getElementById("first_name").value = userData.first_name || '';
        document.getElementById("last_name").value = userData.last_name || '';
        
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showError('Failed to load user data. Please refresh the page.');
    }
}

// Setup form event handlers
function setupFormHandlers() {
    if (!form) {
        console.error('Form not found!');
        return;
    }
    
    // Real-time validation
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', validateField);
    });
    
    form.addEventListener('submit', handleFormSubmit);
}

// Real-time field validation
function validateField(e) {
    const field = e.target;
    const feedback = field.parentElement.querySelector('.invalid-feedback');

    field.classList.remove('is-invalid', 'is-valid');

    // Special handling for password field in edit mode (optional)
    if (field.id === 'password') {
        validatePasswordField(field);
        return;
    }

    if (!field.checkValidity()) {
        field.classList.add('is-invalid');
        if (feedback) feedback.textContent = getCustomErrorMessage(field);
    } else if (field.value.trim() !== '') {
        field.classList.add('is-valid');
    }
}

// Special validation for password field (optional in edit mode)
function validatePasswordField(passwordField) {
    if (!passwordField) return; // Skip if password field doesn't exist
    
    const password = passwordField.value;
    const passwordFeedback = passwordField.parentElement.querySelector('.invalid-feedback');
    
    // Clear previous states
    passwordField.classList.remove('is-invalid', 'is-valid');
    
    // If password field is empty, it's valid (optional in edit mode)
    if (password === '') {
        passwordField.classList.add('is-valid');
        return;
    }
    
    // If password is provided, validate it
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(password)) {
        passwordField.classList.add('is-invalid');
        if (passwordFeedback) passwordFeedback.textContent = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    } else {
        passwordField.classList.add('is-valid');
    }
}

// Custom error messages for different validation scenarios
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

// Handle form submission for updating user
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Hide previous messages
    hideMessages();

    // Clear previous validation states
    form.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.remove('is-invalid');
    });

    // Validate all required fields (excluding password which is optional for edit)
    let isValid = true;
    const requiredFields = form.querySelectorAll('input[required]');
    
    requiredFields.forEach(field => {
        // Skip password validation here as it's handled separately
        if (field.id === 'password') return;
        
        if (!field.checkValidity()) {
            isValid = false;
            field.classList.add('is-invalid');
            const feedback = field.parentElement.querySelector('.invalid-feedback');
            if (feedback) feedback.textContent = getCustomErrorMessage(field);
        }
    });

    // Special validation for password field (only if provided)
    const passwordField = document.getElementById('password');
    
    if (passwordField && passwordField.value !== '') {
        const password = passwordField.value;
        
        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        
        if (!passwordRegex.test(password)) {
            isValid = false;
            passwordField.classList.add('is-invalid');
            const feedback = passwordField.parentElement.querySelector('.invalid-feedback');
            if (feedback) feedback.textContent = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
        }
    }

    if (!isValid) return;

    const changedform = () => {
        const changedData = {};
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const firstName = document.getElementById("first_name").value;
        const lastName = document.getElementById("last_name").value;
        const password = document.getElementById("password").value;

        // Compare current form values with original data
        if (username !== originalUserData.username) {
            changedData.username = username;
        }
        if (email !== originalUserData.email) {
            changedData.email = email;
        }
        if (firstName !== originalUserData.first_name) {
            changedData.first_name = firstName;
        }
        if (lastName !== originalUserData.last_name) {
            changedData.last_name = lastName;
        }
        // Only include password if it's not empty (user wants to change it)
        if (password !== '') {
            changedData.password = password;
        }

        return changedData
    }
    
    const formData = changedform()

    if (Object.keys(formData).length === 0) {
        alert('No change detected. Please modify at least one field before submitting.');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Store original button text and show loading state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating Account...';
    
    try {
        const {response, data} = await patch(endpoints.admin_user_edit(userId), formData);
        
        if (response.ok) {
            showSuccess('Account updated successfully!');
            window.location.href = '/admin-panel/'
            // // Optionally reload the data to show updated values
            // setTimeout(() => loadUserData(), 1000);
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
                    showError(data.detail || 'Update failed. Please try again.');
                }
            }
        }
        
    } catch (error) {
        console.error('Update error:', error);
        showError('Network error. Please check your connection and try again.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}


// Utility functions for showing/hiding messages
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

function hideMessages() {
    if (errorBox) errorBox.classList.add('d-none');
    if (successBox) successBox.classList.add('d-none');
}