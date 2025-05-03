console.log("E-Commerce Website Loaded");

document.addEventListener('DOMContentLoaded', function() {
    // Hero section animations
    const animateHero = () => {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroCta = document.querySelector('.hero-cta');
        
        if (heroTitle) {
            heroTitle.style.opacity = '0';
            heroTitle.style.animation = 'fadeIn 0.8s ease-out forwards';
            heroTitle.style.animationDelay = '0.2s';
        }
        
        if (heroSubtitle) {
            heroSubtitle.style.opacity = '0';
            heroSubtitle.style.animation = 'fadeIn 0.8s ease-out forwards';
            heroSubtitle.style.animationDelay = '0.5s';
        }
        
        if (heroCta) {
            heroCta.style.opacity = '0';
            heroCta.style.animation = 'fadeIn 0.8s ease-out forwards';
            heroCta.style.animationDelay = '0.8s';
        }
    };
    
    // Run hero animations
    animateHero();
    // Elements
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mainNav = document.querySelector('.main-nav');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('.search-input');
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.querySelector('.cart-count');
    const header = document.querySelector('header');
    
    // Mobile menu toggle functionality
    if (hamburgerMenu && mainNav) {
        // Function to toggle menu
        const toggleMenu = function(e) {
            if (e) {
                e.stopPropagation(); // Prevent event bubbling
            }
            
            // Toggle navigation
            mainNav.classList.toggle('active');
            
            // Add animation to hamburger icon
            hamburgerMenu.classList.toggle('active');
            
            // Close search on mobile when menu is opened
            if (window.innerWidth <= 480 && searchContainer) {
                searchContainer.classList.remove('active');
            }
            
            // Add accessibility attributes
            const expanded = mainNav.classList.contains('active');
            hamburgerMenu.setAttribute('aria-expanded', expanded);
            
            // Add body class to prevent scrolling when menu is open
            if (expanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        };
        
        // Click event
        hamburgerMenu.addEventListener('click', toggleMenu);
        
        // Keyboard support
        hamburgerMenu.addEventListener('keydown', function(e) {
            // Toggle on Enter or Space
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
        
        // Initialize ARIA attributes
        hamburgerMenu.setAttribute('aria-controls', 'main-nav');
        hamburgerMenu.setAttribute('aria-expanded', 'false');
        hamburgerMenu.setAttribute('aria-label', 'Toggle navigation menu');
    }
    
    // Search functionality for mobile
    if (searchInput) {
        // Focus effect
        searchInput.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
        
        // Handle search form submission
        const searchForm = searchInput.closest('form') || searchInput.parentElement;
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                if (!searchInput.value.trim()) {
                    e.preventDefault();
                    searchInput.focus();
                    // Add shake animation to indicate error
                    searchInput.classList.add('shake');
                    setTimeout(() => {
                        searchInput.classList.remove('shake');
                    }, 500);
                }
            });
        }
        
        // Toggle search on mobile
        const createSearchToggle = function() {
            if (window.innerWidth <= 480 && !document.querySelector('.search-toggle')) {
                const searchToggle = document.createElement('div');
                searchToggle.className = 'search-toggle';
                searchToggle.innerHTML = '<i class="fa fa-search"></i>';
                searchToggle.setAttribute('aria-label', 'Toggle search');
                
                // Insert before cart
                if (cartIcon && cartIcon.parentElement) {
                    cartIcon.parentElement.parentElement.insertBefore(searchToggle, cartIcon.parentElement);
                }
                
                searchToggle.addEventListener('click', function(e) {
                    e.stopPropagation();
                    searchContainer.classList.toggle('active');
                    
                    if (searchContainer.classList.contains('active')) {
                        setTimeout(() => searchInput.focus(), 100);
                        
                        // Close menu if open
                        if (mainNav.classList.contains('active')) {
                            mainNav.classList.remove('active');
                            hamburgerMenu.classList.remove('active');
                            hamburgerMenu.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
                
                // Close search when clicking outside
                document.addEventListener('click', function(event) {
                    if (searchContainer.classList.contains('active') && 
                        !event.target.closest('.search-container') && 
                        !event.target.closest('.search-toggle')) {
                        searchContainer.classList.remove('active');
                    }
                });
            }
        };
        
        // Create search toggle on load
        createSearchToggle();
        
        // Re-check on resize
        window.addEventListener('resize', function() {
            createSearchToggle();
        });
    }
    
    // Header scroll effect
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
            
            // Hide header on scroll down, show on scroll up
            if (scrollTop > lastScrollTop) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        } else {
            header.classList.remove('scrolled');
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Cart functionality
    function updateCartCount(count) {
        if (cartCount) {
            cartCount.textContent = count;
            
            // Add animation effect
            cartCount.classList.add('pulse');
            setTimeout(() => {
                cartCount.classList.remove('pulse');
            }, 300);
        }
    }
    
    // Set initial cart count from localStorage
    const savedCartCount = localStorage.getItem('cartCount') || 0;
    updateCartCount(savedCartCount);
    
    // Add to cart functionality (for demonstration)
    window.addToCart = function() {
        const currentCount = parseInt(cartCount.textContent || 0);
        const newCount = currentCount + 1;
        updateCartCount(newCount);
        localStorage.setItem('cartCount', newCount);
        
        // Show notification
        showNotification('Item added to cart!');
    };
    
    // Notification function
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mainNav.classList.contains('active') && 
            !event.target.closest('.main-nav') && 
            !event.target.closest('.hamburger-menu')) {
            
            // Close the menu
            mainNav.classList.remove('active');
            
            // Update hamburger icon state
            if (hamburgerMenu) {
                hamburgerMenu.classList.remove('active');
                hamburgerMenu.setAttribute('aria-expanded', 'false');
            }
            
            // Restore body scrolling
            document.body.style.overflow = '';
        }
    });
    
    // Close menu with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            
            if (hamburgerMenu) {
                hamburgerMenu.classList.remove('active');
                hamburgerMenu.setAttribute('aria-expanded', 'false');
            }
            
            document.body.style.overflow = '';
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mainNav.classList.contains('active')) {
            // Reset mobile menu state when resizing to desktop
            mainNav.classList.remove('active');
            
            if (hamburgerMenu) {
                hamburgerMenu.classList.remove('active');
                hamburgerMenu.setAttribute('aria-expanded', 'false');
            }
            
            document.body.style.overflow = '';
        }
    });
});
