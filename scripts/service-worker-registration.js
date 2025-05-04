/**
 * Service Worker Registration
 * Registers the service worker for caching and offline support
 */

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('Service Worker update found!');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker is installed but waiting to activate
                            console.log('New Service Worker installed, waiting to activate');
                            
                            // Show update notification to user
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
        
        // Handle service worker updates
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
            console.log('Controller changed, refreshing page');
            window.location.reload();
        });
    });
}

// Function to show update notification
function showUpdateNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-notification-content">
            <p>A new version of this site is available!</p>
            <button id="update-button">Update Now</button>
        </div>
    `;
    
    // Add notification to the page
    document.body.appendChild(notification);
    
    // Add event listener to update button
    document.getElementById('update-button').addEventListener('click', () => {
        // Tell the service worker to skipWaiting
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        });
        
        // Remove notification
        notification.remove();
    });
    
    // Add styles for the notification
    const style = document.createElement('style');
    style.textContent = `
        .update-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #4a90e2;
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        }
        
        .update-notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
        }
        
        .update-notification p {
            margin: 0;
        }
        
        #update-button {
            background-color: white;
            color: #4a90e2;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;
        }
        
        #update-button:hover {
            background-color: #f0f0f0;
        }
        
        @keyframes slideIn {
            from {
                transform: translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
}