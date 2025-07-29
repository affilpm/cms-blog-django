document.addEventListener('DOMContentLoaded', function() {
    const password1 = document.getElementById('id_password1');
    const password2 = document.getElementById('id_password2');
    const passwordRequirements = document.getElementById('passwordRequirements');
    const form = document.getElementById('registerForm');
    const submitBtn = document.querySelector('.btn-register');
    
    // Show password requirements when password field is focused
    password1.addEventListener('focus', function() {
        passwordRequirements.classList.remove('d-none');
    });
        
    // Real-time password validation
    password1.addEventListener('input', function() {
        const password = this.value;
            
        // Check length
        const lengthReq = document.getElementById('req-length');
        if (password.length >= 8) {
            lengthReq.innerHTML = '<span class="requirement-check fw-bold">✓</span> At least 8 characters long';
        } else {
            lengthReq.innerHTML = '<span class="requirement-cross fw-bold">✗</span> At least 8 characters long';
        }
            
        // Check uppercase
        const upperReq = document.getElementById('req-upper');
        if (/[A-Z]/.test(password)) {
            upperReq.innerHTML = '<span class="requirement-check fw-bold">✓</span> Contains uppercase letter';
        } else {
            upperReq.innerHTML = '<span class="requirement-cross fw-bold">✗</span> Contains uppercase letter';
        }
            
        // Check lowercase
        const lowerReq = document.getElementById('req-lower');
        if (/[a-z]/.test(password)) {
            lowerReq.innerHTML = '<span class="requirement-check fw-bold">✓</span> Contains lowercase letter';
        } else {
            lowerReq.innerHTML = '<span class="requirement-cross fw-bold">✗</span> Contains lowercase letter';
        }
            
        // Check number
        const numberReq = document.getElementById('req-number');
        if (/\d/.test(password)) {
            numberReq.innerHTML = '<span class="requirement-check fw-bold">✓</span> Contains number';
        } else {
            numberReq.innerHTML = '<span class="requirement-cross fw-bold">✗</span> Contains number';
        }
            
        checkPasswordMatch();
    });
        
    // Check password confirmation match
    password2.addEventListener('input', checkPasswordMatch);
        
    function checkPasswordMatch() {
        if (password1.value && password2.value) {
            if (password1.value === password2.value) {
                password2.classList.remove('is-invalid');
                password2.classList.add('is-valid');
            } else {
                password2.classList.remove('is-valid');
                password2.classList.add('is-invalid');
            }
        } else {
            password2.classList.remove('is-valid', 'is-invalid');
        }
    }
        
    // Add loading state to submit button
    form.addEventListener('submit', function() {
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating account...';
        submitBtn.disabled = true;
    });
        
    // Username availability check placeholder
    const username = document.getElementById('id_username');
    let usernameTimeout;
        
    username.addEventListener('input', function() {
        clearTimeout(usernameTimeout);
        const value = this.value.trim();
            
        if (value.length >= 3) {
            usernameTimeout = setTimeout(() => {
                console.log('Checking username availability for:', value);
            }, 500);
        }
    });
});