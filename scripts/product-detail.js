console.log('Product Detail Script Loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded for Product Detail Page');
    // DOM Elements
    const productDetail = document.getElementById('product-detail');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const productTitle = document.getElementById('product-title');
    const productCategory = document.getElementById('product-category');
    const productPrice = document.getElementById('product-price');
    const productDescription = document.getElementById('product-description');
    const productRating = document.getElementById('product-rating');
    const mainProductImage = document.getElementById('main-product-image');
    const thumbnailContainer = document.querySelector('.thumbnail-container');
    const relatedProductsGrid = document.querySelector('.related-products-grid');
    const productBreadcrumb = document.getElementById('product-breadcrumb');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const quantityInput = document.getElementById('quantity');
    const quantityPlus = document.querySelector('.quantity-btn.plus');
    const quantityMinus = document.querySelector('.quantity-btn.minus');
    const sizeVariation = document.querySelector('.size-variation');
    const colorVariation = document.querySelector('.color-variation');
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    // State
    let currentProduct = null;
    let relatedProducts = [];
    
    // Fallback product data in case API fails
    const fallbackProducts = [
        {
            id: 1,
            title: "Fjallraven - Foldsack No. 1 Backpack",
            price: 109.95,
            description: "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
            category: "men's clothing",
            image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
            rating: { rate: 3.9, count: 120 }
        },
        {
            id: 2,
            title: "Mens Casual Premium Slim Fit T-Shirts",
            price: 22.3,
            description: "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing.",
            category: "men's clothing",
            image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
            rating: { rate: 4.1, count: 259 }
        },
        {
            id: 3,
            title: "Mens Cotton Jacket",
            price: 55.99,
            description: "Great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors.",
            category: "men's clothing",
            image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
            rating: { rate: 4.7, count: 500 }
        },
        {
            id: 4,
            title: "Women's Short Sleeve Moisture",
            price: 7.95,
            description: "100% Polyester, Machine wash, 100% cationic polyester interlock, Machine Wash & Pre Shrunk for a Great Fit, Lightweight, roomy and highly breathable with moisture wicking fabric which helps to keep moisture away.",
            category: "women's clothing",
            image: "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",
            rating: { rate: 4.5, count: 146 }
        },
        {
            id: 5,
            title: "John Hardy Women's Chain Bracelet",
            price: 695,
            description: "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl. Wear facing inward to be bestowed with love and abundance, or outward for protection.",
            category: "jewelery",
            image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
            rating: { rate: 4.6, count: 400 }
        }
    ];
    
    // Function to use fallback data when API fails
    function useFallbackData() {
        console.log('Using fallback product data');
        
        // Find product in fallback data or use the first one
        const id = parseInt(productId);
        const fallbackProduct = fallbackProducts.find(p => p.id === id) || fallbackProducts[0];
        
        // Set current product
        currentProduct = fallbackProduct;
        
        // Set related products (products from the same category)
        relatedProducts = fallbackProducts
            .filter(p => p.category === fallbackProduct.category && p.id !== fallbackProduct.id)
            .slice(0, 4);
        
        // Render product details
        renderProductDetails();
        
        // Render related products
        renderRelatedProducts();
    }
    
    // Initialize
    if (productId) {
        try {
            fetchProductDetails(productId);
        } catch (error) {
            console.error('Error in initialization:', error);
            useFallbackData();
        }
    } else {
        showError('Product not found. Please try another product.');
    }
    
    // Fetch product details from API
    async function fetchProductDetails(id) {
        try {
            console.log(`Fetching product with ID: ${id}`);
            
            // Add a timeout to the fetch to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(`https://fakestoreapi.com/products/${id}`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            console.log('API Response Status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Product not found. Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Product data received:', data);
            
            currentProduct = data;
            
            // Fetch related products (products in the same category)
            fetchRelatedProducts(currentProduct.category);
            
            // Render product details
            renderProductDetails();
            
        } catch (error) {
            console.error('Error fetching product details:', error);
            
            // Check for specific error types
            if (error.name === 'AbortError') {
                console.log('Request timed out, using fallback data');
                useFallbackData();
            } else if (error.message.includes('404')) {
                console.log('Product not found, using fallback data');
                useFallbackData();
            } else {
                console.log('API error, using fallback data');
                useFallbackData();
            }
        }
    }
    
    // Fetch related products from the same category
    async function fetchRelatedProducts(category) {
        try {
            console.log(`Fetching related products for category: ${category}`);
            
            // Add a timeout to the fetch to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(`https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            console.log('Related products API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch related products. Status: ${response.status}`);
            }
            
            const products = await response.json();
            console.log(`Found ${products.length} products in the same category`);
            
            // Filter out the current product and limit to 4 products
            relatedProducts = products
                .filter(product => product.id !== parseInt(productId))
                .slice(0, 4);
            
            console.log(`Displaying ${relatedProducts.length} related products`);
            
            // Render related products
            renderRelatedProducts();
            
        } catch (error) {
            console.error('Error fetching related products:', error);
            // Don't show error for related products, just hide the section
            document.querySelector('.related-products').style.display = 'none';
        }
    }
    
    // Render product details
    function renderProductDetails() {
        try {
            console.log('Rendering product details for:', currentProduct.title);
            
            // Hide loading spinner and show product details
            if (loadingSpinner) loadingSpinner.classList.add('hidden');
            if (productDetail) productDetail.classList.remove('hidden');
            
            // Update page title
            document.title = `${currentProduct.title} - E-Commerce Frontend`;
            
            // Update breadcrumb
            if (productBreadcrumb) productBreadcrumb.textContent = currentProduct.title;
            
            // Set product details
            if (productTitle) productTitle.textContent = currentProduct.title;
            if (productCategory) productCategory.textContent = capitalizeFirstLetter(currentProduct.category);
            if (productPrice) productPrice.textContent = `$${currentProduct.price.toFixed(2)}`;
            if (productDescription) productDescription.textContent = currentProduct.description;
            
            // Set product image
            if (mainProductImage) {
                mainProductImage.src = currentProduct.image;
                mainProductImage.alt = currentProduct.title;
                
                // Add error handler for image
                mainProductImage.onerror = function() {
                    this.src = 'assets/placeholder.jpg';
                    this.alt = 'Product image not available';
                };
            }
            
            // Set rating
            if (productRating) {
                const ratingStars = productRating.querySelector('.rating-stars');
                const ratingCount = productRating.querySelector('.rating-count');
                
                if (ratingStars) ratingStars.innerHTML = generateRatingStars(currentProduct.rating.rate);
                if (ratingCount) ratingCount.textContent = `(${currentProduct.rating.count} reviews)`;
            }
            
            // Show variations based on product category
            if (currentProduct.category === 'clothing' || 
                currentProduct.category === "men's clothing" || 
                currentProduct.category === "women's clothing") {
                if (sizeVariation) sizeVariation.classList.remove('hidden');
                if (colorVariation) colorVariation.classList.remove('hidden');
            }
            
            // Create thumbnails (for demo, we'll use the same image multiple times)
            createThumbnails();
            
            // Set up event listeners
            setupEventListeners();
            
            console.log('Product details rendered successfully');
        } catch (error) {
            console.error('Error rendering product details:', error);
            showError('There was an error displaying the product. Please try again later.');
        }
    }
    
    // Create thumbnail images
    function createThumbnails() {
        // Clear existing thumbnails
        thumbnailContainer.innerHTML = '';
        
        // For demo purposes, create 4 thumbnails with the same image
        // In a real app, you would use different images from the API
        for (let i = 0; i < 4; i++) {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            if (i === 0) thumbnail.classList.add('active');
            
            const img = document.createElement('img');
            img.src = currentProduct.image;
            img.alt = `${currentProduct.title} - View ${i + 1}`;
            
            thumbnail.appendChild(img);
            thumbnailContainer.appendChild(thumbnail);
            
            // Add click event to switch main image
            thumbnail.addEventListener('click', function() {
                // Remove active class from all thumbnails
                document.querySelectorAll('.thumbnail').forEach(thumb => {
                    thumb.classList.remove('active');
                });
                
                // Add active class to clicked thumbnail
                this.classList.add('active');
                
                // Update main image (in a real app, you would change to a different image)
                // For demo, we'll just keep the same image
                mainProductImage.src = currentProduct.image;
            });
        }
    }
    
    // Render related products
    function renderRelatedProducts() {
        try {
            console.log('Rendering related products');
            
            // Check if the grid element exists
            if (!relatedProductsGrid) {
                console.error('Related products grid element not found');
                return;
            }
            
            // Clear existing related products
            relatedProductsGrid.innerHTML = '';
            
            // If no related products, hide the section
            if (relatedProducts.length === 0) {
                const relatedSection = document.querySelector('.related-products');
                if (relatedSection) {
                    relatedSection.style.display = 'none';
                }
                return;
            }
            
            // Create product cards for each related product
            relatedProducts.forEach((product, index) => {
                // Create product card with delay for staggered animation
                setTimeout(() => {
                    try {
                        const productCard = createProductCard(product);
                        relatedProductsGrid.appendChild(productCard);
                    } catch (error) {
                        console.error('Error creating related product card:', error);
                    }
                }, index * 100);
            });
            
            console.log('Related products rendered successfully');
        } catch (error) {
            console.error('Error rendering related products:', error);
            
            // Hide the related products section on error
            const relatedSection = document.querySelector('.related-products');
            if (relatedSection) {
                relatedSection.style.display = 'none';
            }
        }
    }
    
    // Create a product card element for related products
    function createProductCard(product) {
        try {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Generate star rating HTML
            const ratingStars = generateRatingStars(product.rating.rate);
            
            card.innerHTML = `
                <a href="product.html?id=${product.id}" class="product-link">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.title}" class="product-image" 
                             onerror="this.src='assets/placeholder.jpg'; this.alt='Product image not available';">
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
                        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
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
            
            return card;
        } catch (error) {
            console.error('Error creating product card:', error);
            
            // Return a simple fallback card if there's an error
            const fallbackCard = document.createElement('div');
            fallbackCard.className = 'product-card';
            fallbackCard.innerHTML = `
                <div class="product-details">
                    <h3 class="product-title">Product information unavailable</h3>
                    <a href="products.html" class="view-details-btn">
                        Back to Products
                    </a>
                </div>
            `;
            
            return fallbackCard;
        }
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
    
    // Setup event listeners
    function setupEventListeners() {
        // Quantity buttons
        quantityPlus.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue < 99) {
                quantityInput.value = currentValue + 1;
            }
        });
        
        quantityMinus.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        // Quantity input validation
        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                value = 1;
            } else if (value > 99) {
                value = 99;
            }
            this.value = value;
        });
        
        // Size options
        const sizeOptions = document.querySelectorAll('.size-option');
        sizeOptions.forEach(option => {
            option.addEventListener('click', function() {
                sizeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Color options
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Add to cart button
        addToCartBtn.addEventListener('click', function() {
            addToCart();
        });
        
        // Image zoom effect
        const zoomOverlay = document.querySelector('.image-zoom-overlay');
        if (zoomOverlay) {
            zoomOverlay.addEventListener('click', function() {
                // In a real app, you might implement a lightbox here
                // For demo, we'll just toggle a class
                mainProductImage.classList.toggle('zoomed');
            });
        }
    }
    
    // Add to cart functionality
    function addToCart() {
        if (!currentProduct) return;
        
        // Get selected quantity
        const quantity = parseInt(quantityInput.value);
        
        // Get selected size (if applicable)
        let selectedSize = null;
        if (!sizeVariation.classList.contains('hidden')) {
            const activeSize = sizeVariation.querySelector('.size-option.active');
            if (activeSize) {
                selectedSize = activeSize.textContent;
            }
        }
        
        // Get selected color (if applicable)
        let selectedColor = null;
        if (!colorVariation.classList.contains('hidden')) {
            const activeColor = colorVariation.querySelector('.color-option.active');
            if (activeColor) {
                selectedColor = activeColor.getAttribute('data-color');
            }
        }
        
        // Create cart item
        const cartItem = {
            id: currentProduct.id,
            title: currentProduct.title,
            price: currentProduct.price,
            image: currentProduct.image,
            quantity: quantity,
            size: selectedSize,
            color: selectedColor
        };
        
        // Get current cart from localStorage or initialize empty array
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if product is already in cart
        const existingItemIndex = cart.findIndex(item => {
            // Match by ID and options (size and color)
            return item.id === cartItem.id && 
                   item.size === cartItem.size && 
                   item.color === cartItem.color;
        });
        
        if (existingItemIndex >= 0) {
            // Update quantity if product already in cart
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new product to cart
            cart.push(cartItem);
        }
        
        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count in header
        updateCartCount(cart);
        
        // Show notification
        showNotification(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart!`);
        
        // Add animation to button
        addToCartBtn.classList.add('added');
        setTimeout(() => {
            addToCartBtn.classList.remove('added');
        }, 1000);
    }
    
    // Update cart count in header
    function updateCartCount(cart) {
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
    }
    
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
    
    // Show error message
    function showError(message) {
        loadingSpinner.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button class="add-to-cart-btn" onclick="location.href='products.html'" style="max-width: 200px; margin: 20px auto;">
                <i class="fas fa-arrow-left"></i>
                Back to Products
            </button>
        `;
    }
    
    // Helper function to capitalize first letter of each word
    function capitalizeFirstLetter(string) {
        return string.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
});