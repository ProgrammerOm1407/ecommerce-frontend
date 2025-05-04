# Performance Optimization Guide

This document outlines the performance optimizations implemented in the e-commerce frontend project.

## Image Optimization

### WebP Conversion

1. **Convert Images to WebP**
   - Use tools like [Squoosh](https://squoosh.app/) or [WebP Converter](https://developers.google.com/speed/webp/docs/precompiled)
   - For each image, create multiple sizes:
     - Small (300px width): `image-small.webp`
     - Medium (600px width): `image-medium.webp`
     - Large (1200px width): `image-large.webp`
   - Keep original formats as fallbacks

2. **Compress Images**
   - Use [TinyPNG](https://tinypng.com/) for PNG compression
   - Use [ImageOptim](https://imageoptim.com/) for general image compression
   - For transparent images, use PNG-8 instead of PNG-24 when possible

### Responsive Images

The site now uses responsive images with the `srcset` attribute:

```html
<img src="image.jpg" 
     srcset="image-small.webp 300w, 
             image-medium.webp 600w, 
             image-large.webp 1200w" 
     sizes="(max-width: 768px) 100vw, 50vw"
     alt="Description"
     loading="lazy">
```

### Lazy Loading

All images now use native lazy loading with the `loading="lazy"` attribute. For browsers that don't support it, a JavaScript fallback is provided in `image-optimization.js`.

## CSS and JavaScript Optimization

### Minification

1. **Install Dependencies**
   ```
   npm install terser clean-css
   ```

2. **Run Minification Script**
   ```
   node scripts/minify.js
   ```

3. **Use Minified Files in Production**
   - Update HTML files to reference minified versions:
   ```html
   <link rel="stylesheet" href="styles/min/main.min.css">
   <script src="scripts/min/app.min.js"></script>
   ```

### Async/Defer Loading

JavaScript files are loaded with the `defer` attribute to prevent blocking page rendering:

```html
<script src="scripts/app.js" defer></script>
```

## Font Optimization

1. **System Font Stack**
   - The site uses a system font stack as the primary font family
   - Custom fonts are loaded asynchronously

2. **Font Display Swap**
   - All fonts use `font-display: swap` to ensure text is visible while fonts are loading

## Caching and Compression

1. **Browser Caching**
   - Static assets are cached using the `.htaccess` file
   - Different cache durations are set for different file types

2. **Compression**
   - GZIP compression is enabled in the `.htaccess` file
   - All text-based assets (HTML, CSS, JS) are compressed

3. **Service Worker**
   - A service worker caches static assets for offline use
   - The service worker is registered in `service-worker-registration.js`

## Performance Testing

1. **Google Lighthouse**
   - Run Lighthouse in Chrome DevTools to analyze performance
   - Focus on the Performance, Best Practices, and SEO scores

2. **PageSpeed Insights**
   - Test your site at [PageSpeed Insights](https://pagespeed.web.dev/)
   - Implement suggestions to further improve performance

3. **WebPageTest**
   - Use [WebPageTest](https://www.webpagetest.org/) for detailed performance analysis
   - Pay attention to Time to First Byte (TTFB) and First Contentful Paint (FCP)

## Maintenance

1. **Keep Dependencies Updated**
   - Regularly update npm packages
   - Check for security vulnerabilities with `npm audit`

2. **Monitor Performance**
   - Regularly test performance with the tools mentioned above
   - Set up performance budgets to prevent regression

3. **Image Workflow**
   - When adding new images, follow the optimization process
   - Create WebP versions and multiple sizes for each image