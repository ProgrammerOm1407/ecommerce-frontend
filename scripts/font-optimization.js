/**
 * Font Optimization Script
 * 
 * This script optimizes font loading by:
 * 1. Using system fonts as fallbacks
 * 2. Loading custom fonts asynchronously
 * 3. Implementing font-display: swap
 */

// Font loading strategy
(function() {
    // Check if the browser supports the Font Loading API
    if ('fonts' in document) {
        // Define the fonts we want to preload
        const fontsToLoad = [
            { family: 'Segoe UI', weight: 'normal' },
            { family: 'Segoe UI', weight: 'bold' },
            { family: 'Roboto', weight: 'normal' },
            { family: 'Roboto', weight: 'bold' }
        ];
        
        // Load each font
        fontsToLoad.forEach(font => {
            document.fonts.load(`${font.weight} 1em ${font.family}`).then(() => {
                console.log(`Font loaded: ${font.family} ${font.weight}`);
            }).catch(err => {
                console.warn(`Failed to load font: ${font.family} ${font.weight}`, err);
            });
        });
    }
    
    // Add a class to the body when fonts are loaded or after a timeout
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            document.body.classList.add('fonts-loaded');
        });
    } else {
        // Fallback for browsers that don't support the Font Loading API
        setTimeout(() => {
            document.body.classList.add('fonts-loaded');
        }, 300);
    }
})();

// Create a stylesheet for font-display: swap
(function() {
    // Create a style element
    const style = document.createElement('style');
    
    // Add font-display: swap to all @font-face rules
    style.textContent = `
        @font-face {
            font-display: swap !important;
        }
    `;
    
    // Add the style element to the head
    document.head.appendChild(style);
})();