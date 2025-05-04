document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartShipping = document.getElementById('cart-shipping');
    const cartTax = document.getElementById('cart-tax');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const promoCodeInput = document.getElementById('promo-code');
    const applyPromoBtn = document.getElementById('apply-promo');
    const emptyCartElement = document.querySelector('.empty-cart');
    const cartSummary = document.getElementById('cart-summary');
    const cartActions = document.querySelector('.cart-actions');
    const loadingSpinner = document.querySelector('.loading-spinner');
    
    // Cart state
    let cart = [];
    let promoCode = null;
    let promoDiscount = 0;
    
    // Constants
    const SHIPPING_THRESHOLD = 50; // Free shipping for orders over $50
    const BASE_SHIPPING = 5.99;
    const TAX_RATE = 0.08; // 8% tax
    
    // Initialize cart
    initCart();
    
    // Event listeners
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    
    // Initialize cart from localStorage
    function initCart() {
        // Get cart from localStorage
        try {
            const cartData = localStorage.getItem('cart');
            cart = cartData ? JSON.parse(cartData) : [];
            
            // Validate cart data
            if (!Array.isArray(cart)) {
                console.error('Invalid cart data:', cart);
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
            }
        } catch (error) {
            console.error('Error parsing cart data:', error);
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        
        // Update cart count in header
        updateCartCount();
        
        // Preload images before rendering cart
        if (cart.length > 0) {
            const imagesToPreload = cart.map(item => item.image).filter(Boolean);
            preloadImages(imagesToPreload, () => {
                // Render cart items after preloading
                renderCart();
            });
        } else {
            // If no images to preload, just render the cart
            renderCart();
        }
    }
    
    // Preload images function
    function preloadImages(imageUrls, callback) {
        let loadedCount = 0;
        const totalImages = imageUrls.length;
        
        // If no images to preload, call the callback immediately
        if (totalImages === 0) {
            if (typeof callback === 'function') callback();
            return;
        }
        
        // Set a timeout to ensure the callback is called even if images fail to load
        const timeoutId = setTimeout(() => {
            if (loadedCount < totalImages) {
                console.log('Image preloading timed out');
                if (typeof callback === 'function') callback();
            }
        }, 3000); // 3 second timeout
        
        // Preload each image
        imageUrls.forEach(url => {
            if (!url) {
                loadedCount++;
                if (loadedCount === totalImages) {
                    clearTimeout(timeoutId);
                    if (typeof callback === 'function') callback();
                }
                return;
            }
            
            const img = new Image();
            
            img.onload = img.onerror = function() {
                loadedCount++;
                if (loadedCount === totalImages) {
                    clearTimeout(timeoutId);
                    if (typeof callback === 'function') callback();
                }
            };
            
            img.src = url;
        });
    }
    
    // Render cart items
    function renderCart() {
        if (!cartItemsContainer) return;
        
        // Remove loading spinner
        if (loadingSpinner && loadingSpinner.parentNode) {
            loadingSpinner.remove();
        }
        
        // Check if cart is empty
        if (!cart || cart.length === 0) {
            showEmptyCart();
            return;
        }
        
        // Show cart summary and actions
        if (cartSummary) {
            cartSummary.style.display = 'block';
        }
        
        if (cartActions) {
            cartActions.style.display = 'flex';
        }
        
        // Hide empty cart message
        if (emptyCartElement) {
            emptyCartElement.classList.add('hidden');
        }
        
        // Clear existing cart items
        const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
        existingItems.forEach(item => item.remove());
        
        // Render each cart item
        cart.forEach((item, index) => {
            const cartItemElement = createCartItemElement(item, index);
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Update cart summary
        updateCartSummary();
        
        // Enable checkout button
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.classList.remove('disabled');
        }
    }
    
    // Create cart item element
    function createCartItemElement(item, index) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.index = index;
        
        // Ensure item has all required properties
        if (!item.id) item.id = index;
        if (!item.title) item.title = 'Product';
        if (!item.price) item.price = 0;
        if (!item.image) item.image = 'assets/placeholder.png';
        if (!item.quantity) item.quantity = 1;
        
        // Calculate item total
        const itemTotal = item.price * item.quantity;
        
        // Build variations HTML
        let variationsHTML = '';
        if (item.size) {
            variationsHTML += `<span class="cart-item-variation">Size: ${item.size}</span>`;
        }
        if (item.color) {
            variationsHTML += `<span class="cart-item-variation">Color: ${item.color}</span>`;
        }
        if (item.material) {
            // Adjust label based on product category
            let materialLabel = 'Material';
            if (item.category === 'electronics') {
                materialLabel = 'Storage';
            } else if (item.category === 'jewelery') {
                materialLabel = 'Metal';
            }
            variationsHTML += `<span class="cart-item-variation">${materialLabel}: ${item.material}</span>`;
        }
        
        // Create cart item HTML
        cartItem.innerHTML = `
            <div class="cart-item-image-container">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/100x100?text=Product'" loading="lazy">
            </div>
            
            <div class="cart-item-details">
                <h3 class="cart-item-title">
                    <a href="product.html?id=${item.id}">${item.title}</a>
                </h3>
                
                <div class="cart-item-variations">
                    ${variationsHTML}
                </div>
                
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                
                <div class="cart-item-actions">
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-index="${index}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" data-index="${index}">
                        <button class="quantity-btn plus" data-index="${index}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash-alt"></i> Remove
                    </button>
                </div>
            </div>
            
            <div class="cart-item-total">
                $${itemTotal.toFixed(2)}
            </div>
        `;
        
        // Add event listeners to the cart item
        const minusBtn = cartItem.querySelector('.quantity-btn.minus');
        const plusBtn = cartItem.querySelector('.quantity-btn.plus');
        const quantityInput = cartItem.querySelector('.quantity-input');
        const removeBtn = cartItem.querySelector('.remove-item');
        const itemImage = cartItem.querySelector('.cart-item-image');
        
        // Handle image loading
        if (itemImage) {
            // Add loading spinner to image container
            const imageContainer = itemImage.parentElement;
            const spinner = document.createElement('div');
            spinner.className = 'image-loading-spinner';
            spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            imageContainer.appendChild(spinner);
            
            // Handle image load event
            itemImage.onload = function() {
                // Remove spinner
                if (spinner.parentNode) {
                    spinner.parentNode.removeChild(spinner);
                }
                // Fade in the image
                itemImage.style.opacity = '1';
            };
            
            // Handle image error
            itemImage.onerror = function() {
                // Remove spinner
                if (spinner.parentNode) {
                    spinner.parentNode.removeChild(spinner);
                }
                // Show fallback image
                this.src = 'https://via.placeholder.com/100x100?text=Product';
                this.style.opacity = '1';
            };
        }
        
        if (minusBtn) {
            minusBtn.addEventListener('click', function() {
                updateItemQuantity(index, -1);
            });
        }
        
        if (plusBtn) {
            plusBtn.addEventListener('click', function() {
                updateItemQuantity(index, 1);
            });
        }
        
        if (quantityInput) {
            quantityInput.addEventListener('change', function() {
                const newQuantity = parseInt(this.value);
                if (isNaN(newQuantity) || newQuantity < 1) {
                    this.value = 1;
                    updateItemQuantity(index, 0, 1);
                } else if (newQuantity > 99) {
                    this.value = 99;
                    updateItemQuantity(index, 0, 99);
                } else {
                    updateItemQuantity(index, 0, newQuantity);
                }
            });
        }
        
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                removeCartItem(index);
            });
        }
        
        return cartItem;
    }
    
    // Update item quantity
    function updateItemQuantity(index, change, newQuantity = null) {
        if (index < 0 || index >= cart.length) return;
        
        const item = cart[index];
        const oldQuantity = item.quantity;
        
        if (newQuantity !== null) {
            // Set to specific quantity
            item.quantity = newQuantity;
        } else {
            // Increment/decrement quantity
            item.quantity += change;
            
            // Ensure quantity is within valid range
            if (item.quantity < 1) item.quantity = 1;
            if (item.quantity > 99) item.quantity = 99;
        }
        
        // If quantity didn't change, don't proceed
        if (oldQuantity === item.quantity) return;
        
        // Update localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update UI
        const quantityInput = document.querySelector(`.quantity-input[data-index="${index}"]`);
        if (quantityInput) {
            quantityInput.value = item.quantity;
            
            // Add animation
            quantityInput.classList.add('pulse');
            setTimeout(() => {
                quantityInput.classList.remove('pulse');
            }, 300);
        }
        
        // Update item total
        const itemTotal = item.price * item.quantity;
        const itemTotalElement = document.querySelector(`.cart-item[data-index="${index}"] .cart-item-total`);
        if (itemTotalElement) {
            itemTotalElement.textContent = `$${itemTotal.toFixed(2)}`;
            
            // Add animation
            itemTotalElement.classList.add('pulse');
            setTimeout(() => {
                itemTotalElement.classList.remove('pulse');
            }, 300);
        }
        
        // Update cart count in header
        updateCartCount();
        
        // Update cart summary
        updateCartSummary();
        
        // Show feedback notification for quantity change
        if (change > 0 || (newQuantity !== null && newQuantity > oldQuantity)) {
            showNotification(`Increased quantity to ${item.quantity}`, 'info');
        } else if (change < 0 || (newQuantity !== null && newQuantity < oldQuantity)) {
            showNotification(`Decreased quantity to ${item.quantity}`, 'info');
        }
    }
    
    // Remove cart item
    function removeCartItem(index) {
        if (index < 0 || index >= cart.length) return;
        
        // Store item info for notification
        const removedItem = cart[index];
        
        // Get the item element
        const itemElement = document.querySelector(`.cart-item[data-index="${index}"]`);
        
        if (itemElement) {
            // Add animation
            itemElement.style.opacity = '0';
            itemElement.style.transform = 'translateX(20px)';
            itemElement.style.transition = 'all 0.3s ease';
            
            // Remove after animation
            setTimeout(() => {
                // Remove item from cart array
                cart.splice(index, 1);
                
                // Update localStorage
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Re-render cart (this will handle empty cart state)
                renderCart();
                
                // Update cart count in header
                updateCartCount();
                
                // Show notification
                showNotification(`Removed "${removedItem.title.length > 20 ? removedItem.title.substring(0, 20) + '...' : removedItem.title}" from cart`, 'info');
            }, 300);
        } else {
            // If element not found, just update the data
            const removedItemTitle = cart[index].title;
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
            
            // Show notification
            showNotification(`Removed "${removedItem.title.length > 20 ? removedItem.title.substring(0, 20) + '...' : removedItem.title}" from cart`, 'info');
        }
    }
    
    // Clear cart
    function clearCart() {
        // If cart is already empty, don't do anything
        if (!cart || cart.length === 0) {
            showNotification('Your cart is already empty', 'info');
            return;
        }
        
        // Confirm before clearing
        if (!confirm('Are you sure you want to clear your cart? This action cannot be undone.')) return;
        
        // Store the number of items for the notification
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Add fade-out animation to all cart items
        const cartItems = document.querySelectorAll('.cart-item');
        cartItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';
            item.style.transition = 'all 0.3s ease';
        });
        
        // Clear after animation
        setTimeout(() => {
            // Clear cart array
            cart = [];
            
            // Reset promo code
            promoCode = null;
            promoDiscount = 0;
            
            // Update localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Re-render cart
            renderCart();
            
            // Update cart count in header
            updateCartCount();
            
            // Show notification
            showNotification(`Your cart has been cleared (${itemCount} ${itemCount === 1 ? 'item' : 'items'} removed)`, 'info');
        }, 300);
    }
    
    // Update cart summary
    function updateCartSummary() {
        if (!cartSubtotal || !cartShipping || !cartTax || !cartTotal) return;
        
        // Calculate subtotal
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Calculate shipping
        let shipping = subtotal > SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING;
        
        // Calculate tax
        const tax = subtotal * TAX_RATE;
        
        // Apply promo discount if any
        let discount = 0;
        if (promoCode) {
            discount = subtotal * promoDiscount;
        }
        
        // Calculate total
        const total = subtotal + shipping + tax - discount;
        
        // Update UI with animations
        // Subtotal
        const oldSubtotal = cartSubtotal.textContent;
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (oldSubtotal !== cartSubtotal.textContent) {
            cartSubtotal.classList.add('pulse');
            setTimeout(() => cartSubtotal.classList.remove('pulse'), 300);
        }
        
        // Shipping
        const newShippingText = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
        if (cartShipping.textContent !== newShippingText) {
            cartShipping.textContent = newShippingText;
            cartShipping.classList.add('pulse');
            setTimeout(() => cartShipping.classList.remove('pulse'), 300);
            
            // Show notification if shipping is free
            if (shipping === 0 && subtotal > 0) {
                showNotification('Your order qualifies for FREE shipping!', 'success');
            }
        } else {
            cartShipping.textContent = newShippingText;
        }
        
        // Tax
        cartTax.textContent = `$${tax.toFixed(2)}`;
        
        // Total
        const oldTotal = cartTotal.textContent;
        cartTotal.textContent = `$${total.toFixed(2)}`;
        if (oldTotal !== cartTotal.textContent) {
            cartTotal.classList.add('pulse');
            setTimeout(() => cartTotal.classList.remove('pulse'), 300);
        }
        
        // Update checkout button
        if (checkoutBtn) {
            checkoutBtn.innerHTML = `<i class="fas fa-lock"></i> Proceed to Checkout - $${total.toFixed(2)}`;
        }
        
        // Show/hide promo code applied message
        const existingPromoMessage = document.querySelector('.promo-applied');
        if (existingPromoMessage) {
            existingPromoMessage.remove();
        }
        
        if (promoCode && promoDiscount > 0) {
            const promoMessage = document.createElement('div');
            promoMessage.className = 'promo-applied';
            promoMessage.innerHTML = `
                <span class="promo-applied-text">
                    Promo code "${promoCode}" applied: -$${discount.toFixed(2)}
                </span>
                <button class="remove-promo">Remove</button>
            `;
            
            // Insert after promo code input
            const promoCodeContainer = document.querySelector('.promo-code');
            if (promoCodeContainer) {
                promoCodeContainer.after(promoMessage);
                
                // Add event listener to remove promo button
                const removePromoBtn = promoMessage.querySelector('.remove-promo');
                if (removePromoBtn) {
                    removePromoBtn.addEventListener('click', removePromoCode);
                }
            }
        }
    }
    
    // Apply promo code
    function applyPromoCode() {
        const code = promoCodeInput.value.trim().toUpperCase();
        
        if (!code) {
            showNotification('Please enter a promo code', 'error');
            // Add shake animation to input
            promoCodeInput.classList.add('shake');
            setTimeout(() => {
                promoCodeInput.classList.remove('shake');
            }, 500);
            return;
        }
        
        // Check if cart is empty
        if (!cart || cart.length === 0) {
            showNotification('Your cart is empty. Add items before applying a promo code.', 'error');
            return;
        }
        
        // Check if promo code is already applied
        if (promoCode === code) {
            showNotification('This promo code is already applied', 'info');
            return;
        }
        
        // Check if promo code is valid (demo codes)
        let discount = 0;
        let discountMessage = '';
        
        switch (code) {
            case 'WELCOME10':
                discount = 0.1; // 10% off
                discountMessage = '10% off your order';
                break;
            case 'SUMMER20':
                discount = 0.2; // 20% off
                discountMessage = '20% off your order';
                break;
            case 'FREESHIP':
                // Special case for free shipping
                const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                if (subtotal < SHIPPING_THRESHOLD) {
                    // Only apply if shipping isn't already free
                    promoCode = code;
                    cartShipping.textContent = 'FREE';
                    updateCartSummary();
                    
                    // Add success animation to input
                    promoCodeInput.classList.add('success');
                    setTimeout(() => {
                        promoCodeInput.classList.remove('success');
                    }, 1000);
                    
                    showNotification('Free shipping applied!', 'success');
                    
                    // Clear input
                    promoCodeInput.value = '';
                    return;
                } else {
                    showNotification('Your order already qualifies for free shipping', 'info');
                    return;
                }
            default:
                // Try some "smart" suggestions
                if (code === 'WELCOME' || code === 'WELCOME20') {
                    showNotification('Invalid code. Did you mean WELCOME10?', 'error');
                } else if (code === 'SUMMER' || code === 'SUMMER10') {
                    showNotification('Invalid code. Did you mean SUMMER20?', 'error');
                } else if (code === 'FREE' || code === 'SHIPPING') {
                    showNotification('Invalid code. Did you mean FREESHIP?', 'error');
                } else {
                    showNotification('Invalid promo code', 'error');
                }
                
                // Add shake animation to input
                promoCodeInput.classList.add('shake');
                setTimeout(() => {
                    promoCodeInput.classList.remove('shake');
                }, 500);
                return;
        }
        
        // Apply the promo code
        promoCode = code;
        promoDiscount = discount;
        
        // Update cart summary
        updateCartSummary();
        
        // Add success animation to input
        promoCodeInput.classList.add('success');
        setTimeout(() => {
            promoCodeInput.classList.remove('success');
        }, 1000);
        
        // Show notification
        showNotification(`Promo code applied: ${discountMessage}`, 'success');
        
        // Clear input
        promoCodeInput.value = '';
    }
    
    // Remove promo code
    function removePromoCode() {
        // Store the old promo code for the notification
        const oldPromoCode = promoCode;
        
        // Reset promo code values
        promoCode = null;
        promoDiscount = 0;
        
        // Update cart summary
        updateCartSummary();
        
        // Remove promo message
        const promoMessage = document.querySelector('.promo-applied');
        if (promoMessage) {
            // Add fade-out animation
            promoMessage.style.opacity = '0';
            promoMessage.style.transform = 'translateX(10px)';
            promoMessage.style.transition = 'all 0.3s ease';
            
            // Remove after animation
            setTimeout(() => {
                if (promoMessage.parentNode) {
                    promoMessage.parentNode.removeChild(promoMessage);
                }
            }, 300);
        }
        
        // Show notification
        showNotification(`Promo code "${oldPromoCode}" has been removed`, 'info');
    }
    
    // Proceed to checkout
    function proceedToCheckout() {
        // In a real app, this would redirect to checkout page
        // For demo purposes, just show a notification
        showNotification('This is a demo. Checkout functionality is not implemented.');
    }
    
    // Show empty cart
    function showEmptyCart() {
        // Clear any existing cart items
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
        }
        
        // Create empty cart message if it doesn't exist
        if (!emptyCartElement) {
            const emptyCart = document.createElement('div');
            emptyCart.className = 'empty-cart';
            emptyCart.innerHTML = `
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any products to your cart yet.</p>
                <a href="products.html" class="cta-button primary">Start Shopping</a>
            `;
            
            if (cartItemsContainer) {
                cartItemsContainer.appendChild(emptyCart);
                emptyCartElement = emptyCart;
            }
        } else {
            // Show existing empty cart message
            emptyCartElement.classList.remove('hidden');
        }
        
        // Hide cart summary and actions
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }
        
        if (cartActions) {
            cartActions.style.display = 'none';
        }
        
        // Disable checkout button
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('disabled');
        }
    }
    
    // Update cart count in header
    function updateCartCount() {
        // Use the global updateCartCount function if available
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        } else {
            // Fallback implementation
            const cartCount = document.querySelector('.cart-count');
            if (!cartCount) return;
            
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            // Add animation
            cartCount.classList.add('bounce');
            setTimeout(() => {
                cartCount.classList.remove('bounce');
            }, 500);
        }
    }
    

    
    // Show notification
    function showNotification(message, type = 'success') {
        // Use the global showNotification function if available
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            // Fallback implementation
            console.log(`Notification (${type}): ${message}`);
            alert(message);
        }
    }
});

// Enhanced cart notification function for product-detail.js to use
function showCartNotification(title, message, variations, price, image) {
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
        <img src="${image || 'https://via.placeholder.com/50x50?text=Product'}" alt="Product" class="cart-notification-image" onerror="this.src='https://via.placeholder.com/50x50?text=Product'">
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