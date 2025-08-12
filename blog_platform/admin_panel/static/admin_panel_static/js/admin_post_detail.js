import { post, get } from "/static/core_static/js/api.js";

// Get postId from the template
const postId = window.postId ; 

// Like functionality
async function fetchLikeStatus() {
    try {
        const {response, data} = await get(`/api/posts/${postId}/like/`);
        
        if (response.ok) {
            const likeData = data.data || data;
            updateLikeUI(likeData.is_liked, likeData.total_likes);
        } else {
            console.error('Failed to fetch like status:', data?.message || 'Unknown error');
        }
    } catch (err) {
        console.error('Error fetching like status', err);
    }
}

function updateLikeUI(isLiked, totalLikes) {
    const likeBtn = document.querySelector('.like-button');
    const likeCount = document.getElementById('like-count');
    const heartIcon = likeBtn?.querySelector('i');

    if (likeCount) {
        const previousCount = parseInt(likeCount.textContent) || 0;
        const newCount = parseInt(totalLikes) || 0;
        
        // Update the count
        likeCount.textContent = newCount;
        
        // Add more pronounced animation when count changes
        if (previousCount !== newCount) {
            likeCount.style.transition = 'all 0.3s ease';
            likeCount.style.transform = 'scale(1.3)';
            likeCount.style.color = isLiked ? '#27ae60' : '#e74c3c';
            
            setTimeout(() => {
                likeCount.style.transform = 'scale(1)';
                likeCount.style.color = '#e74c3c';
            }, 300);
        }
    }
    
    if (likeBtn) {
        const spanElement = likeBtn.querySelector('span');
        likeBtn.disabled = false;
        
        if (isLiked) {
            likeBtn.classList.add('liked');
            if (spanElement) spanElement.textContent = 'Liked';
            if (heartIcon) {
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
            }
        } else {
            likeBtn.classList.remove('liked');
            if (spanElement) spanElement.textContent = 'Like';
            if (heartIcon) {
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
            }
        }
    }
}

async function toggleLike() {
    const likeBtn = document.querySelector('.like-button');
    
    if (likeBtn) {
        likeBtn.disabled = true;
        likeBtn.classList.add('loading');
    }
    
    try {
        const {response, data} = await post(`/api/posts/${postId}/like/`);

        if (response.ok) {
            // Check different possible response structures
            const likeData = data.data || data;
            const isLiked = likeData.is_liked;
            const totalLikes = likeData.total_likes;
            
            // Immediately update UI with the response data
            updateLikeUI(isLiked, totalLikes);
            
            // Add a small delay then fetch fresh data to ensure accuracy
            setTimeout(async () => {
                try {
                    const {response: freshResponse, data: freshData} = await get(`/api/posts/${postId}/like/`);
                    if (freshResponse.ok) {
                        const freshLikeData = freshData.data || freshData;
                        // Only update if the counts are different (to avoid unnecessary animations)
                        if (freshLikeData.total_likes !== totalLikes || freshLikeData.is_liked !== isLiked) {
                            updateLikeUI(freshLikeData.is_liked, freshLikeData.total_likes);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching fresh like status:', err);
                }
            }, 300);
            
        } else {
            console.error('Failed to toggle like:', data?.message || 'Unknown error');
        }
    } catch (err) {
        console.error('Error toggling like:', err);
    } finally {
        if (likeBtn) {
            likeBtn.disabled = false;
            likeBtn.classList.remove('loading');
        }
    }
}

// Comments functionality
async function fetchComments() {
    const loadingElement = document.getElementById('comments-loading');
    const commentsListElement = document.getElementById('comments-list');
    const noCommentsElement = document.getElementById('no-comments');
    const commentCountElement = document.getElementById('comment-count');

    try {
        if (loadingElement) loadingElement.style.display = 'flex';
        if (commentsListElement) commentsListElement.innerHTML = '';
        if (noCommentsElement) noCommentsElement.style.display = 'none';

        const {response, data} = await get(`/api/posts/comments/?post=${postId}`);

        if (response.ok) {
            // Handle both possible response structures
            const comments = data || [];
            
            if (commentCountElement) {
                // If using pagination, use the count from response, otherwise use array length
                const totalCount = comments.length;
                commentCountElement.textContent = totalCount;
            }

            if (comments.length === 0) {
                if (noCommentsElement) noCommentsElement.style.display = 'block';
            } else {
                renderComments(comments);
            }
        } else {
            console.error('Failed to fetch comments:', data?.message || 'Unknown error');
            // Show error state
            if (commentsListElement) {
                commentsListElement.innerHTML = '<div class="error-message">Failed to load comments. Please try again.</div>';
            }
        }
    } catch (err) {
        console.error('Error fetching comments:', err);
        // Show error state
        if (commentsListElement) {
            commentsListElement.innerHTML = '<div class="error-message">Error loading comments. Please check your connection.</div>';
        }
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

function renderComments(comments) {
    const commentsListElement = document.getElementById('comments-list');
    if (!commentsListElement) return;

    const commentsHTML = comments.map(comment => {

        const authorName = comment.user;
        const initials = getInitials(authorName);
        const commentDate = formatDate(comment.created_at);
        const isOwn = comment.user?.id === window.currentUserId; 
        const isPending = !comment.is_approved;
        
        return `
            <div class="comment-item ${isOwn ? 'own-comment' : ''} ${isPending ? 'pending' : ''}" data-comment-id="${comment.id}">
                <div class="comment-author">
                    <div class="author-avatar">${initials}</div>
                    <div class="author-info">
                        <div class="author-name">
                            ${authorName}
                            ${isPending ? '<span class="pending-badge">Pending</span>' : ''}
                        </div>
                        <div class="comment-date">${commentDate}</div>
                    </div>
                </div>
                <div class="comment-text">${escapeHtml(comment.content)}</div>
            </div>
        `;
    }).join('');

    commentsListElement.innerHTML = commentsHTML;
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function addComment() {
    const commentText = document.getElementById('comment-text');
    const submitButton = document.querySelector('.comment-submit');
    
    if (!commentText || commentText.value.trim() === '') {
        return;
    }

    const originalButtonText = submitButton?.innerHTML;
    
    try {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
        }

        const {response, data} = await post('/api/posts/comments/', {
            post: postId,
            content: commentText.value.trim()
        });

        if (response.ok) {
            commentText.value = '';
            
            // Refresh comments to show the new one
            await fetchComments();
            
            // Reset form state
            resetCommentForm();
        } else {
            console.error('Failed to add comment:', data?.message || 'Unknown error');
        }
    } catch (err) {
        console.error('Error adding comment:', err);
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }
}

function resetCommentForm() {
    const commentForm = document.querySelector('.comment-form');
    const commentText = document.getElementById('comment-text');
    
    if (commentForm) {
        commentForm.classList.remove('active');
    }
    
    if (commentText) {
        commentText.value = '';
        commentText.rows = 4;
    }
}

function initializeCommentForm() {
    const commentText = document.getElementById('comment-text');
    const commentForm = document.querySelector('.comment-form');
    const cancelButton = document.querySelector('.comment-cancel');

    if (commentText) {
        // Expand form when focused
        commentText.addEventListener('focus', () => {
            if (commentForm) {
                commentForm.classList.add('active');
            }
            commentText.rows = 6;
        });

        // Auto-resize textarea
        commentText.addEventListener('input', () => {
            commentText.style.height = 'auto';
            commentText.style.height = commentText.scrollHeight + 'px';
        });

        // Handle Ctrl+Enter to submit
        commentText.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                addComment();
            }
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', resetCommentForm);
    }
}


// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize like functionality
    fetchLikeStatus();
    
    // Initialize comments
    fetchComments();
    initializeCommentForm();
    
    // Add event listeners
    const likeBtn = document.querySelector('.like-button');
    if (likeBtn) {
        likeBtn.addEventListener('click', toggleLike);
    }

    const commentSubmitBtn = document.querySelector('.comment-submit');
    if (commentSubmitBtn) {
        commentSubmitBtn.addEventListener('click', addComment);
    }
});

// Export functions for global access if needed
window.toggleLike = toggleLike;
window.addComment = addComment;
window.fetchComments = fetchComments;