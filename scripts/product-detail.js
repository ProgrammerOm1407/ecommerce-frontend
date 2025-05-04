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
                
                // Also show material variation for clothing
                const materialVariation = document.querySelector('.material-variation');
                if (materialVariation) materialVariation.classList.remove('hidden');
            } else if (currentProduct.category === 'jewelery') {
                // For jewelry, only show color/material options
                if (colorVariation) colorVariation.classList.remove('hidden');
                
                // Rename color to "Metal" for jewelry
                const colorLabel = colorVariation.querySelector('label');
                if (colorLabel) {
                    colorLabel.innerHTML = 'Metal: <span class="selected-value"></span>';
                }
                
                // Change color options for jewelry
                const colorOptions = colorVariation.querySelectorAll('.color-option');
                if (colorOptions.length > 0) {
                    colorOptions[0].style.backgroundColor = '#FFD700'; // Gold
                    colorOptions[0].setAttribute('data-color', 'Gold');
                    colorOptions[0].setAttribute('aria-label', 'Gold');
                    updateColorTooltip(colorOptions[0], 'Gold');
                    
                    colorOptions[1].style.backgroundColor = '#C0C0C0'; // Silver
                    colorOptions[1].setAttribute('data-color', 'Silver');
                    colorOptions[1].setAttribute('aria-label', 'Silver');
                    updateColorTooltip(colorOptions[1], 'Silver');
                    
                    colorOptions[2].style.backgroundColor = '#CD7F32'; // Bronze
                    colorOptions[2].setAttribute('data-color', 'Bronze');
                    colorOptions[2].setAttribute('aria-label', 'Bronze');
                    updateColorTooltip(colorOptions[2], 'Bronze');
                    
                    colorOptions[3].style.backgroundColor = '#E5E4E2'; // Platinum
                    colorOptions[3].setAttribute('data-color', 'Platinum');
                    colorOptions[3].setAttribute('aria-label', 'Platinum');
                    updateColorTooltip(colorOptions[3], 'Platinum');
                    
                    // Hide any extra options
                    for (let i = 4; i < colorOptions.length; i++) {
                        colorOptions[i].style.display = 'none';
                    }
                }
            } else if (currentProduct.category === 'electronics') {
                // For electronics, show color options
                if (colorVariation) colorVariation.classList.remove('hidden');
                
                // Add storage/capacity variation for electronics
                const materialVariation = document.querySelector('.material-variation');
                if (materialVariation) {
                    materialVariation.classList.remove('hidden');
                    
                    // Change label to "Storage"
                    const materialLabel = materialVariation.querySelector('label');
                    if (materialLabel) {
                        materialLabel.innerHTML = 'Storage: <span class="selected-value"></span>';
                    }
                    
                    // Change options to storage sizes
                    const materialOptions = materialVariation.querySelectorAll('.material-option');
                    if (materialOptions.length > 0) {
                        materialOptions[0].textContent = '64GB';
                        materialOptions[0].setAttribute('data-material', '64GB');
                        
                        materialOptions[1].textContent = '128GB';
                        materialOptions[1].setAttribute('data-material', '128GB');
                        
                        materialOptions[2].textContent = '256GB';
                        materialOptions[2].setAttribute('data-material', '256GB');
                        
                        materialOptions[3].textContent = '512GB';
                        materialOptions[3].setAttribute('data-material', '512GB');
                    }
                }
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
                        <button class="add-to-cart-btn" onclick="window.addToCart(${product.id})">
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
        // Set random stock quantity for demo
        const maxStock = Math.floor(Math.random() * 50) + 50; // Random between 50-100
        const stockQuantityElement = document.getElementById('stock-quantity');
        if (stockQuantityElement) {
            stockQuantityElement.textContent = maxStock;
        }
        
        // Get unit price and total price elements
        const unitPriceElement = document.getElementById('unit-price');
        const totalPriceElement = document.getElementById('total-price');
        const quantityDisplayElement = document.getElementById('quantity-display');
        
        // Initialize price display
        if (unitPriceElement && currentProduct) {
            unitPriceElement.textContent = `$${currentProduct.price.toFixed(2)}`;
        }
        
        if (totalPriceElement && currentProduct) {
            totalPriceElement.textContent = `$${currentProduct.price.toFixed(2)}`;
        }
        
        // Quantity buttons with improved UX
        quantityPlus.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue < maxStock) {
                // Add animation to button
                this.classList.add('active');
                setTimeout(() => this.classList.remove('active'), 200);
                
                // Update quantity
                const newValue = currentValue + 1;
                quantityInput.value = newValue;
                currentQuantity = newValue;
                
                // Animate the quantity change
                quantityInput.classList.add('pulse');
                setTimeout(() => quantityInput.classList.remove('pulse'), 300);
                
                // Update quantity display
                if (quantityDisplayElement) {
                    quantityDisplayElement.textContent = newValue;
                    quantityDisplayElement.classList.add('updating');
                    setTimeout(() => quantityDisplayElement.classList.remove('updating'), 500);
                }
                
                // Update price based on new quantity
                const currentPriceElement = productPrice.querySelector('.price-update');
                if (currentPriceElement) {
                    const currentPrice = parseFloat(currentPriceElement.textContent.replace('$', ''));
                    updatePrice(currentPrice);
                } else if (currentProduct) {
                    updatePrice(currentProduct.price);
                }
                
                // Check if approaching max stock
                if (newValue >= maxStock - 5) {
                    const quantityLimit = document.querySelector('.quantity-limit');
                    if (quantityLimit) {
                        quantityLimit.style.color = '#dc3545';
                        quantityLimit.style.fontWeight = 'bold';
                    }
                }
            } else {
                // Show max quantity reached feedback
                quantityInput.classList.add('shake');
                setTimeout(() => quantityInput.classList.remove('shake'), 500);
                
                // Show notification
                showNotification(`Maximum available quantity is ${maxStock}`);
            }
        });
        
        quantityMinus.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                // Add animation to button
                this.classList.add('active');
                setTimeout(() => this.classList.remove('active'), 200);
                
                // Update quantity
                const newValue = currentValue - 1;
                quantityInput.value = newValue;
                currentQuantity = newValue;
                
                // Animate the quantity change
                quantityInput.classList.add('pulse');
                setTimeout(() => quantityInput.classList.remove('pulse'), 300);
                
                // Update quantity display
                if (quantityDisplayElement) {
                    quantityDisplayElement.textContent = newValue;
                    quantityDisplayElement.classList.add('updating');
                    setTimeout(() => quantityDisplayElement.classList.remove('updating'), 500);
                }
                
                // Update price based on new quantity
                const currentPriceElement = productPrice.querySelector('.price-update');
                if (currentPriceElement) {
                    const currentPrice = parseFloat(currentPriceElement.textContent.replace('$', ''));
                    updatePrice(currentPrice);
                } else if (currentProduct) {
                    updatePrice(currentProduct.price);
                }
                
                // Reset stock warning if below threshold
                if (newValue < maxStock - 5) {
                    const quantityLimit = document.querySelector('.quantity-limit');
                    if (quantityLimit) {
                        quantityLimit.style.color = '#666';
                        quantityLimit.style.fontWeight = 'normal';
                    }
                }
            } else {
                // Show min quantity reached feedback
                quantityInput.classList.add('shake');
                setTimeout(() => quantityInput.classList.remove('shake'), 500);
            }
        });
        
        // Quantity input validation with improved UX
        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                value = 1;
                // Show feedback
                this.classList.add('shake');
                setTimeout(() => this.classList.remove('shake'), 500);
            } else if (value > maxStock) {
                value = maxStock;
                // Show feedback
                this.classList.add('shake');
                setTimeout(() => this.classList.remove('shake'), 500);
                
                // Show notification
                showNotification(`Maximum available quantity is ${maxStock}`);
            }
            
            this.value = value;
            currentQuantity = value;
            
            // Update quantity display
            if (quantityDisplayElement) {
                quantityDisplayElement.textContent = value;
                quantityDisplayElement.classList.add('updating');
                setTimeout(() => quantityDisplayElement.classList.remove('updating'), 500);
            }
            
            // Update price based on new quantity
            const currentPriceElement = productPrice.querySelector('.price-update');
            if (currentPriceElement) {
                const currentPrice = parseFloat(currentPriceElement.textContent.replace('$', ''));
                updatePrice(currentPrice);
            } else if (currentProduct) {
                updatePrice(currentProduct.price);
            }
            
            // Update stock warning display
            if (value >= maxStock - 5) {
                const quantityLimit = document.querySelector('.quantity-limit');
                if (quantityLimit) {
                    quantityLimit.style.color = '#dc3545';
                    quantityLimit.style.fontWeight = 'bold';
                }
            } else {
                const quantityLimit = document.querySelector('.quantity-limit');
                if (quantityLimit) {
                    quantityLimit.style.color = '#666';
                    quantityLimit.style.fontWeight = 'normal';
                }
            }
        });
        
        // Product variations state
        let selectedSize = null;
        let selectedColor = null;
        let selectedMaterial = null;
        let basePrice = currentProduct ? currentProduct.price : 0;
        let currentQuantity = parseInt(quantityInput.value) || 1;
        
        // Get variation preview element
        const variationPreview = document.querySelector('.variation-preview');
        if (variationPreview) {
            variationPreview.innerHTML = 'Select options to see your configuration';
        }
        
        // Create size guide modal
        const sizeGuideModal = document.createElement('div');
        sizeGuideModal.className = 'size-guide-modal';
        sizeGuideModal.innerHTML = `
            <div class="size-guide-content">
                <div class="size-guide-close"><i class="fas fa-times"></i></div>
                <h2 class="size-guide-title">Size Guide</h2>
                <p>Use this guide to find the perfect fit for you.</p>
                <table class="size-guide-table">
                    <thead>
                        <tr>
                            <th>Size</th>
                            <th>Chest (in)</th>
                            <th>Waist (in)</th>
                            <th>Hips (in)</th>
                            <th>US/UK</th>
                            <th>EU</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>XS</strong></td>
                            <td>32-34</td>
                            <td>26-28</td>
                            <td>34-36</td>
                            <td>2-4</td>
                            <td>32-34</td>
                        </tr>
                        <tr>
                            <td><strong>S</strong></td>
                            <td>34-36</td>
                            <td>28-30</td>
                            <td>36-38</td>
                            <td>4-6</td>
                            <td>34-36</td>
                        </tr>
                        <tr>
                            <td><strong>M</strong></td>
                            <td>36-38</td>
                            <td>30-32</td>
                            <td>38-40</td>
                            <td>8-10</td>
                            <td>38-40</td>
                        </tr>
                        <tr>
                            <td><strong>L</strong></td>
                            <td>38-40</td>
                            <td>32-34</td>
                            <td>40-42</td>
                            <td>12-14</td>
                            <td>42-44</td>
                        </tr>
                        <tr>
                            <td><strong>XL</strong></td>
                            <td>40-42</td>
                            <td>34-36</td>
                            <td>42-44</td>
                            <td>16-18</td>
                            <td>46-48</td>
                        </tr>
                        <tr>
                            <td><strong>XXL</strong></td>
                            <td>42-44</td>
                            <td>36-38</td>
                            <td>44-46</td>
                            <td>20-22</td>
                            <td>50-52</td>
                        </tr>
                    </tbody>
                </table>
                <p><strong>How to Measure:</strong></p>
                <ul>
                    <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
                    <li><strong>Waist:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</li>
                    <li><strong>Hips:</strong> Measure around the fullest part of your hips, keeping the tape horizontal.</li>
                </ul>
            </div>
        `;
        document.body.appendChild(sizeGuideModal);
        
        // Size guide functionality
        const sizeGuideTrigger = document.getElementById('size-guide-trigger');
        const sizeGuideClose = sizeGuideModal.querySelector('.size-guide-close');
        
        if (sizeGuideTrigger) {
            sizeGuideTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                sizeGuideModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (sizeGuideClose) {
            sizeGuideClose.addEventListener('click', function() {
                sizeGuideModal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        // Close modal when clicking outside content
        sizeGuideModal.addEventListener('click', function(e) {
            if (e.target === sizeGuideModal) {
                sizeGuideModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Size options
        const sizeOptions = document.querySelectorAll('.size-option');
        sizeOptions.forEach(option => {
            // Randomly disable some sizes for demo purposes
            if (Math.random() > 0.7) {
                option.classList.add('disabled');
            }
            
            option.addEventListener('click', function() {
                // Skip if disabled
                if (this.classList.contains('disabled')) return;
                
                sizeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Update selected size
                selectedSize = this.getAttribute('data-size');
                
                // Update label to show selected value
                const selectedValueSpan = sizeVariation.querySelector('.selected-value');
                if (selectedValueSpan) {
                    selectedValueSpan.textContent = selectedSize;
                }
                
                // Update variation preview
                updateVariationPreview();
                
                // Update price (add a small premium for larger sizes)
                const sizeIndex = Array.from(sizeOptions).indexOf(this);
                const sizePremium = sizeIndex * 2; // $2 more for each size up
                updatePrice(basePrice + sizePremium);
                
                // Show animation feedback
                this.classList.add('pulse');
                setTimeout(() => {
                    this.classList.remove('pulse');
                }, 500);
            });
        });
        
        // Color options
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            // Randomly disable some colors for demo purposes
            if (Math.random() > 0.7) {
                option.classList.add('disabled');
            }
            
            option.addEventListener('click', function() {
                // Skip if disabled
                if (this.classList.contains('disabled')) return;
                
                colorOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Update selected color
                selectedColor = this.getAttribute('data-color');
                
                // Update label to show selected value
                const selectedValueSpan = colorVariation.querySelector('.selected-value');
                if (selectedValueSpan) {
                    selectedValueSpan.textContent = selectedColor;
                }
                
                // Update variation preview
                updateVariationPreview();
                
                // Update product image based on color (for demo purposes)
                // In a real app, you would have different images for each color
                const colorFilter = getColorFilter(selectedColor);
                mainProductImage.style.filter = colorFilter;
                
                // Update thumbnails with the same filter
                document.querySelectorAll('.thumbnail img').forEach(img => {
                    img.style.filter = colorFilter;
                });
                
                // Show animation feedback
                this.classList.add('pulse');
                setTimeout(() => {
                    this.classList.remove('pulse');
                }, 500);
            });
        });
        
        // Material options
        const materialVariation = document.querySelector('.material-variation');
        const materialOptions = document.querySelectorAll('.material-option');
        
        materialOptions.forEach(option => {
            // Randomly disable some materials for demo purposes
            if (Math.random() > 0.8) {
                option.classList.add('disabled');
            }
            
            option.addEventListener('click', function() {
                // Skip if disabled
                if (this.classList.contains('disabled')) return;
                
                materialOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Update selected material
                selectedMaterial = this.getAttribute('data-material');
                
                // Update label to show selected value
                const selectedValueSpan = materialVariation.querySelector('.selected-value');
                if (selectedValueSpan) {
                    selectedValueSpan.textContent = selectedMaterial;
                }
                
                // Update variation preview
                updateVariationPreview();
                
                // Update price based on material
                let materialPremium = 0;
                
                // Different price adjustments based on product category
                if (currentProduct.category === 'electronics') {
                    // For electronics (storage options)
                    if (selectedMaterial === '128GB') materialPremium = 50;
                    else if (selectedMaterial === '256GB') materialPremium = 100;
                    else if (selectedMaterial === '512GB') materialPremium = 200;
                } else {
                    // For clothing (material options)
                    if (selectedMaterial === 'Leather') materialPremium = 30;
                    else if (selectedMaterial === 'Wool') materialPremium = 15;
                    else if (selectedMaterial === 'Cotton') materialPremium = 0;
                    else if (selectedMaterial === 'Polyester') materialPremium = -5;
                }
                
                updatePrice(basePrice + materialPremium);
                
                // Show animation feedback
                this.classList.add('pulse');
                setTimeout(() => {
                    this.classList.remove('pulse');
                }, 500);
            });
        });
        
        // Function to update variation preview
        function updateVariationPreview() {
            if (!variationPreview) return;
            
            let previewHTML = '';
            let hasSelections = false;
            
            if (selectedSize) {
                previewHTML += `<span class="selected-variation">Size: ${selectedSize}</span>`;
                hasSelections = true;
            }
            
            if (selectedColor) {
                previewHTML += `<span class="selected-variation">Color: ${selectedColor}</span>`;
                hasSelections = true;
            }
            
            if (selectedMaterial) {
                // Adjust label based on product category
                let materialLabel = 'Material';
                if (currentProduct.category === 'electronics') {
                    materialLabel = 'Storage';
                } else if (currentProduct.category === 'jewelery') {
                    materialLabel = 'Metal';
                }
                
                previewHTML += `<span class="selected-variation">${materialLabel}: ${selectedMaterial}</span>`;
                hasSelections = true;
            }
            
            if (!hasSelections) {
                previewHTML = 'Select options to see your configuration';
            } else {
                // Add estimated delivery info
                const today = new Date();
                const deliveryDate = new Date(today);
                deliveryDate.setDate(today.getDate() + Math.floor(Math.random() * 5) + 3); // Random delivery between 3-7 days
                
                const options = { weekday: 'long', month: 'long', day: 'numeric' };
                const formattedDate = deliveryDate.toLocaleDateString('en-US', options);
                
                previewHTML += `<div style="margin-top: 10px; font-size: 0.9rem;">
                    <i class="fas fa-truck" style="color: #4a90e2;"></i> 
                    Estimated delivery: <strong>${formattedDate}</strong>
                </div>`;
            }
            
            variationPreview.innerHTML = previewHTML;
            
            // Add animation to preview
            variationPreview.classList.add('updating');
            setTimeout(() => {
                variationPreview.classList.remove('updating');
            }, 500);
        }
        
        // Function to get CSS filter for color simulation
        function getColorFilter(color) {
            // This is a simplified approach for demo purposes
            // In a real app, you would use different product images for each color
            switch (color) {
                case 'Black':
                    return 'brightness(0.8) contrast(1.2)';
                case 'White':
                    return 'brightness(1.1) contrast(0.9)';
                case 'Blue':
                    return 'sepia(0.5) hue-rotate(180deg) saturate(2)';
                case 'Red':
                    return 'sepia(0.5) hue-rotate(320deg) saturate(3)';
                default:
                    return 'none';
            }
        }
        
        // Function to update price display with enhanced animations and details
        function updatePrice(newPrice) {
            if (!productPrice) return;
            
            // Store the base price for future calculations
            basePrice = newPrice;
            
            // Calculate total based on quantity
            const total = newPrice * currentQuantity;
            
            // Format prices
            const formattedPrice = `$${newPrice.toFixed(2)}`;
            const formattedTotal = `$${total.toFixed(2)}`;
            
            // Update the main product price display
            if (!productPrice.querySelector('.price-update')) {
                productPrice.innerHTML = `
                    <span class="price-update">${formattedPrice}</span>
                    <span class="total-price">Total: ${formattedTotal}</span>
                `;
            } else {
                const priceUpdate = productPrice.querySelector('.price-update');
                const totalPrice = productPrice.querySelector('.total-price');
                
                // Add animation class
                priceUpdate.classList.add('updating');
                
                // Update price text
                priceUpdate.textContent = formattedPrice;
                totalPrice.textContent = `Total: ${formattedTotal}`;
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    priceUpdate.classList.remove('updating');
                }, 500);
            }
            
            // Update the price summary section
            const unitPriceElement = document.getElementById('unit-price');
            const totalPriceElement = document.getElementById('total-price');
            
            if (unitPriceElement) {
                // Add animation
                unitPriceElement.classList.add('updating');
                
                // Update text
                unitPriceElement.textContent = formattedPrice;
                
                // Remove animation after it completes
                setTimeout(() => {
                    unitPriceElement.classList.remove('updating');
                }, 500);
            }
            
            if (totalPriceElement) {
                // Add animation
                totalPriceElement.classList.add('updating');
                
                // Update text
                totalPriceElement.textContent = formattedTotal;
                
                // Remove animation after it completes
                setTimeout(() => {
                    totalPriceElement.classList.remove('updating');
                }, 500);
                
                // Add a subtle highlight effect to the total row
                const totalRow = totalPriceElement.closest('.price-row');
                if (totalRow) {
                    totalRow.style.backgroundColor = '#e9f2ff';
                    setTimeout(() => {
                        totalRow.style.backgroundColor = '';
                    }, 1000);
                }
            }
            
            // Update Buy Now button text to include price
            const buyNowBtn = document.getElementById('buy-now-btn');
            if (buyNowBtn) {
                buyNowBtn.innerHTML = `
                    <i class="fas fa-bolt"></i>
                    Buy Now - ${formattedTotal}
                `;
            }
            
            // Check for discounts and show savings
            const originalPrice = currentProduct.price;
            if (newPrice < originalPrice) {
                // There's a discount (e.g., from selecting a different material)
                const savings = originalPrice - newPrice;
                const savingsPercent = Math.round((savings / originalPrice) * 100);
                
                // Show savings badge if it doesn't exist
                if (!document.querySelector('.price-savings')) {
                    const savingsElement = document.createElement('div');
                    savingsElement.className = 'price-savings';
                    savingsElement.innerHTML = `
                        <span class="savings-badge">Save ${savingsPercent}%</span>
                        <span class="original-price">$${originalPrice.toFixed(2)}</span>
                    `;
                    
                    // Insert before the price update
                    const priceUpdate = productPrice.querySelector('.price-update');
                    if (priceUpdate) {
                        productPrice.insertBefore(savingsElement, priceUpdate);
                    } else {
                        productPrice.appendChild(savingsElement);
                    }
                } else {
                    // Update existing savings badge
                    const savingsBadge = document.querySelector('.savings-badge');
                    if (savingsBadge) {
                        savingsBadge.textContent = `Save ${savingsPercent}%`;
                    }
                    
                    const originalPriceElement = document.querySelector('.original-price');
                    if (originalPriceElement) {
                        originalPriceElement.textContent = `$${originalPrice.toFixed(2)}`;
                    }
                }
            } else {
                // Remove savings badge if price is not discounted
                const savingsElement = document.querySelector('.price-savings');
                if (savingsElement) {
                    savingsElement.remove();
                }
            }
        }
        
        // Add to cart button
        addToCartBtn.addEventListener('click', function() {
            addToCart();
        });
        
        // Buy Now button
        const buyNowBtn = document.getElementById('buy-now-btn');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', function() {
                // First add to cart
                addToCart();
                
                // Then redirect to checkout (simulated for demo)
                setTimeout(() => {
                    showNotification('Redirecting to checkout...');
                    
                    // In a real app, this would redirect to the checkout page
                    // For demo, we'll just show a notification
                    setTimeout(() => {
                        showNotification('This is a demo. Checkout functionality is not implemented.');
                    }, 1500);
                }, 1000);
            });
        }
        
        // Enhanced Image Zoom functionality
        const mainImageContainer = document.querySelector('.main-image-container');
        if (mainImageContainer && mainProductImage) {
            // Create zoom lens and result elements
            const zoomLens = document.createElement('div');
            zoomLens.className = 'zoom-lens';
            
            const zoomResult = document.createElement('div');
            zoomResult.className = 'zoom-result';
            
            // Create zoom controls
            const zoomControls = document.createElement('div');
            zoomControls.className = 'zoom-controls';
            zoomControls.innerHTML = `
                <button class="zoom-control zoom-in" aria-label="Zoom in">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="zoom-control zoom-out" aria-label="Zoom out">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="zoom-control zoom-reset" aria-label="Reset zoom">
                    <i class="fas fa-undo"></i>
                </button>
            `;
            
            // Add elements to the DOM
            mainImageContainer.appendChild(zoomLens);
            mainImageContainer.appendChild(zoomResult);
            mainImageContainer.appendChild(zoomControls);
            
            // Variables for zoom functionality
            let zoomActive = false;
            let cx, cy;
            let zoomLevel = 2.5; // Increased default zoom level for better visibility
            const minZoomLevel = 1.5;
            const maxZoomLevel = 5; // Increased max zoom level
            let isDragging = false;
            let lastTouchDistance = 0;
            let zoomMode = 'hover'; // 'hover' or 'lens'
            
            // Initialize zoom
            function initZoom() {
                // Calculate the ratio between zoom result and lens
                cx = zoomResult.offsetWidth / zoomLens.offsetWidth * zoomLevel;
                cy = zoomResult.offsetHeight / zoomLens.offsetHeight * zoomLevel;
                
                // Set background properties for zoom result
                zoomResult.style.backgroundImage = `url('${mainProductImage.src}')`;
                zoomResult.style.backgroundSize = `${mainProductImage.width * cx}px ${mainProductImage.height * cy}px`;
                
                // Position the zoom result
                const rect = mainImageContainer.getBoundingClientRect();
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    // On mobile, position the zoom result over the image
                    zoomResult.style.top = '0';
                    zoomResult.style.left = '0';
                    zoomResult.style.width = '100%';
                    zoomResult.style.height = '100%';
                    zoomResult.style.position = 'absolute';
                    zoomResult.style.zIndex = '30';
                } else {
                    // On desktop, position the zoom result to the right of the image
                    zoomResult.style.top = '0';
                    zoomResult.style.left = `${rect.width + 20}px`;
                    
                    // Adjust position if it would go off-screen
                    const resultRect = zoomResult.getBoundingClientRect();
                    if (resultRect.right > window.innerWidth) {
                        zoomResult.style.left = 'auto';
                        zoomResult.style.right = '0';
                        zoomResult.style.top = `${rect.height + 20}px`;
                    }
                }
                
                // Add zoom mode toggle button
                const zoomModeToggle = document.createElement('button');
                zoomModeToggle.className = 'zoom-mode-toggle';
                zoomModeToggle.innerHTML = '<i class="fas fa-search"></i> Toggle Zoom Mode';
                zoomModeToggle.setAttribute('aria-label', 'Toggle between hover and lens zoom');
                
                // Add to zoom controls
                zoomControls.appendChild(zoomModeToggle);
                
                // Toggle zoom mode
                zoomModeToggle.addEventListener('click', function() {
                    zoomMode = zoomMode === 'hover' ? 'lens' : 'hover';
                    
                    // Update UI to reflect current mode
                    if (zoomMode === 'hover') {
                        zoomModeToggle.innerHTML = '<i class="fas fa-search"></i> Lens Zoom';
                        document.querySelector('.zoom-instructions').innerHTML = 
                            '<i class="fas fa-search-plus"></i> Hover over image to zoom | Use mouse wheel to adjust zoom level';
                    } else {
                        zoomModeToggle.innerHTML = '<i class="fas fa-search-plus"></i> Hover Zoom';
                        document.querySelector('.zoom-instructions').innerHTML = 
                            '<i class="fas fa-search"></i> Move cursor to see details | Use mouse wheel to adjust zoom level';
                    }
                    
                    // If currently zooming, update the view
                    if (zoomActive) {
                        stopZoom();
                        startZoom();
                    }
                });
                
                // Add event listeners
                mainImageContainer.addEventListener('mouseenter', startZoom);
                mainImageContainer.addEventListener('mouseleave', stopZoom);
                mainImageContainer.addEventListener('mousemove', moveZoom);
                
                // Touch support with improved handling
                mainImageContainer.addEventListener('touchstart', handleTouchStart);
                mainImageContainer.addEventListener('touchmove', handleTouchMove);
                mainImageContainer.addEventListener('touchend', handleTouchEnd);
                
                // Zoom controls
                const zoomInBtn = zoomControls.querySelector('.zoom-in');
                const zoomOutBtn = zoomControls.querySelector('.zoom-out');
                const zoomResetBtn = zoomControls.querySelector('.zoom-reset');
                
                zoomInBtn.addEventListener('click', function() {
                    zoomLevel = Math.min(zoomLevel + 0.5, maxZoomLevel);
                    updateZoom();
                });
                
                zoomOutBtn.addEventListener('click', function() {
                    zoomLevel = Math.max(zoomLevel - 0.5, minZoomLevel);
                    updateZoom();
                });
                
                zoomResetBtn.addEventListener('click', function() {
                    zoomLevel = 2.5;
                    updateZoom();
                });
                
                // Mouse wheel zoom
                mainImageContainer.addEventListener('wheel', function(e) {
                    if (zoomActive) {
                        e.preventDefault();
                        if (e.deltaY < 0) {
                            // Zoom in
                            zoomLevel = Math.min(zoomLevel + 0.2, maxZoomLevel);
                        } else {
                            // Zoom out
                            zoomLevel = Math.max(zoomLevel - 0.2, minZoomLevel);
                        }
                        updateZoom();
                        moveZoom(e);
                    }
                });
            }
            
            // Update zoom level
            function updateZoom() {
                cx = zoomResult.offsetWidth / zoomLens.offsetWidth * zoomLevel;
                cy = zoomResult.offsetHeight / zoomLens.offsetHeight * zoomLevel;
                
                zoomResult.style.backgroundSize = `${mainProductImage.width * cx}px ${mainProductImage.height * cy}px`;
                
                // Update lens size based on zoom level
                const lensSize = 100 / zoomLevel;
                zoomLens.style.width = `${lensSize}px`;
                zoomLens.style.height = `${lensSize}px`;
                
                // If zoom is active, update the position
                if (zoomActive) {
                    const lensRect = zoomLens.getBoundingClientRect();
                    const x = parseFloat(zoomLens.style.left);
                    const y = parseFloat(zoomLens.style.top);
                    
                    zoomResult.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
                }
            }
            
            // Start zoom
            function startZoom() {
                zoomActive = true;
                mainImageContainer.classList.add('zooming');
                
                // Apply different styles based on zoom mode
                if (zoomMode === 'hover') {
                    zoomLens.style.display = 'none';
                    zoomResult.style.borderRadius = '0';
                    zoomResult.style.boxShadow = 'none';
                    
                    // For hover mode, make the zoom result cover the entire image
                    const rect = mainImageContainer.getBoundingClientRect();
                    zoomResult.style.width = rect.width + 'px';
                    zoomResult.style.height = rect.height + 'px';
                    zoomResult.style.top = '0';
                    zoomResult.style.left = '0';
                    zoomResult.style.position = 'absolute';
                } else {
                    // Lens mode
                    zoomLens.style.display = 'block';
                    zoomResult.style.borderRadius = '4px';
                    zoomResult.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
                    
                    // Position the zoom result outside the image
                    const rect = mainImageContainer.getBoundingClientRect();
                    const isMobile = window.innerWidth <= 768;
                    
                    if (isMobile) {
                        // On mobile, position the zoom result over the image but smaller
                        zoomResult.style.width = '70%';
                        zoomResult.style.height = '70%';
                        zoomResult.style.top = '15%';
                        zoomResult.style.left = '15%';
                    } else {
                        // On desktop, position to the right
                        zoomResult.style.width = '300px';
                        zoomResult.style.height = '300px';
                        zoomResult.style.top = '0';
                        zoomResult.style.left = `${rect.width + 20}px`;
                        
                        // Adjust if it would go off-screen
                        const resultRect = zoomResult.getBoundingClientRect();
                        if (resultRect.right > window.innerWidth) {
                            zoomResult.style.left = 'auto';
                            zoomResult.style.right = '0';
                            zoomResult.style.top = `${rect.height + 20}px`;
                        }
                    }
                }
                
                // Show zoom instructions
                const zoomInstructions = document.querySelector('.zoom-instructions');
                if (zoomInstructions) {
                    if (zoomMode === 'hover') {
                        zoomInstructions.innerHTML = '<i class="fas fa-search-plus"></i> Use mouse wheel or controls to adjust zoom level';
                    } else {
                        zoomInstructions.innerHTML = '<i class="fas fa-search"></i> Move cursor to see details | Use mouse wheel to adjust zoom level';
                    }
                    
                    setTimeout(() => {
                        if (zoomActive) {
                            if (zoomMode === 'hover') {
                                zoomInstructions.innerHTML = '<i class="fas fa-search-plus"></i> Hover over image to zoom';
                            } else {
                                zoomInstructions.innerHTML = '<i class="fas fa-search"></i> Move cursor to see details';
                            }
                        }
                    }, 3000);
                }
            }
            
            // Stop zoom
            function stopZoom() {
                zoomActive = false;
                mainImageContainer.classList.remove('zooming');
                isDragging = false;
                
                // Reset zoom instructions
                const zoomInstructions = document.querySelector('.zoom-instructions');
                if (zoomInstructions) {
                    if (zoomMode === 'hover') {
                        zoomInstructions.innerHTML = '<i class="fas fa-search-plus"></i> Hover over image to zoom | Use mouse wheel to adjust zoom level';
                    } else {
                        zoomInstructions.innerHTML = '<i class="fas fa-search"></i> Click image to use lens zoom | Use mouse wheel to adjust zoom level';
                    }
                }
            }
            
            // Move zoom on mouse move
            function moveZoom(e) {
                if (!zoomActive) return;
                
                // Get cursor position
                const pos = getCursorPos(e);
                
                if (zoomMode === 'hover') {
                    // For hover mode, move the background image directly
                    const rect = mainImageContainer.getBoundingClientRect();
                    const xPercent = pos.x / mainProductImage.width;
                    const yPercent = pos.y / mainProductImage.height;
                    
                    // Calculate background position
                    const bgPosX = xPercent * (mainProductImage.width * cx - rect.width);
                    const bgPosY = yPercent * (mainProductImage.height * cy - rect.height);
                    
                    // Set background position for zoom result
                    zoomResult.style.backgroundPosition = `-${bgPosX}px -${bgPosY}px`;
                } else {
                    // Lens mode - traditional lens movement
                    // Calculate lens position
                    let x = pos.x - (zoomLens.offsetWidth / 2);
                    let y = pos.y - (zoomLens.offsetHeight / 2);
                    
                    // Prevent lens from going outside the image
                    if (x > mainProductImage.width - zoomLens.offsetWidth) {
                        x = mainProductImage.width - zoomLens.offsetWidth;
                    }
                    if (x < 0) x = 0;
                    if (y > mainProductImage.height - zoomLens.offsetHeight) {
                        y = mainProductImage.height - zoomLens.offsetHeight;
                    }
                    if (y < 0) y = 0;
                    
                    // Set lens position
                    zoomLens.style.left = x + "px";
                    zoomLens.style.top = y + "px";
                    
                    // Set background position for zoom result
                    zoomResult.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
                }
            }
            
            // Handle touch start
            function handleTouchStart(e) {
                if (e.touches.length === 1) {
                    // Single touch - start zoom
                    e.preventDefault();
                    
                    // Always use lens mode on mobile for better usability
                    const previousMode = zoomMode;
                    zoomMode = 'lens';
                    
                    startZoom();
                    moveZoomTouch(e);
                    
                    // Enable dragging
                    isDragging = true;
                    
                    // Create a close button for mobile zoom
                    if (!document.querySelector('.mobile-zoom-close')) {
                        const closeBtn = document.createElement('button');
                        closeBtn.className = 'mobile-zoom-close';
                        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                        closeBtn.setAttribute('aria-label', 'Close zoom view');
                        
                        closeBtn.addEventListener('click', function() {
                            stopZoom();
                            zoomMode = previousMode; // Restore previous zoom mode
                            this.remove();
                        });
                        
                        mainImageContainer.appendChild(closeBtn);
                    }
                } else if (e.touches.length === 2) {
                    // Pinch to zoom
                    e.preventDefault();
                    
                    // Always use hover mode for pinch zoom
                    const previousMode = zoomMode;
                    zoomMode = 'hover';
                    
                    startZoom();
                    
                    // Calculate initial distance between two fingers
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    lastTouchDistance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );
                }
            }
            
            // Handle touch move
            function handleTouchMove(e) {
                if (!zoomActive) return;
                
                if (e.touches.length === 1 && isDragging) {
                    // Single touch - move lens
                    e.preventDefault();
                    moveZoomTouch(e);
                } else if (e.touches.length === 2) {
                    // Pinch to zoom
                    e.preventDefault();
                    
                    // Calculate new distance between two fingers
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    const newTouchDistance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );
                    
                    // Calculate zoom change
                    const touchDiff = newTouchDistance - lastTouchDistance;
                    if (Math.abs(touchDiff) > 10) {
                        // Adjust zoom level based on pinch
                        if (touchDiff > 0) {
                            // Zoom in
                            zoomLevel = Math.min(zoomLevel + 0.2, maxZoomLevel);
                        } else {
                            // Zoom out
                            zoomLevel = Math.max(zoomLevel - 0.2, minZoomLevel);
                        }
                        updateZoom();
                        lastTouchDistance = newTouchDistance;
                    }
                    
                    // Move lens to center of pinch
                    const centerX = (touch1.clientX + touch2.clientX) / 2;
                    const centerY = (touch1.clientY + touch2.clientY) / 2;
                    
                    const rect = mainProductImage.getBoundingClientRect();
                    const x = centerX - rect.left - (zoomLens.offsetWidth / 2);
                    const y = centerY - rect.top - (zoomLens.offsetHeight / 2);
                    
                    if (zoomMode === 'hover') {
                        // For hover mode, calculate background position
                        const xPercent = x / mainProductImage.width;
                        const yPercent = y / mainProductImage.height;
                        
                        // Calculate background position
                        const bgPosX = xPercent * (mainProductImage.width * cx - rect.width);
                        const bgPosY = yPercent * (mainProductImage.height * cy - rect.height);
                        
                        // Set background position for zoom result
                        zoomResult.style.backgroundPosition = `-${bgPosX}px -${bgPosY}px`;
                    } else {
                        // Update lens position
                        zoomLens.style.left = x + "px";
                        zoomLens.style.top = y + "px";
                        
                        // Update zoom result
                        zoomResult.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
                    }
                }
            }
            
            // Handle touch end
            function handleTouchEnd(e) {
                if (e.touches.length === 0) {
                    // All fingers lifted - stop zoom only if no close button is present
                    // This allows the user to close the zoom view manually on mobile
                    if (!document.querySelector('.mobile-zoom-close')) {
                        stopZoom();
                    }
                } else if (e.touches.length === 1) {
                    // One finger remains - continue with single touch
                    isDragging = true;
                    moveZoomTouch(e);
                }
            }
            
            // Move zoom on touch
            function moveZoomTouch(e) {
                if (!zoomActive) return;
                
                // Get touch position
                const touch = e.touches[0] || e.changedTouches[0];
                const pos = getCursorPosTouch(touch);
                
                if (zoomMode === 'hover') {
                    // For hover mode, move the background image directly
                    const rect = mainImageContainer.getBoundingClientRect();
                    const xPercent = pos.x / mainProductImage.width;
                    const yPercent = pos.y / mainProductImage.height;
                    
                    // Calculate background position
                    const bgPosX = xPercent * (mainProductImage.width * cx - rect.width);
                    const bgPosY = yPercent * (mainProductImage.height * cy - rect.height);
                    
                    // Set background position for zoom result
                    zoomResult.style.backgroundPosition = `-${bgPosX}px -${bgPosY}px`;
                } else {
                    // Lens mode - traditional lens movement
                    // Calculate lens position
                    let x = pos.x - (zoomLens.offsetWidth / 2);
                    let y = pos.y - (zoomLens.offsetHeight / 2);
                    
                    // Prevent lens from going outside the image
                    if (x > mainProductImage.width - zoomLens.offsetWidth) {
                        x = mainProductImage.width - zoomLens.offsetWidth;
                    }
                    if (x < 0) x = 0;
                    if (y > mainProductImage.height - zoomLens.offsetHeight) {
                        y = mainProductImage.height - zoomLens.offsetHeight;
                    }
                    if (y < 0) y = 0;
                    
                    // Set lens position
                    zoomLens.style.left = x + "px";
                    zoomLens.style.top = y + "px";
                    
                    // Set background position for zoom result
                    zoomResult.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
                }
            }
            
            // Get cursor position
            function getCursorPos(e) {
                const rect = mainProductImage.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                return { x, y };
            }
            
            // Get touch position
            function getCursorPosTouch(touch) {
                const rect = mainProductImage.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                return { x, y };
            }
            
            // Initialize zoom when image is loaded
            if (mainProductImage.complete) {
                initZoom();
            } else {
                mainProductImage.onload = initZoom;
            }
            
            // Update zoom when window is resized
            window.addEventListener('resize', initZoom);
        }
    }
    
    // Add to cart functionality with enhanced feedback
    function addToCart() {
        if (!currentProduct) return;
        
        // Get selected quantity
        const quantity = parseInt(quantityInput.value);
        
        // Check if variations are required but not selected
        let variationsRequired = false;
        let variationsSelected = true;
        let missingVariations = [];
        
        // Check size selection if visible
        if (!sizeVariation.classList.contains('hidden')) {
            variationsRequired = true;
            const activeSize = sizeVariation.querySelector('.size-option.active');
            if (!activeSize) {
                variationsSelected = false;
                missingVariations.push('Size');
                
                // Highlight size options to indicate selection is required
                sizeVariation.classList.add('highlight-required');
                setTimeout(() => {
                    sizeVariation.classList.remove('highlight-required');
                }, 1000);
                
                // Scroll to the size variation
                sizeVariation.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        // Check color selection if visible
        if (!colorVariation.classList.contains('hidden')) {
            variationsRequired = true;
            const activeColor = colorVariation.querySelector('.color-option.active');
            if (!activeColor) {
                variationsSelected = false;
                missingVariations.push('Color');
                
                // Highlight color options to indicate selection is required
                colorVariation.classList.add('highlight-required');
                setTimeout(() => {
                    colorVariation.classList.remove('highlight-required');
                }, 1000);
                
                // If size is selected, scroll to color variation
                if (!missingVariations.includes('Size')) {
                    colorVariation.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
        
        // Check material selection if visible
        const materialVariation = document.querySelector('.material-variation');
        if (materialVariation && !materialVariation.classList.contains('hidden')) {
            variationsRequired = true;
            const activeMaterial = materialVariation.querySelector('.material-option.active');
            if (!activeMaterial) {
                variationsSelected = false;
                
                // Get the appropriate label based on product category
                let materialLabel = 'Material';
                if (currentProduct.category === 'electronics') {
                    materialLabel = 'Storage';
                } else if (currentProduct.category === 'jewelery') {
                    materialLabel = 'Metal';
                }
                
                missingVariations.push(materialLabel);
                
                // Highlight material options to indicate selection is required
                materialVariation.classList.add('highlight-required');
                setTimeout(() => {
                    materialVariation.classList.remove('highlight-required');
                }, 1000);
                
                // If other variations are selected, scroll to material variation
                if (!missingVariations.includes('Size') && !missingVariations.includes('Color')) {
                    materialVariation.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
        
        // If variations are required but not selected, show error and return
        if (variationsRequired && !variationsSelected) {
            const missingText = missingVariations.join(', ');
            showNotification(`Please select: ${missingText}`);
            
            // Shake the add to cart button to indicate error
            addToCartBtn.classList.add('shake');
            setTimeout(() => {
                addToCartBtn.classList.remove('shake');
            }, 500);
            
            return;
        }
        
        // Get selected size (if applicable)
        let selectedSizeValue = null;
        if (!sizeVariation.classList.contains('hidden')) {
            const activeSize = sizeVariation.querySelector('.size-option.active');
            if (activeSize) {
                selectedSizeValue = activeSize.getAttribute('data-size');
            }
        }
        
        // Get selected color (if applicable)
        let selectedColorValue = null;
        if (!colorVariation.classList.contains('hidden')) {
            const activeColor = colorVariation.querySelector('.color-option.active');
            if (activeColor) {
                selectedColorValue = activeColor.getAttribute('data-color');
            }
        }
        
        // Get selected material (if applicable)
        let selectedMaterialValue = null;
        if (materialVariation && !materialVariation.classList.contains('hidden')) {
            const activeMaterial = materialVariation.querySelector('.material-option.active');
            if (activeMaterial) {
                selectedMaterialValue = activeMaterial.getAttribute('data-material');
            }
        }
        
        // Get current price (which may have been modified by variations)
        let currentPrice = currentProduct.price;
        const priceElement = productPrice.querySelector('.price-update');
        if (priceElement) {
            currentPrice = parseFloat(priceElement.textContent.replace('$', ''));
        }
        
        // Create cart item with enhanced details
        const cartItem = {
            id: currentProduct.id,
            title: currentProduct.title,
            price: currentPrice,
            image: currentProduct.image,
            quantity: quantity,
            size: selectedSizeValue,
            color: selectedColorValue,
            material: selectedMaterialValue,
            category: currentProduct.category,
            addedAt: new Date().toISOString()
        };
        
        // Get current cart from localStorage or initialize empty array
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if product is already in cart
        const existingItemIndex = cart.findIndex(item => {
            // Match by ID and options (size, color, and material)
            return item.id === cartItem.id && 
                   item.size === cartItem.size && 
                   item.color === cartItem.color &&
                   item.material === cartItem.material;
        });
        
        let isNewItem = false;
        
        if (existingItemIndex >= 0) {
            // Update quantity if product already in cart
            cart[existingItemIndex].quantity += quantity;
            cart[existingItemIndex].price = currentPrice; // Update price in case it changed
            cart[existingItemIndex].addedAt = cartItem.addedAt; // Update timestamp
        } else {
            // Add new product to cart
            cart.push(cartItem);
            isNewItem = true;
        }
        
        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count in header
        updateCartCount(cart);
        
        // Create a more detailed notification
        const productName = currentProduct.title;
        const totalPrice = (currentPrice * quantity).toFixed(2);
        
        // Build variation details for notification
        let variationDetails = '';
        if (selectedSizeValue) variationDetails += `Size: ${selectedSizeValue}, `;
        if (selectedColorValue) variationDetails += `Color: ${selectedColorValue}, `;
        if (selectedMaterialValue) {
            // Adjust label based on product category
            let materialLabel = 'Material';
            if (currentProduct.category === 'electronics') {
                materialLabel = 'Storage';
            } else if (currentProduct.category === 'jewelery') {
                materialLabel = 'Metal';
            }
            variationDetails += `${materialLabel}: ${selectedMaterialValue}, `;
        }
        
        // Remove trailing comma and space
        if (variationDetails) {
            variationDetails = variationDetails.slice(0, -2);
        }
        
        // Show enhanced notification
        if (isNewItem) {
            showCartNotification(
                'Added to Cart',
                `${quantity} × ${productName.length > 25 ? productName.substring(0, 25) + '...' : productName}`,
                variationDetails,
                `$${totalPrice}`,
                currentProduct.image
            );
        } else {
            showCartNotification(
                'Cart Updated',
                `Added ${quantity} more to your cart`,
                variationDetails,
                `Total in cart: ${cart[existingItemIndex].quantity}`,
                currentProduct.image
            );
        }
        
        // Add animation to button
        addToCartBtn.classList.add('added');
        addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
        
        setTimeout(() => {
            addToCartBtn.classList.remove('added');
            addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        }, 1500);
        
        // Add animation to cart icon in header
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            // Add flying animation from product image to cart
            const productImg = document.querySelector('.main-product-image');
            if (productImg) {
                const flyingImg = document.createElement('img');
                flyingImg.src = productImg.src;
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
    
    // Show enhanced notification
    function showNotification(message) {
        // Check if the notification function exists in app.js
        if (typeof window.showNotification === 'function') {
            window.showNotification(message);
        } else {
            // Enhanced notification implementation
            // Remove any existing notifications
            const existingNotification = document.querySelector('.cart-notification');
            if (existingNotification) {
                existingNotification.remove();
            }
            
            // Create new notification
            const notification = document.createElement('div');
            notification.className = 'cart-notification';
            
            // Get product details
            const productName = currentProduct.title;
            const productPrice = currentProduct.price.toFixed(2);
            const quantity = parseInt(quantityInput.value);
            const totalPrice = (currentProduct.price * quantity).toFixed(2);
            
            // Create notification content
            notification.innerHTML = `
                <div class="cart-notification-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="cart-notification-content">
                    <div class="cart-notification-title">Added to Cart</div>
                    <div class="cart-notification-message">
                        ${quantity} x ${productName.length > 25 ? productName.substring(0, 25) + '...' : productName}
                        <br>
                        <strong>Total: $${totalPrice}</strong>
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
                        document.body.removeChild(notification);
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
    
    // Helper function to update color tooltip
    function updateColorTooltip(colorOption, colorName) {
        // Check if tooltip exists
        let tooltip = colorOption.querySelector('.tooltip');
        
        if (!tooltip) {
            // Create tooltip if it doesn't exist
            tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            colorOption.appendChild(tooltip);
        }
        
        // Update tooltip text
        tooltip.textContent = colorName;
    }
});