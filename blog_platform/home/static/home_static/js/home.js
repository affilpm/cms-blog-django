    document.addEventListener('DOMContentLoaded', function() {
        // Assign random background gradients to posts without images
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            'linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)',
            'linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%)',
            'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
        ];
        document.querySelectorAll('.random-bg').forEach(element => {
            const postId = element.getAttribute('data-post-id');
            const colorIndex = parseInt(postId, 10) % colors.length;
            element.style.background = colors[colorIndex];
        });        
    });

