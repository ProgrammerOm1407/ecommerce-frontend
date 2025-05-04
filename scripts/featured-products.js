document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const featuredGrid = document.querySelector('.featured-grid');
    
    // Fetch featured products (limited to 4)
    async function fetchFeaturedProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products?limit=4');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const products = await response.json();
            
            // Clear loading spinner
            featuredGrid.innerHTML = '';
            
            // Render featured products
            products.forEach((product, index) => {
                // Create product card with delay for staggered animation
                setTimeout(() => {
                    const productCard = createProductCard(product);
                    featuredGrid.appendChild(productCard);
                    
                    // Lazy load image
                    setTimeout(() => {
                        const img = productCard.querySelector('.product-image');
                        if (img) {
                            img.classList.add('loaded');
                        }
                    }, 100);
                }, index * 100); // Stagger the appearance of cards
            });
            
        } catch (error) {
            console.error('Error fetching featured products:', error);
            showErrorMessage();
        }
    }
    
    // Create a product card element
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Generate star rating HTML
        const ratingStars = generateRatingStars(product.rating.rate);
        
        card.innerHTML = `
            <a href="product.html?id=${product.id}" class="product-link">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.title}" class="product-image lazy-load">
                </div>
            </a>
            <div class="product-details">
                <div class="product-category">${capitalizeFirstLetter(product.category)}</div>
                <a href="product.html?id=${product.id}" class="product-title-link">
                    <h3 class="product-title">${product.title}</h3>
                </a>
                <div class="product-rating">
                    <div class="rating-stars">${ratingStars}</div>
                    <div class="rating-count">(${product.rating.count})</div>
                </div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="add-to-cart-btn" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                    <a href="product.html?id=${product.id}" class="view-details-btn">
                        <i class="fas fa-eye"></i>
                        View Details
                    </a>
                </div>
            </div>
        `;
        
        // Add event listener for the Add to Cart button
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                if (productId && typeof window.addToCart === 'function') {
                    window.addToCart(parseInt(productId));
                }
            });
        }
        
        return card;
    }
    
    // Generate star rating HTML
    function generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (halfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        
        return starsHTML;
    }
    
    // Show error message if products can't be loaded
    function showErrorMessage() {
        featuredGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load products. Please try again later.</p>
            </div>
        `;
    }
    
    // Helper function to capitalize first letter of each word
    function capitalizeFirstLetter(string) {
        return string.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    // Add to cart functionality
    // We'll use the implementation from app.js
    // This function is just a wrapper to ensure we don't override the main implementation
    function handleAddToCart(productId) {
        console.log('Featured products: Adding to cart:', productId);
        
        // Check if the main addToCart function exists
        if (typeof window.addToCart === 'function') {
            // Call the main implementation
            window.addToCart(productId);
        } else {
            console.error('Main addToCart function not found');
            
            // Simple fallback if the main function is not available
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                const currentCount = parseInt(cartCount.textContent || 0);
                cartCount.textContent = currentCount + 1;
            }
            
            // Show notification
            showNotification('Item added to cart!');
        }
    }
    
    // Show notification (reusing from app.js)
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
    
    // Initialize
    fetchFeaturedProducts();
});