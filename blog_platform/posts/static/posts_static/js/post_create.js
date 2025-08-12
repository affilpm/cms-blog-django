import { postFormData, get } from "/static/core_static/js/api.js";
import { endpoints } from "/static/core_static/js/apiEndpoints.js";

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements with null checks
    const elements = {
        titleInput: document.querySelector('.title-input'),
        categorySelect: document.querySelector('.category-select'),
        coverImageInput: document.getElementById('coverImageInput'),
        imagePreview: document.getElementById('imagePreview'),
        imageUploadSection: document.getElementById('imageUploadSection'),
        imageUploadContent: document.getElementById('uploadContent'),
        imageInfo: document.getElementById('imageInfo'),
        imageActions: document.getElementById('imageActions'),
        removeImageBtn: document.getElementById('removeImageBtn'),
        publishBtn: document.getElementById('publishBtn'),
        draftBtn: document.querySelector('.draft-btn'),
        attachmentInput: document.getElementById('attachmentInput'),
        attachmentUploadArea: document.getElementById('attachmentUploadArea'),
        attachmentPreview: document.getElementById('attachmentPreview'),
        attachmentInfo: document.getElementById('attachmentInfo'),
        attachmentActions: document.getElementById('attachmentActions'),
        removeAttachmentBtn: document.getElementById('removeAttachmentBtn'),
        attachmentUploadPrompt: document.getElementById('attachmentUploadPrompt'),
        hiddenContent: document.getElementById('hiddenContent'),
        editorContainer: document.getElementById('editorContainer'),
        fullscreenToggle: document.getElementById('fullscreenToggle')
    };

    // Validate required elements
    const requiredElements = {
        titleInput: '.title-input',
        categorySelect: '.category-select',
        publishBtn: '#publishBtn',
        hiddenContent: '#hiddenContent'
    };

    const missingElements = Object.entries(requiredElements)
        .filter(([key]) => !elements[key])
        .map(([, selector]) => selector);

    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        alert(`Page initialization failed. Missing elements: ${missingElements.join(', ')}`);
        return;
    }

    // Rich Text Editor Setup
    let quill = null;
    let isFullscreen = false;

    // Initialize Quill Editor
    function initializeEditor() {
        if (!window.Quill) {
            console.error('Quill library not loaded');
            return;
        }

        // Custom toolbar configuration
        const toolbarOptions = {
            container: '#editor-toolbar',
            handlers: {
                'image': imageHandler
            }
        };

        quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions,
                history: {
                    delay: 2000,
                    maxStack: 500,
                    userOnly: true
                }
            },
            placeholder: 'Tell your story...',
            scrollingContainer: '#editor',
        });

        // Set up editor event listeners
        quill.on('text-change', () => {
            updateWordCount();
            updateHiddenContent();
        });

        quill.on('selection-change', (range, oldRange, source) => {
            if (range) {
                elements.editorContainer.classList.add('focused');
            } else {
                elements.editorContainer.classList.remove('focused');
            }
        });

        // Custom image handler
        function imageHandler() {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.addEventListener('change', () => {
                const file = input.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const range = quill.getSelection();
                        quill.insertEmbed(range.index, 'image', e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
            input.click();
        }

        // Fullscreen functionality
        if (elements.fullscreenToggle) {
            elements.fullscreenToggle.addEventListener('click', toggleFullscreen);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        saveDraft();
                        break;
                    case 'Enter':
                        if (e.shiftKey) {
                            e.preventDefault();
                            publishPost();
                        }
                        break;
                    case 'F11':
                        e.preventDefault();
                        toggleFullscreen();
                        break;
                }
            }
            if (e.key === 'Escape' && isFullscreen) {
                toggleFullscreen();
            }
        });

        updateWordCount();
    }

    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
        
        if (isFullscreen) {
            elements.editorContainer.classList.add('editor-fullscreen');
            elements.fullscreenToggle.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
            elements.fullscreenToggle.title = 'Exit Fullscreen';
            document.body.style.overflow = 'hidden';
        } else {
            elements.editorContainer.classList.remove('editor-fullscreen');
            elements.fullscreenToggle.innerHTML = '<i class="bi bi-arrows-fullscreen"></i>';
            elements.fullscreenToggle.title = 'Toggle Fullscreen';
            document.body.style.overflow = '';
        }
    }

    function updateWordCount() {
        if (!quill) return;

        const text = quill.getText().trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        const charCount = text.length;
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute

        const wordCountEl = document.getElementById('wordCount');
        const charCountEl = document.getElementById('charCount');
        const readingTimeEl = document.getElementById('readingTime');

        if (wordCountEl) wordCountEl.textContent = wordCount.toLocaleString();
        if (charCountEl) charCountEl.textContent = charCount.toLocaleString();
        if (readingTimeEl) readingTimeEl.textContent = `${readingTime} min read`;
    }

    function updateHiddenContent() {
        if (!quill || !elements.hiddenContent) return;
        
        // Get HTML content from editor and store in hidden textarea
        const htmlContent = quill.root.innerHTML;
        elements.hiddenContent.value = htmlContent;
    }

    function getPlainTextContent() {
        return quill ? quill.getText().trim() : '';
    }

    function getHtmlContent() {
        return quill ? quill.root.innerHTML : '';
    }

    // File validation constants
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedAttachmentTypes = [
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'application/zip', 'application/x-rar-compressed',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'audio/mpeg', 'audio/wav', 'audio/mp3'
    ];
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxAttachmentSize = 10 * 1024 * 1024; // 10MB

    // File type configurations
    const fileTypeConfig = {
        'application/pdf': { icon: 'bi-file-earmark-pdf', class: 'pdf', name: 'PDF' },
        'application/msword': { icon: 'bi-file-earmark-word', class: 'doc', name: 'Word' },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'bi-file-earmark-word', class: 'doc', name: 'Word' },
        'text/plain': { icon: 'bi-file-earmark-text', class: 'other', name: 'Text' },
        'application/zip': { icon: 'bi-file-earmark-zip', class: 'archive', name: 'ZIP' },
        'image/jpeg': { icon: 'bi-file-earmark-image', class: 'image', name: 'Image' },
        'image/png': { icon: 'bi-file-earmark-image', class: 'image', name: 'Image' },
        'video/mp4': { icon: 'bi-file-earmark-play', class: 'video', name: 'Video' },
        'audio/mp3': { icon: 'bi-file-earmark-music', class: 'audio', name: 'Audio' }
    };

    // Initialize form
    function initializeForm() {
        if (elements.titleInput) {
            autoResize(elements.titleInput);
            updateCharCount();
            elements.titleInput.addEventListener('input', handleTitleInput);
        }

        if (elements.coverImageInput) {
            elements.coverImageInput.addEventListener('change', handleImageChange);
        }

        if (elements.removeImageBtn) {
            elements.removeImageBtn.addEventListener('click', removeImage);
        }

        if (elements.attachmentInput) {
            elements.attachmentInput.addEventListener('change', handleAttachmentChange);
        }

        if (elements.removeAttachmentBtn) {
            elements.removeAttachmentBtn.addEventListener('click', removeAttachment);
        }

        if (elements.draftBtn) {
            elements.draftBtn.addEventListener('click', saveDraft);
        }

        if (elements.publishBtn) {
            elements.publishBtn.addEventListener('click', publishPost);
        }

        setupImageDragDrop();
        setupAttachmentDragDrop();

        const postForm = document.getElementById('postForm');
        if (postForm) {
            postForm.addEventListener('submit', e => e.preventDefault());
        }

        // Initialize the rich text editor
        initializeEditor();
        fetchCategories();
    }

    // Fetch categories
    async function fetchCategories() {
        if (!elements.categorySelect) return;

        try {
            const { response, data } = await get(endpoints.category_list);
            if (response.ok) {
                populateCategories(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }

    function populateCategories(categories) {
        if (!elements.categorySelect) return;

        elements.categorySelect.innerHTML = '<option value="">Choose a category...</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            elements.categorySelect.appendChild(option);
        });
    }

    // Title handling
    function handleTitleInput() {
        autoResize(this);
        updateCharCount();
    }

    function autoResize(element) {
        if (!element) return;
        element.style.height = 'auto';
        element.style.height = `${element.scrollHeight}px`;
    }

    function updateCharCount() {
        if (!elements.titleInput) return;

        const count = elements.titleInput.value.length;
        const countElement = document.getElementById('titleCount');
        if (countElement) {
            countElement.textContent = count;
            countElement.style.color = count > 240 ? '#dc3545' : '#757575';
        }
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
            if (elements.coverImageInput) elements.coverImageInput.value = '';
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
        if (elements.imagePreview) {
            elements.imagePreview.src = src;
            elements.imagePreview.style.display = 'block';
        }

        if (elements.imageUploadSection) {
            elements.imageUploadSection.classList.add('has-image');
        }

        if (elements.imageUploadContent) {
            elements.imageUploadContent.style.display = 'none';
        }

        if (elements.imageInfo) {
            elements.imageInfo.style.display = 'block';
        }

        if (elements.imageActions) {
            elements.imageActions.style.display = 'flex';
        }

        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const imageDimensions = document.getElementById('imageDimensions');

        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = formatFileSize(file.size);
        if (imageDimensions) imageDimensions.textContent = `${img.width} × ${img.height}px`;
    }

    function removeImage() {
        if (!confirm('Are you sure you want to remove this image?')) return;

        if (elements.coverImageInput) elements.coverImageInput.value = '';
        if (elements.imagePreview) {
            elements.imagePreview.style.display = 'none';
            elements.imagePreview.src = '';
        }
        if (elements.imageUploadSection) elements.imageUploadSection.classList.remove('has-image');
        if (elements.imageUploadContent) elements.imageUploadContent.style.display = 'block';
        if (elements.imageInfo) elements.imageInfo.style.display = 'none';
        if (elements.imageActions) elements.imageActions.style.display = 'none';
        showSuccess('Image removed successfully');
    }

    // Attachment handling
    function handleAttachmentChange(e) {
        const file = e.target.files[0];
        if (file) handleAttachmentPreview(file);
    }

    function handleAttachmentPreview(file) {
        const errors = validateAttachment(file);
        if (errors.length > 0) {
            showAttachmentError(errors[0]);
            if (elements.attachmentInput) elements.attachmentInput.value = '';
            return;
        }

        updateAttachmentUI(file);
        showAttachmentSuccess('Attachment uploaded successfully!');
    }

    function updateAttachmentUI(file) {
        const fileTypeInfo = getFileTypeInfo(file.type);

        if (elements.attachmentUploadArea) elements.attachmentUploadArea.classList.add('has-attachment');
        if (elements.attachmentPreview) elements.attachmentPreview.style.display = 'block';
        if (elements.attachmentInfo) elements.attachmentInfo.style.display = 'block';
        if (elements.attachmentActions) elements.attachmentActions.style.display = 'flex';

        const attachmentIcon = document.getElementById('attachmentIcon');
        const attachmentName = document.getElementById('attachmentName');
        const attachmentSize = document.getElementById('attachmentSize');
        const attachmentType = document.getElementById('attachmentType');

        if (attachmentIcon) attachmentIcon.className = `${fileTypeInfo.icon} ${fileTypeInfo.class}`;
        if (attachmentName) attachmentName.textContent = file.name;
        if (attachmentSize) attachmentSize.textContent = formatFileSize(file.size);
        if (attachmentType) attachmentType.textContent = fileTypeInfo.name;

        if (elements.attachmentUploadPrompt) elements.attachmentUploadPrompt.style.display = 'none';
    }

    function removeAttachment() {
        if (!confirm('Are you sure you want to remove this attachment?')) return;

        if (elements.attachmentInput) elements.attachmentInput.value = '';
        if (elements.attachmentUploadArea) elements.attachmentUploadArea.classList.remove('has-attachment');
        if (elements.attachmentPreview) elements.attachmentPreview.style.display = 'none';
        if (elements.attachmentInfo) elements.attachmentInfo.style.display = 'none';
        if (elements.attachmentActions) elements.attachmentActions.style.display = 'none';
        if (elements.attachmentUploadPrompt) elements.attachmentUploadPrompt.style.display = 'block';
        showAttachmentSuccess('Attachment removed successfully');
    }

    function getFileTypeInfo(mimeType) {
        return fileTypeConfig[mimeType] || { icon: 'bi-file-earmark', class: 'other', name: 'File' };
    }

    // Drag and drop setup
    function setupImageDragDrop() {
        if (!elements.imageUploadSection) return;

        elements.imageUploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.imageUploadSection.classList.add('drag-over');
        });

        elements.imageUploadSection.addEventListener('dragleave', (e) => {
            e.preventDefault();
            elements.imageUploadSection.classList.remove('drag-over');
        });

        elements.imageUploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.imageUploadSection.classList.remove('drag-over');

            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                if (elements.coverImageInput) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    elements.coverImageInput.files = dataTransfer.files;
                    handleImagePreview(file);
                }
            } else {
                showError('Please drop an image file');
            }
        });

        elements.imageUploadSection.addEventListener('click', (e) => {
            if (!elements.imageUploadSection.classList.contains('has-image') && !e.target.closest('.image-actions')) {
                if (elements.coverImageInput) elements.coverImageInput.click();
            }
        });
    }

    function setupAttachmentDragDrop() {
        if (!elements.attachmentUploadArea) return;

        elements.attachmentUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.attachmentUploadArea.classList.add('drag-over');
        });

        elements.attachmentUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            elements.attachmentUploadArea.classList.remove('drag-over');
        });

        elements.attachmentUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.attachmentUploadArea.classList.remove('drag-over');

            const file = e.dataTransfer.files[0];
            if (file && elements.attachmentInput) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                elements.attachmentInput.files = dataTransfer.files;
                handleAttachmentPreview(file);
            }
        });

        elements.attachmentUploadArea.addEventListener('click', (e) => {
            if (!elements.attachmentUploadArea.classList.contains('has-attachment') && !e.target.closest('.attachment-actions')) {
                if (elements.attachmentInput) elements.attachmentInput.click();
            }
        });
    }

    // Form validation
    function validateForm(isDraft = false) {
        const title = elements.titleInput?.value.trim() || '';
        const content = getPlainTextContent();
        const category = elements.categorySelect?.value || '';

        const errors = [];

        if (!isDraft) {
            if (!title) errors.push('Title is required');
            if (!content) errors.push('Content is required');
            if (!category) errors.push('Category is required');
        }

        if (title && title.length > 255) errors.push('Title must be less than 255 characters');

        if (elements.coverImageInput?.files.length > 0) {
            errors.push(...validateImage(elements.coverImageInput.files[0]));
        }

        if (elements.attachmentInput?.files.length > 0) {
            errors.push(...validateAttachment(elements.attachmentInput.files[0]));
        }

        return errors;
    }

    function validateImage(file) {
        const errors = [];

        if (!allowedImageTypes.includes(file.type)) {
            errors.push('Please select a valid image file (JPEG, PNG, or WebP)');
        }

        if (file.size > maxImageSize) {
            errors.push(`Image size must be less than ${formatFileSize(maxImageSize)}`);
        }

        if (file.name.length > 100) {
            errors.push('Image file name must be less than 100 characters');
        }

        return errors;
    }

    function validateAttachment(file) {
        const errors = [];

        if (!allowedAttachmentTypes.includes(file.type)) {
            errors.push('Unsupported file type');
        }

        if (file.size > maxAttachmentSize) {
            errors.push(`File size must be less than ${formatFileSize(maxAttachmentSize)}`);
        }

        if (file.name.length > 100) {
            errors.push('Attachment file name must be less than 100 characters');
        }

        return errors;
    }

    // Save and publish
    async function saveDraft() {
        const errors = validateForm(true); 
        if (errors.length > 0) {
            alert(`Please fix the following errors:\n\n${errors.join('\n')}`);
            return;
        }

        // Ensure content is updated before submission
        updateHiddenContent();

        const postForm = document.getElementById('postForm');
        if (!postForm) {
            showError('Form not found');
            return;
        }

        const formData = new FormData(postForm);
        formData.append('is_draft', 'true');

        if (elements.attachmentInput?.files.length > 0) {
            formData.append('attachment', elements.attachmentInput.files[0]);
        }

        try {
            this.disabled = true;
            this.textContent = 'Saving...';

            const { response, data } = await postFormData(endpoints.create_draft, formData);
            console.log(data);
            if (response.ok) {
                showSuccess(data.message || 'Draft saved successfully!');
                window.location.href = '/admin-panel'
            } else {
                const errorMessage = data.error || (data.details
                    ? Object.entries(data.details).map(([field, errors]) => `${field}: ${errors.join(', ')}`).join('\n')
                    : 'Failed to save draft');
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

    async function publishPost(e) {
        e.preventDefault();
        const errors = validateForm(false);
        if (errors.length > 0) {
            alert(`Please fix the following errors:\n\n${errors.join('\n')}`);
            return;
        }

        // Ensure content is updated before submission
        updateHiddenContent();

        const postForm = document.getElementById('postForm');
        if (!postForm) {
            showError('Form not found');
            return;
        }

        const formData = new FormData(postForm);
        formData.append('is_draft', 'false');

        if (elements.attachmentInput?.files.length > 0) {
            formData.append('attachment', elements.attachmentInput.files[0]);
        }

        try {
            this.disabled = true;
            this.innerHTML = '<i class="spinner-border spinner-border-sm me-1"></i>Publishing...';

            const { response, data } = await postFormData(endpoints.create_post, formData);

            if (response.ok) {
                showSuccess(data.message || 'Post published successfully!');
                window.location.href = '/admin-panel'
            } else {
                const errorMessage = data.error || (data.details
                    ? Object.entries(data.details).map(([field, errors]) => `${field}: ${errors.join(', ')}`).join('\n')
                    : 'Failed to publish post');
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
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }

    function showMessage(element, message, isError = false) {
        if (!element) return;

        const imageError = document.getElementById('imageError');
        const imageSuccess = document.getElementById('imageSuccess');

        element.textContent = message;
        element.style.display = 'block';

        const otherElement = isError ? imageSuccess : imageError;
        if (otherElement) otherElement.style.display = 'none';

        setTimeout(() => element.style.display = 'none', isError ? 5000 : 3000);
    }

    function showError(message) {
        const errorElement = document.getElementById('imageError');
        showMessage(errorElement, message, true);
    }

    function showSuccess(message) {
        const successElement = document.getElementById('imageSuccess');
        showMessage(successElement, message, false);
    }

    function showAttachmentError(message) {
        const element = document.getElementById('attachmentError');
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            const successElement = document.getElementById('attachmentSuccess');
            if (successElement) successElement.style.display = 'none';
            setTimeout(() => element.style.display = 'none', 5000);
        }
    }

    function showAttachmentSuccess(message) {
        const element = document.getElementById('attachmentSuccess');
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            const errorElement = document.getElementById('attachmentError');
            if (errorElement) errorElement.style.display = 'none';
            setTimeout(() => element.style.display = 'none', 3000);
        }
    }

    // Auto-save functionality (optional)
    let autoSaveInterval;
    function startAutoSave() {
        clearInterval(autoSaveInterval);
        autoSaveInterval = setInterval(() => {
            if (quill && getPlainTextContent().length > 50) {
                // Auto-save only if there's substantial content
                saveDraft();
            }
        }, 60000); // Auto-save every 60 seconds
    }

    // Start initialization
    initializeForm();
    
    // Optional: Start auto-save
    // startAutoSave();
});