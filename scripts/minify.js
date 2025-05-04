/**
 * CSS and JavaScript Minification Script
 * 
 * This script can be run with Node.js to minify CSS and JavaScript files.
 * It uses terser for JavaScript and clean-css for CSS.
 * 
 * Usage:
 * 1. Install dependencies: npm install terser clean-css
 * 2. Run: node scripts/minify.js
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

// Configuration
const config = {
    css: {
        srcDir: 'styles',
        destDir: 'styles/min',
        options: {
            level: 2 // CleanCSS optimization level
        }
    },
    js: {
        srcDir: 'scripts',
        destDir: 'scripts/min',
        options: {
            compress: {
                drop_console: true,
                drop_debugger: true
            },
            mangle: true
        }
    }
};

// Create destination directories if they don't exist
function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
}

// Minify CSS files
async function minifyCSS() {
    ensureDirectoryExists(config.css.destDir);
    
    const cssFiles = fs.readdirSync(config.css.srcDir)
        .filter(file => file.endsWith('.css') && !file.includes('.min.'));
    
    const cleanCSS = new CleanCSS(config.css.options);
    
    for (const file of cssFiles) {
        const srcPath = path.join(config.css.srcDir, file);
        const destPath = path.join(config.css.destDir, file.replace('.css', '.min.css'));
        
        try {
            const css = fs.readFileSync(srcPath, 'utf8');
            const minified = cleanCSS.minify(css);
            
            if (minified.errors.length > 0) {
                console.error(`Error minifying ${file}:`, minified.errors);
                continue;
            }
            
            fs.writeFileSync(destPath, minified.styles);
            
            const originalSize = Buffer.byteLength(css, 'utf8');
            const minifiedSize = Buffer.byteLength(minified.styles, 'utf8');
            const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);
            
            console.log(`Minified ${file}: ${originalSize} → ${minifiedSize} bytes (${savings}% savings)`);
        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }
}

// Minify JavaScript files
async function minifyJS() {
    ensureDirectoryExists(config.js.destDir);
    
    const jsFiles = fs.readdirSync(config.js.srcDir)
        .filter(file => file.endsWith('.js') && !file.includes('.min.') && file !== 'minify.js');
    
    for (const file of jsFiles) {
        const srcPath = path.join(config.js.srcDir, file);
        const destPath = path.join(config.js.destDir, file.replace('.js', '.min.js'));
        
        try {
            const js = fs.readFileSync(srcPath, 'utf8');
            const minified = await minify(js, config.js.options);
            
            fs.writeFileSync(destPath, minified.code);
            
            const originalSize = Buffer.byteLength(js, 'utf8');
            const minifiedSize = Buffer.byteLength(minified.code, 'utf8');
            const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);
            
            console.log(`Minified ${file}: ${originalSize} → ${minifiedSize} bytes (${savings}% savings)`);
        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }
}

// Main function
async function main() {
    console.log('Starting minification process...');
    
    try {
        await minifyCSS();
        await minifyJS();
        console.log('Minification completed successfully!');
    } catch (error) {
        console.error('Error during minification:', error);
    }
}

// Run the script
main();