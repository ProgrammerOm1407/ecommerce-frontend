document.addEventListener('DOMContentLoaded', function() {
    console.log("Account page loaded");
    
    // DOM Elements
    const userNameElement = document.querySelector('.user-name');
    const userEmailElement = document.querySelector('.user-email');
    const logoutButton = document.getElementById('logout-button');
    
    console.log("DOM elements found:", 
        userNameElement ? "username found" : "username not found", 
        userEmailElement ? "email found" : "email not found",
        logoutButton ? "logout button found" : "logout button not found");
    
    // Check if user is logged in
    firebase.auth().onAuthStateChanged(function(user) {
        console.log("Auth state changed on account page:", user ? "User logged in" : "User logged out");
        
        if (user) {
            // User is signed in, update UI
            updateUserProfile(user);
        } else {
            // No user is signed in, redirect to login
            console.log("No user logged in, redirecting to auth page");
            window.location.href = 'auth.html';
        }
    });
    
    // Update user profile information
    function updateUserProfile(user) {
        console.log("Updating user profile with:", user.displayName, user.email);
        
        if (userNameElement) {
            userNameElement.textContent = user.displayName || 'User';
        }
        
        if (userEmailElement) {
            userEmailElement.textContent = user.email || '';
        }
    }
    
    // Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            console.log("Logout button clicked");
            
            // Show loading state
            this.classList.add('loading');
            
            // Call the logout function from auth.js
            if (typeof window.logoutUser === 'function') {
                console.log("Calling logoutUser function");
                window.logoutUser();
            } else {
                console.error("logoutUser function not found, using direct logout");
                firebase.auth().signOut()
                    .then(() => {
                        console.log("Logout successful");
                        window.showNotification('You have been logged out successfully', 'success');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1500);
                    })
                    .catch((error) => {
                        console.error("Logout error:", error);
                        window.showNotification('Error logging out. Please try again.', 'error');
                    });
            }
        });
    }
});