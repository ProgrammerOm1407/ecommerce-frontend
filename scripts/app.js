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
    
    // Cart functionality - make it globally available
    window.updateCartCount = function(count) {
        const cartCount = document.querySelector('.cart-count');
        if (!cartCount) return;
        
        if (typeof count === 'number') {
            // If a specific count is provided, use it
            cartCount.textContent = count;
        } else {
            // Otherwise, calculate from cart in localStorage
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
        
        // Add animation effect
        cartCount.classList.add('pulse');
        setTimeout(() => {
            cartCount.classList.remove('pulse');
        }, 300);
    };
    
    // Set initial cart count from localStorage
    window.updateCartCount();
    
    // Make sure cart count is updated when localStorage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            window.updateCartCount();
        }
    });
    
    // Enhanced add to cart functionality
    window.addToCart = function(productId, quantity = 1) {
        console.log('Adding product to cart:', productId);
        
        // Get current cart from localStorage or initialize empty array
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // If we have a product ID, fetch the product details
        if (productId) {
            fetch(`https://fakestoreapi.com/products/${productId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Product not found');
                    }
                    return response.json();
                })
                .then(product => {
                    // Check if product is already in cart
                    const existingProductIndex = cart.findIndex(item => item.id === product.id);
                    
                    if (existingProductIndex >= 0) {
                        // Increment quantity if product already in cart
                        cart[existingProductIndex].quantity += quantity;
                        
                        // Show notification
                        if (typeof showCartNotification === 'function') {
                            showCartNotification(
                                'Cart Updated',
                                `Added ${quantity} more to your cart`,
                                '',
                                `Total in cart: ${cart[existingProductIndex].quantity}`,
                                product.image
                            );
                        } else {
                            showNotification(`Added ${quantity} more ${product.title} to cart!`);
                        }
                    } else {
                        // Add new product to cart with enhanced details
                        cart.push({
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            image: product.image,
                            quantity: quantity,
                            category: product.category,
                            addedAt: new Date().toISOString()
                        });
                        
                        // Show notification
                        if (typeof showCartNotification === 'function') {
                            showCartNotification(
                                'Added to Cart',
                                `${quantity} × ${product.title.length > 25 ? product.title.substring(0, 25) + '...' : product.title}`,
                                '',
                                `$${(product.price * quantity).toFixed(2)}`,
                                product.image
                            );
                        } else {
                            showNotification(`Added ${product.title} to cart!`);
                        }
                    }
                    
                    // Save updated cart to localStorage
                    localStorage.setItem('cart', JSON.stringify(cart));
                    
                    // Update cart count
                    window.updateCartCount();
                    
                    // Add animation to cart icon
                    const cartIcon = document.querySelector('.cart-icon');
                    if (cartIcon) {
                        // Add flying animation from product image to cart
                        const productImg = document.querySelector(`[data-product-id="${productId}"] img`) || 
                                          document.querySelector('.product-image img');
                        
                        if (productImg) {
                            const flyingImg = document.createElement('img');
                            flyingImg.src = product.image;
                            flyingImg.className = 'flying-image';
                            flyingImg.style.position = 'fixed';
                            
                            // Get positions
                            const imgRect = productImg.getBoundingClientRect();
                            const cartRect = cartIcon.getBoundingClientRect();
                            
                            // Set initial position
                            flyingImg.style.top = `${imgRect.top + imgRect.height/2}px`;
                            flyingImg.style.left = `${imgRect.left + imgRect.width/2}px`;
                            flyingImg.style.width = '50px';
                            flyingImg.style.height = '50px';
                            flyingImg.style.objectFit = 'contain';
                            flyingImg.style.borderRadius = '50%';
                            flyingImg.style.zIndex = '9999';
                            flyingImg.style.transition = 'all 0.8s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
                            flyingImg.style.opacity = '0';
                            
                            document.body.appendChild(flyingImg);
                            
                            // Trigger animation
                            setTimeout(() => {
                                flyingImg.style.top = `${cartRect.top + cartRect.height/2}px`;
                                flyingImg.style.left = `${cartRect.left + cartRect.width/2}px`;
                                flyingImg.style.width = '20px';
                                flyingImg.style.height = '20px';
                                flyingImg.style.opacity = '1';
                            }, 10);
                            
                            // Remove element after animation
                            setTimeout(() => {
                                flyingImg.style.opacity = '0';
                                setTimeout(() => {
                                    if (document.body.contains(flyingImg)) {
                                        document.body.removeChild(flyingImg);
                                    }
                                }, 300);
                                
                                // Bounce the cart icon
                                cartIcon.classList.add('bounce');
                                setTimeout(() => {
                                    cartIcon.classList.remove('bounce');
                                }, 1000);
                            }, 800);
                        } else {
                            // Fallback if product image not found
                            cartIcon.classList.add('bounce');
                            setTimeout(() => {
                                cartIcon.classList.remove('bounce');
                            }, 1000);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error adding to cart:', error);
                    
                    // Fallback implementation if product fetch fails
                    showNotification('Error adding item to cart. Please try again.', 'error');
                });
        } else {
            // Show error for missing product ID
            showNotification('Error: Product ID is required', 'error');
        }
    };
    
    // Notification function - make it globally available
    window.showNotification = function(message, type = 'success') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        // Add type class
        if (type) {
            notification.classList.add(`notification-${type}`);
        }
        
        // Set icon based on type
        let icon = 'check-circle';
        
        if (type === 'error') {
            icon = 'exclamation-circle';
        } else if (type === 'info') {
            icon = 'info-circle';
        } else if (type === 'warning') {
            icon = 'exclamation-triangle';
        }
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="notification-message">${message}</div>
            <div class="notification-close">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            });
        }
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 4000);
    };
    
    // Enhanced cart notification function - make it globally available
    window.showCartNotification = function(title, message, variations, price, image) {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        
        // Create notification content
        notification.innerHTML = `
            <img src="${image}" alt="Product" class="cart-notification-image">
            <div class="cart-notification-content">
                <div class="cart-notification-title">${title}</div>
                <div class="cart-notification-message">
                    ${message}
                    ${variations ? `<div class="cart-notification-variations">${variations}</div>` : ''}
                    <strong>${price}</strong>
                </div>
            </div>
            <div class="cart-notification-close">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.cart-notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            });
        }
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
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
