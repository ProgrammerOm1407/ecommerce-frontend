/**
 * Image Optimization Script
 * Handles responsive images, lazy loading, and WebP conversion
 */

// Configuration
const IMAGE_SIZES = {
    small: 300,
    medium: 600,
    large: 1200
};

// Helper function to generate responsive image URLs
function getResponsiveImageUrl(originalUrl, size) {
    // Check if the URL is from an external API like fakestoreapi
    if (originalUrl.includes('fakestoreapi.com') || originalUrl.includes('http')) {
        // For external images, we'll use a service like Cloudinary or Imgix
        // This is a placeholder - in production, you would use a real image CDN
        return originalUrl;
    }
    
    // For local images, generate the appropriate size
    const urlParts = originalUrl.split('.');
    const extension = urlParts.pop();
    const basePath = urlParts.join('.');
    
    // Check if WebP is supported
    const supportsWebP = localStorage.getItem('supportsWebP');
    
    if (supportsWebP === 'true' && extension !== 'svg') {
        return `${basePath}-${size}.webp`;
    }
    
    return `${basePath}-${size}.${extension}`;
}

// Function to check WebP support
function checkWebPSupport() {
    if (localStorage.getItem('supportsWebP') !== null) {
        return;
    }
    
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
        const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        localStorage.setItem('supportsWebP', supportsWebP);
    } else {
        localStorage.setItem('supportsWebP', false);
    }
}

// Function to enhance product images with responsive srcset
function enhanceProductImages() {
    // Find all product images that don't already have srcset
    const productImages = document.querySelectorAll('img:not([srcset])');
    
    productImages.forEach(img => {
        // Skip images that already have srcset or are SVGs
        if (img.srcset || (img.src && img.src.endsWith('.svg'))) {
            return;
        }
        
        // Get original src
        const originalSrc = img.getAttribute('src');
        if (!originalSrc) return;
        
        // Add loading="lazy" for native lazy loading
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        // Add srcset for responsive images
        const srcsetValues = [];
        for (const [size, width] of Object.entries(IMAGE_SIZES)) {
            const responsiveUrl = getResponsiveImageUrl(originalSrc, size);
            srcsetValues.push(`${responsiveUrl} ${width}w`);
        }
        
        if (srcsetValues.length > 0) {
            img.setAttribute('srcset', srcsetValues.join(', '));
            
            // Add sizes attribute if not present
            if (!img.hasAttribute('sizes')) {
                img.setAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
            }
        }
        
        // Add error handling
        img.onerror = function() {
            // If the responsive image fails, fall back to the original
            if (this.srcset) {
                this.removeAttribute('srcset');
                this.removeAttribute('sizes');
                console.log('Falling back to original image:', originalSrc);
            }
        };
    });
}

// Function to implement lazy loading for browsers that don't support it natively
function implementLazyLoading() {
    // Check if native lazy loading is supported
    if ('loading' in HTMLImageElement.prototype) {
        console.log('Native lazy loading is supported');
        return;
    }
    
    console.log('Implementing custom lazy loading');
    
    // Find all images with loading="lazy"
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    // Create an intersection observer
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const lazyImage = entry.target;
                
                // Load the image
                if (lazyImage.dataset.src) {
                    lazyImage.src = lazyImage.dataset.src;
                }
                
                if (lazyImage.dataset.srcset) {
                    lazyImage.srcset = lazyImage.dataset.srcset;
                }
                
                // Stop observing the image
                observer.unobserve(lazyImage);
            }
        });
    });
    
    // Observe each lazy image
    lazyImages.forEach(lazyImage => {
        // Store original src and srcset in data attributes
        if (lazyImage.src && !lazyImage.dataset.src) {
            lazyImage.dataset.src = lazyImage.src;
            lazyImage.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        }
        
        if (lazyImage.srcset && !lazyImage.dataset.srcset) {
            lazyImage.dataset.srcset = lazyImage.srcset;
            lazyImage.srcset = '';
        }
        
        lazyImageObserver.observe(lazyImage);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing image optimization');
    
    // Check WebP support
    checkWebPSupport();
    
    // Enhance product images with responsive srcset
    enhanceProductImages();
    
    // Implement lazy loading for browsers that don't support it natively
    implementLazyLoading();
});

// Re-run optimization when new content is loaded (e.g., after AJAX)
window.optimizeNewImages = function() {
    enhanceProductImages();
    implementLazyLoading();
};