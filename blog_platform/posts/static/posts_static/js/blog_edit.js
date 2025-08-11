import { postFormData, patchFormData, get, patch } from "/static/core_static/js/api.js";
import { endpoints } from "/static/core_static/js/apiEndpoints.js";

document.addEventListener('DOMContentLoaded', () => {
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
        editBtn: document.getElementById('editBtn'),
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

    const postId = document.getElementById('postForm')?.dataset.postId;

    const requiredElements = {
        titleInput: '.title-input',
        categorySelect: '.category-select',
        editBtn: '#editBtn',
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
                elements.editorContainer?.classList.add('focused');
            } else {
                elements.editorContainer?.classList.remove('focused');
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
                        updatePost();
                        break;
                    case 'Enter':
                        if (e.shiftKey) {
                            e.preventDefault();
                            updatePost();
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

    function setEditorContent(htmlContent) {
        if (quill && htmlContent) {
            quill.root.innerHTML = htmlContent;
            updateWordCount();
            updateHiddenContent();
        }
    }

    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedAttachmentTypes = [
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'application/zip', 'application/x-rar-compressed',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'audio/mpeg', 'audio/wav', 'audio/mp3'
    ];
    const maxImageSize = 5 * 1024 * 1024;
    const maxAttachmentSize = 10 * 1024 * 1024;

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

    let originalValues = {
        title: '',
        content: '',
        category: '',
        coverImage: null,
        attachment: null
    };

    function initializeForm() {
        autoResize(elements.titleInput);
        updateCharCount();

        elements.titleInput?.addEventListener('input', () => {
            autoResize(elements.titleInput);
            updateCharCount();
        });

        elements.coverImageInput?.addEventListener('change', handleImageChange);
        elements.removeImageBtn?.addEventListener('click', removeImage);
        elements.attachmentInput?.addEventListener('change', handleAttachmentChange);
        elements.removeAttachmentBtn?.addEventListener('click', removeAttachment);
        elements.editBtn?.addEventListener('click', updatePost);

        setupImageDragDrop();
        setupAttachmentDragDrop();

        const postForm = document.getElementById('postForm');
        postForm?.addEventListener('submit', e => e.preventDefault());

        // Initialize the rich text editor
        initializeEditor();

        if (postId) {
            fetchPostData(postId);
        } else {
            showError('No post ID found for editing');
            elements.editBtn.disabled = true;
        }

        fetchCategories();
    }

    async function fetchPostData(postId) {
        try {
            const { response, data } = await get(`/api/posts/post/${postId}/`);
            if (response.ok && data) {
                populateForm(data);
                originalValues = {
                    title: data.title?.trim() || '',
                    content: data.content?.trim() || '',
                    category: String(data.category?.id || ''),
                    coverImage: data.cover_image || null,
                    attachment: data.attachment || null
                };
            } else {
                showError('Failed to load post data');
                elements.editBtn.disabled = true;
            }
        } catch (error) {
            console.error('Error fetching post data:', error);
            showError('Network error while loading post data');
            elements.editBtn.disabled = true;
        }
    }

    function populateForm(postData) {
        if (!postData) return;

        if (elements.titleInput && postData.title) {
            elements.titleInput.value = postData.title;
            autoResize(elements.titleInput);
            updateCharCount();
        }

        // Set editor content instead of textarea
        if (postData.content && quill) {
            setEditorContent(postData.content);
        }

        if (elements.categorySelect && postData.category?.id) {
            const setCategoryValue = () => {
                const option = Array.from(elements.categorySelect.options).find(opt => opt.value == postData.category.id);
                if (option) {
                    elements.categorySelect.value = postData.category.id;
                } else {
                    setTimeout(setCategoryValue, 500);
                }
            };

            if (elements.categorySelect.options.length > 1) {
                setCategoryValue();
            } else {
                const interval = setInterval(() => {
                    if (elements.categorySelect.options.length > 1) {
                        clearInterval(interval);
                        setCategoryValue();
                    }
                }, 100);
                setTimeout(() => clearInterval(interval), 2000);
            }
        }

        if (postData.cover_image && elements.imagePreview) {
            updateImageUI(postData.cover_image, {
                name: postData.cover_image.split('/').pop(),
                size: postData.cover_image_size || 0,
                dimensions: postData.cover_image_dimensions || ''
            });
        }

        if (postData.attachment && elements.attachmentPreview) {
            const fileName = postData.attachment.split('/').pop();
            if (fileName) {
                updateAttachmentUI({
                    name: fileName,
                    type: getFileTypeFromExtension(postData.attachment),
                    size: postData.attachment_size || 0
                });
            }
        }
    }

    function getFileTypeFromExtension(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const extensionToMime = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            'zip': 'application/zip',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mp4': 'video/mp4',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav'
        };
        return extensionToMime[extension] || 'application/octet-stream';
    }

    async function fetchCategories() {
        if (!elements.categorySelect) return;

        try {
            const { response, data } = await get(endpoints.category_list);
            if (response.ok && Array.isArray(data.data || data.results || data)) {
                const categories = data.data || data.results || data;
                elements.categorySelect.innerHTML = '<option value="">Choose a category...</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    elements.categorySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
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

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (file) handleImagePreview(file);
    }

    function handleImagePreview(file) {
        const errors = validateImage(file);
        if (errors.length > 0) {
            showError(errors[0]);
            elements.coverImageInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                updateImageUI(e.target.result, {
                    name: file.name,
                    size: file.size,
                    dimensions: `${img.width} × ${img.height}px`
                });
                showSuccess('Image uploaded successfully!');
                if (img.width < 800 || img.height < 400) {
                    showError('For best results, use an image at least 800×400px');
                }
            };
            img.onerror = () => showError('Failed to load image');
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function updateImageUI(src, fileInfo) {
        if (elements.imagePreview) {
            elements.imagePreview.src = src;
            elements.imagePreview.style.setProperty('display', 'block', 'important');
            elements.imagePreview.onerror = () => {
                elements.imagePreview.style.setProperty('display', 'none', 'important');
            };
        }

        elements.imageUploadSection?.classList.add('has-image');
        elements.imageUploadContent?.style.setProperty('display', 'none', 'important');
        elements.imageInfo?.style.setProperty('display', 'block', 'important');
        elements.imageActions?.style.setProperty('display', 'flex', 'important');

        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const imageDimensions = document.getElementById('imageDimensions');
        if (fileName) fileName.textContent = fileInfo.name;
        if (fileSize) fileSize.textContent = formatFileSize(fileInfo.size);
        if (imageDimensions) imageDimensions.textContent = fileInfo.dimensions;
    }

    function removeImage() {
        if (!confirm('Are you sure you want to remove this image?')) return;

        elements.coverImageInput.value = '';
        elements.imagePreview.src = '';
        elements.imagePreview.style.setProperty('display', 'none', 'important');
        elements.imageUploadSection?.classList.remove('has-image');
        elements.imageUploadContent?.style.setProperty('display', 'block', 'important');
        elements.imageInfo?.style.setProperty('display', 'none', 'important');
        elements.imageActions?.style.setProperty('display', 'none', 'important');
        showSuccess('Image removed successfully');
    }

    function handleAttachmentChange(e) {
        const file = e.target.files[0];
        if (file) handleAttachmentPreview(file);
    }

    function handleAttachmentPreview(file) {
        const errors = validateAttachment(file);
        if (errors.length > 0) {
            showAttachmentError(errors[0]);
            elements.attachmentInput.value = '';
            return;
        }

        updateAttachmentUI({
            name: file.name,
            type: file.type,
            size: file.size
        });
        showAttachmentSuccess('Attachment uploaded successfully!');
    }

    function updateAttachmentUI(file) {
        const fileTypeInfo = fileTypeConfig[file.type] || { icon: 'bi-file-earmark', class: 'other', name: 'File' };

        elements.attachmentUploadArea?.classList.add('has-attachment');
        elements.attachmentPreview?.style.setProperty('display', 'block', 'important');
        elements.attachmentInfo?.style.setProperty('display', 'block', 'important');
        elements.attachmentActions?.style.setProperty('display', 'flex', 'important');
        elements.attachmentUploadPrompt?.style.setProperty('display', 'none', 'important');

        const attachmentIcon = document.getElementById('attachmentIcon');
        const attachmentName = document.getElementById('attachmentName');
        const attachmentSize = document.getElementById('attachmentSize');
        const attachmentType = document.getElementById('attachmentType');

        if (attachmentIcon) {
            attachmentIcon.className = `${fileTypeInfo.icon} ${fileTypeInfo.class}`;
        }

        if (attachmentName) {
            attachmentName.textContent = file.name || 'Unknown File';
            attachmentName.style.setProperty('display', 'block', 'important');
        }

        if (attachmentSize) {
            attachmentSize.textContent = formatFileSize(file.size);
        }

        if (attachmentType) {
            attachmentType.textContent = fileTypeInfo.name;
        }

        setTimeout(() => {
            if (elements.attachmentInfo) {
                elements.attachmentInfo.style.setProperty('display', 'block', 'important');
            }
            if (attachmentName) {
                attachmentName.style.setProperty('display', 'block', 'important');
            }
        }, 0);
    }

    function removeAttachment() {
        if (!confirm('Are you sure you want to remove this attachment?')) return;

        elements.attachmentInput.value = '';
        elements.attachmentUploadArea?.classList.remove('has-attachment');
        elements.attachmentPreview?.style.setProperty('display', 'none', 'important');
        elements.attachmentInfo?.style.setProperty('display', 'none', 'important');
        elements.attachmentActions?.style.setProperty('display', 'none', 'important');
        elements.attachmentUploadPrompt?.style.setProperty('display', 'block', 'important');

        const attachmentName = document.getElementById('attachmentName');
        if (attachmentName) attachmentName.textContent = '';

        showAttachmentSuccess('Attachment removed successfully');
    }

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
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                elements.coverImageInput.files = dataTransfer.files;
                handleImagePreview(file);
            } else {
                showError('Please drop an image file');
            }
        });

        elements.imageUploadSection.addEventListener('click', (e) => {
            if (!elements.imageUploadSection.classList.contains('has-image') && !e.target.closest('.image-actions')) {
                elements.coverImageInput?.click();
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
            if (file) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                elements.attachmentInput.files = dataTransfer.files;
                handleAttachmentPreview(file);
            }
        });

        elements.attachmentUploadArea.addEventListener('click', (e) => {
            if (!elements.attachmentUploadArea.classList.contains('has-attachment') && !e.target.closest('.attachment-actions')) {
                elements.attachmentInput?.click();
            }
        });
    }

    function hasDataChanged() {
        const currentTitle = elements.titleInput?.value.trim() || '';
        const currentContent = getHtmlContent();
        const currentCategory = elements.categorySelect?.value || '';

        const titleChanged = currentTitle !== originalValues.title;
        const contentChanged = currentContent !== originalValues.content;
        const categoryChanged = String(currentCategory) !== String(originalValues.category);
        const imageChanged = elements.coverImageInput?.files.length > 0 ||
            (originalValues.coverImage && (!elements.imagePreview?.src || elements.imagePreview.style.display === 'none'));
        const attachmentChanged = elements.attachmentInput?.files.length > 0 ||
            (originalValues.attachment && !elements.attachmentUploadArea?.classList.contains('has-attachment'));

        return titleChanged || contentChanged || categoryChanged || imageChanged || attachmentChanged;
    }

    function validateForm() {
        const errors = [];
        const title = elements.titleInput?.value.trim() || '';
        const content = getPlainTextContent();
        const category = elements.categorySelect?.value || '';

        if (!title) errors.push('Title is required');
        if (title.length > 255) errors.push('Title must be less than 255 characters');
        if (!content) errors.push('Content is required');
        if (!category) errors.push('Category is required');

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

    async function updatePost() {
        if (!hasDataChanged()) {
            showError('No changes made to the post');
            return;
        }

        const errors = validateForm();
        if (errors.length > 0) {
            alert(`Please fix the following errors:\n\n${errors.join('\n')}`);
            return;
        }

        if (!postId) {
            showError('No post ID found for editing');
            return;
        }

        // Ensure content is updated before submission
        updateHiddenContent();

        const formData = new FormData();
        let hasChanges = false;

        const currentTitle = elements.titleInput.value.trim();
        const currentContent = getHtmlContent();
        const currentCategory = elements.categorySelect.value;

        if (currentTitle !== originalValues.title) {
            formData.append('title', currentTitle);
            hasChanges = true;
        }

        if (currentContent !== originalValues.content) {
            formData.append('content', currentContent);
            hasChanges = true;
        }

        if (currentCategory !== originalValues.category) {
            formData.append('category_id', currentCategory);
            hasChanges = true;
        }

        if (elements.coverImageInput?.files.length > 0) {
            formData.append('cover_image', elements.coverImageInput.files[0]);
            hasChanges = true;
        } else if (originalValues.coverImage && (!elements.imagePreview?.src || elements.imagePreview.style.display === 'none')) {
            formData.append('cover_image', '');
            hasChanges = true;
        }

        if (elements.attachmentInput?.files.length > 0) {
            formData.append('attachment', elements.attachmentInput.files[0]);
            hasChanges = true;
        } else if (originalValues.attachment && !elements.attachmentUploadArea?.classList.contains('has-attachment')) {
            formData.append('attachment', '');
            hasChanges = true;
        }

        if (!hasChanges) {
            showError('No changes detected to save');
            return;
        }

        try {
            elements.editBtn.disabled = true;
            elements.editBtn.innerHTML = '<i class="spinner-border spinner-border-sm me-1"></i>Updating...';

            const { response, data } = await patchFormData(endpoints.edit_post(postId), formData);
            console.log(data)
            if (response.ok) {
                showSuccess(data.message || 'Post updated successfully!');
                originalValues = {
                    title: currentTitle,
                    content: currentContent,
                    category: currentCategory,
                    coverImage: elements.imagePreview?.src && elements.imagePreview.style.display !== 'none' ? elements.imagePreview.src : null,
                    attachment: elements.attachmentUploadArea?.classList.contains('has-attachment') ? 'has-attachment' : null
                };

                window.location.href = '/admin-panel/post-list/'

            } else {
                let errorMessage = 'Failed to update post';
                if (data.error) errorMessage = data.error;
                else if (data.message) errorMessage = data.message;
                else if (data.details) {
                    errorMessage = typeof data.details === 'object'
                        ? Object.entries(data.details).map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`).join('\n')
                        : data.details;
                }
                showError(errorMessage);
            }
        } catch (error) {
            console.error('Network error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            elements.editBtn.disabled = false;
            elements.editBtn.innerHTML = '<i class="bi bi-pencil-square me-1"></i>Update Post';
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }

    function showMessage(element, message, isError = false) {
        if (!element) return;
        element.textContent = message;
        element.style.setProperty('display', 'block', 'important');
        const otherElement = isError ? document.getElementById('imageSuccess') : document.getElementById('imageError');
        if (otherElement) otherElement.style.setProperty('display', 'none', 'important');
        setTimeout(() => element.style.setProperty('display', 'none', 'important'), isError ? 5000 : 3000);
    }

    function showError(message) {
        showMessage(document.getElementById('imageError'), message, true);
    }

    function showSuccess(message) {
        showMessage(document.getElementById('imageSuccess'), message, false);
    }

    function showAttachmentError(message) {
        const element = document.getElementById('attachmentError');
        if (element) {
            element.textContent = message;
            element.style.setProperty('display', 'block', 'important');
            document.getElementById('attachmentSuccess')?.style.setProperty('display', 'none', 'important');
            setTimeout(() => element.style.setProperty('display', 'none', 'important'), 5000);
        }
    }

    function showAttachmentSuccess(message) {
        const element = document.getElementById('attachmentSuccess');
        if (element) {
            element.textContent = message;
            element.style.setProperty('display', 'block', 'important');
            document.getElementById('attachmentError')?.style.setProperty('display', 'none', 'important');
            setTimeout(() => element.style.setProperty('display', 'none', 'important'), 3000);
        }
    }

    initializeForm();
});