const navbarCollapse = document.getElementById('navbarNav');
const navbarToggler = document.querySelector('.navbar-toggler');
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

// Auto-close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || 
                            new bootstrap.Collapse(navbarCollapse, { toggle: false });
            bsCollapse.hide();
        }
    });
});

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const isClickInsideNav = navbarCollapse.contains(event.target);
    const isToggler = navbarToggler.contains(event.target);
    const isMenuOpen = navbarCollapse.classList.contains('show');

    if (!isClickInsideNav && !isToggler && isMenuOpen && window.innerWidth < 992) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || 
                        new bootstrap.Collapse(navbarCollapse, { toggle: false });
        bsCollapse.hide();
    }
});

// Close menu on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || 
                        new bootstrap.Collapse(navbarCollapse, { toggle: false });
        bsCollapse.hide();
        navbarToggler.focus(); // Return focus to toggler for accessibility
    }
});