document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const productsGrid = document.getElementById('products-grid');
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    // State
    let products = [];
    let filteredProducts = [];
    let categories = [];
    
    // Fetch products from API
    async function fetchProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            products = await response.json();
            filteredProducts = [...products];
            
            // Extract unique categories
            const uniqueCategories = new Set(products.map(product => product.category));
            categories = [...uniqueCategories];
            
            // Populate category filter
            populateCategoryFilter();
            
            // Render products
            renderProducts();
            
        } catch (error) {
            console.error('Error fetching products:', error);
            showErrorMessage();
        }
    }
    
    // Populate category filter with options from API
    function populateCategoryFilter() {
        // Clear existing options except "All Categories"
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        
        // Add categories from API
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = capitalizeFirstLetter(category);
            categoryFilter.appendChild(option);
        });
    }
    
    // Render products to the grid
    function renderProducts() {
        // Clear products grid
        productsGrid.innerHTML = '';
        
        // Show loading message if no products
        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <p>No products found. Try adjusting your filters.</p>
                </div>
            `;
            return;
        }
        
        // Create product cards
        filteredProducts.forEach((product, index) => {
            // Create product card with delay for staggered animation
            setTimeout(() => {
                const productCard = createProductCard(product);
                productsGrid.appendChild(productCard);
                
                // Lazy load image
                setTimeout(() => {
                    const img = productCard.querySelector('.product-image');
                    if (img) {
                        img.classList.add('loaded');
                    }
                }, 100);
            }, index * 50); // Stagger the appearance of cards
        });
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
                const productId = parseInt(this.getAttribute('data-product-id'));
                if (productId) {
                    // Use the global addToCart function if available, otherwise use the local one
                    if (typeof window.addToCart === 'function') {
                        window.addToCart(productId);
                    } else {
                        addToCart(productId);
                    }
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
    
    // Filter products based on category
    function filterProducts() {
        const selectedCategory = categoryFilter.value;
        const selectedSort = sortFilter.value;
        
        // Filter by category
        if (selectedCategory === 'all') {
            filteredProducts = [...products];
        } else {
            filteredProducts = products.filter(product => product.category === selectedCategory);
        }
        
        // Sort products
        sortProducts(selectedSort);
        
        // Render filtered products
        renderProducts();
    }
    
    // Sort products based on selected option
    function sortProducts(sortOption) {
        switch (sortOption) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                // Default sorting (by id/featured)
                filteredProducts.sort((a, b) => a.id - b.id);
        }
    }
    
    // Show error message if products can't be loaded
    function showErrorMessage() {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load products. Please try again later.</p>
                <button class="add-to-cart-btn" onclick="location.reload()" style="max-width: 200px; margin: 20px auto;">
                    <i class="fas fa-sync"></i>
                    Retry
                </button>
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
    window.addToCart = function(productId) {
        // Find the product
        const product = products.find(p => p.id === productId);
        
        if (product) {
            // Get current cart from localStorage or initialize empty array
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // Check if product is already in cart
            const existingProductIndex = cart.findIndex(item => item.id === productId);
            
            if (existingProductIndex >= 0) {
                // Increment quantity if product already in cart
                cart[existingProductIndex].quantity += 1;
            } else {
                // Add new product to cart
                cart.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }
            
            // Save updated cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart count in header
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
                cartCount.textContent = totalItems;
                
                // Add animation
                cartCount.classList.add('pulse');
                setTimeout(() => {
                    cartCount.classList.remove('pulse');
                }, 300);
            }
            
            // Show notification
            showNotification(`Added ${product.title} to cart!`);
        }
    };
    
    // Show notification
    function showNotification(message) {
        // Check if the notification function exists in app.js
        if (typeof window.showNotification === 'function') {
            window.showNotification(message);
        } else {
            // Fallback notification implementation
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
    }
    
    // Implement lazy loading for images
    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('.lazy-load').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            document.querySelectorAll('.lazy-load').forEach(img => {
                img.classList.add('loaded');
            });
        }
    }
    
    // Event listeners
    categoryFilter.addEventListener('change', filterProducts);
    sortFilter.addEventListener('change', filterProducts);
    
    // Initialize
    fetchProducts();
    
    // Setup lazy loading after a short delay
    setTimeout(setupLazyLoading, 500);
});