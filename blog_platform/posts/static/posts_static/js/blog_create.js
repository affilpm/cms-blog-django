// Import API utilities
import { postFormData, get } from "/static/core_static/js/api.js";

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const titleInput = document.querySelector('.title-input');
    const contentTextarea = document.querySelector('.content-textarea');
    const categorySelect = document.querySelector('.category-select');
    const coverImageInput = document.getElementById('coverImageInput');
    const imagePreview = document.getElementById('imagePreview');
    const uploadSection = document.getElementById('imageUploadSection');
    const uploadContent = document.getElementById('uploadContent');
    const imageInfo = document.getElementById('imageInfo');
    const imageActions = document.getElementById('imageActions');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const publishBtn = document.getElementById('publishBtn');
    const draftBtn = document.querySelector('.draft-btn');
    
    // File validation constants
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    
    // Initialize
    initializeForm();
    fetchCategories();
    
    function initializeForm() {
        autoResize(titleInput);
        updateCharCount();
        
        // Event listeners
        titleInput.addEventListener('input', handleTitleInput);
        contentTextarea.addEventListener('input', handleContentInput);
        coverImageInput.addEventListener('change', handleImageChange);
        removeImageBtn.addEventListener('click', removeImage);
        draftBtn.addEventListener('click', saveDraft);
        publishBtn.addEventListener('click', publishPost);
        
        // Drag and drop
        setupImageDragDrop();
        
        // Prevent default form submission
        document.getElementById('postForm').addEventListener('submit', e => e.preventDefault());
    }
    
    // Fetch categories from API
    async function fetchCategories() {
        try {
            const { response, data } = await get('/api/posts/category/')
            console.log(data)
            if (response.ok) {
                const categories = data;
                populateCategories(categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }
    
    function populateCategories(categories) {
        categorySelect.innerHTML = '<option value="">Choose a category...</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    // Title handling
    function handleTitleInput() {
        autoResize(this);
        updateCharCount();
    }
    
    // Content handling
    function handleContentInput() {
        // Just handle content input without auto-saving
        // You can add other content-related functionality here if needed
    }
    
    function autoResize(element) {
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    }
    
    function updateCharCount() {
        const count = titleInput.value.length;
        const countElement = document.getElementById('titleCount');
        countElement.textContent = count;
        countElement.style.color = count > 240 ? '#dc3545' : '#757575';
    }
    
    // Image handling
    function handleImageChange(e) {
        const file = e.target.files[0];
        if (file) handleImagePreview(file);
    }
    
    function handleImagePreview(file) {
        const errors = validateImage(file);
        if (errors.length > 0) {
            showError(errors[0]);
            coverImageInput.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                updateImageUI(e.target.result, file, img);
                showSuccess('Image uploaded successfully!');
                
                if (img.width < 800 || img.height < 400) {
                    showError('For best results, use an image at least 800×400px');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function updateImageUI(src, file, img) {
        imagePreview.src = src;
        imagePreview.style.display = 'block';
        uploadSection.classList.add('has-image');
        uploadContent.style.display = 'none';
        imageInfo.style.display = 'block';
        imageActions.style.display = 'flex';
        
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = formatFileSize(file.size);
        document.getElementById('imageDimensions').textContent = `${img.width} × ${img.height}px`;
    }
    
    function removeImage() {
        if (!confirm('Are you sure you want to remove this image?')) return;
        
        coverImageInput.value = '';
        imagePreview.style.display = 'none';
        imagePreview.src = '';
        uploadSection.classList.remove('has-image');
        uploadContent.style.display = 'block';
        imageInfo.style.display = 'none';
        imageActions.style.display = 'none';
        showSuccess('Image removed successfully');
    }
    
    function setupImageDragDrop() {
        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.classList.add('drag-over');
        });
        
        uploadSection.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('drag-over');
        });
        
        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    coverImageInput.files = files;
                    handleImagePreview(file);
                } else {
                    showError('Please drop an image file');
                }
            }
        });
        
        uploadSection.addEventListener('click', (e) => {
            if (!uploadSection.classList.contains('has-image') && !e.target.closest('.image-actions')) {
                coverImageInput.click();
            }
        });
    }
    
    // Form validation
    function validateForm(isDraft = false) {
        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();
        const category = categorySelect.value;
        
        const errors = [];
        
        // For publishing, all fields are required
        if (!isDraft) {
            if (!title) errors.push('Title is required');
            if (!content) errors.push('Content is required');
            if (!category) errors.push('Category is required');
        }
        
        // Title length validation (if title exists)
        if (title && title.length > 255) errors.push('Title must be less than 255 characters');
        
        // Image validation (if image exists)
        if (coverImageInput.files.length > 0) {
            const imageErrors = validateImage(coverImageInput.files[0]);
            errors.push(...imageErrors);
        }
        
        return errors;
    }
    
    function validateImage(file) {
        const errors = [];
        
        if (!allowedTypes.includes(file.type)) {
            errors.push('Please select a valid image file (JPEG, PNG, or WebP)');
        }
        
        if (file.size > maxFileSize) {
            errors.push(`File size must be less than ${formatFileSize(maxFileSize)}`);
        }
        
        return errors;
    }
    
    // Save draft
    async function saveDraft() {
        const errors = validateForm(true); // Pass true for draft validation
        if (errors.length > 0) {
            alert('Please fix the following errors:\n\n' + errors.join('\n'));
            return;
        }
        
        const formData = new FormData(document.getElementById('postForm'));
        formData.append('is_draft', 'true'); // Add draft status to form data
        
        try {
            this.disabled = true;
            this.textContent = 'Saving...';
            
            const { response, data } = await postFormData('/api/posts/post/', formData);
            
            console.log('Response status:', response.status);
            console.log('Response data:', data);
            
            if (response.ok) {
                showSuccess(data.message || 'Draft saved successfully!');
                if (data.redirect_url) {
                    setTimeout(() => {
                        window.location.href = data.redirect_url;
                    }, 1500);
                }
            } else {
                // Handle different error types
                let errorMessage = 'Failed to save draft';
                
                if (data.error) {
                    errorMessage = data.error;
                } else if (data.details) {
                    // Handle validation errors
                    const errorDetails = [];
                    for (const [field, errors] of Object.entries(data.details)) {
                        errorDetails.push(`${field}: ${errors.join(', ')}`);
                    }
                    errorMessage = errorDetails.join('\n');
                } else if (data.detail) {
                    errorMessage = data.detail;
                }
                
                showError(errorMessage);
            }
        } catch (error) {
            console.error('Network error:', error);
            showError('Network error. Please try again.');
        } finally {
            this.disabled = false;
            this.textContent = 'Save Draft';
        }
    }
    
    // Publish post
    async function publishPost(e) {
        e.preventDefault();
        const errors = validateForm(false); // Pass false for publish validation
        if (errors.length > 0) {
            alert('Please fix the following errors:\n\n' + errors.join('\n'));
            return;
        }
        
        const formData = new FormData(document.getElementById('postForm'));
        formData.append('is_draft', 'false'); // Add publish status to form data
        
        try {
            this.disabled = true;
            this.innerHTML = '<i class="spinner-border spinner-border-sm me-1"></i>Publishing...';
            
            const { response, data } = await postFormData('/api/posts/post/', formData);
            
            console.log('Response status:', response.status);
            console.log('Response data:', data);
            
            if (response.ok) {
                showSuccess(data.message || 'Post published successfully!');
                
                if (data.redirect_url || data.post_url) {
                    setTimeout(() => {
                        window.location.href = data.redirect_url || data.post_url;
                    }, 1500);
                }
            } else {
                // Handle different error types
                let errorMessage = 'Failed to publish post';
                
                if (data.error) {
                    errorMessage = data.error;
                } else if (data.details) {
                    // Handle validation errors
                    const errorDetails = [];
                    for (const [field, errors] of Object.entries(data.details)) {
                        errorDetails.push(`${field}: ${errors.join(', ')}`);
                    }
                    errorMessage = errorDetails.join('\n');
                } else if (data.detail) {
                    errorMessage = data.detail;
                }
                
                showError(errorMessage);
            }
        } catch (error) {
            console.error('Network error:', error);
            showError('Network error. Please try again.');
        } finally {
            this.disabled = false;
            this.innerHTML = '<i class="bi bi-send me-1"></i>Publish';
        }
    }
    
    // Utility functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function showMessage(element, message, isError = false) {
        const imageError = document.getElementById('imageError');
        const imageSuccess = document.getElementById('imageSuccess');
        
        element.textContent = message;
        element.style.display = 'block';
        
        const otherElement = isError ? imageSuccess : imageError;
        otherElement.style.display = 'none';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, isError ? 5000 : 3000);
    }
    
    function showError(message) {
        showMessage(document.getElementById('imageError'), message, true);
    }
    
    function showSuccess(message) {
        showMessage(document.getElementById('imageSuccess'), message, false);
    }
});