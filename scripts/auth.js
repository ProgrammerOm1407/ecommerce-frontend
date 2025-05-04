document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    // Check if user is already logged in
    checkAuthState();
    
    // Password visibility toggle
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordField = this.previousElementSibling;
            const type = passwordField.getAttribute('type');
            
            if (type === 'password') {
                passwordField.setAttribute('type', 'text');
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                this.setAttribute('aria-label', 'Hide password');
            } else {
                passwordField.setAttribute('type', 'password');
                this.innerHTML = '<i class="fas fa-eye"></i>';
                this.setAttribute('aria-label', 'Show password');
            }
        });
    });
    
    // Login form validation and submission
    if (loginForm) {
        // Get the email and password inputs - handle both single and combined page versions
        const emailInput = loginForm.querySelector('#email') || loginForm.querySelector('#login-email');
        const passwordInput = loginForm.querySelector('#password') || loginForm.querySelector('#login-password');
        const rememberMeCheckbox = loginForm.querySelector('#remember');
        const emailError = document.getElementById('email-error') || document.getElementById('login-email-error');
        const passwordError = document.getElementById('password-error') || document.getElementById('login-password-error');
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Login form submitted");
            
            // Reset errors
            resetErrors();
            
            // Validate email
            if (!validateEmail(emailInput.value)) {
                showError(emailInput, emailError, 'Please enter a valid email address');
                return;
            }
            
            // Validate password
            if (passwordInput.value.length < 1) {
                showError(passwordInput, passwordError, 'Please enter your password');
                return;
            }
            
            // If validation passes, show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.classList.add('loading');
            
            console.log("Attempting to sign in with:", emailInput.value);
            
            try {
                // Set persistence based on "Remember me" checkbox
                const persistence = rememberMeCheckbox && rememberMeCheckbox.checked ? 
                    firebase.auth.Auth.Persistence.LOCAL : 
                    firebase.auth.Auth.Persistence.SESSION;
                
                console.log("Setting persistence to:", rememberMeCheckbox && rememberMeCheckbox.checked ? "LOCAL" : "SESSION");
                
                // Set persistence first, then sign in
                firebase.auth().setPersistence(persistence)
                    .then(() => {
                        console.log("Persistence set, attempting sign in");
                        // Sign in with email and password
                        return firebase.auth().signInWithEmailAndPassword(
                            emailInput.value,
                            passwordInput.value
                        );
                    })
                    .then((userCredential) => {
                        // Signed in successfully
                        console.log("Login successful for user:", userCredential.user.email);
                        submitButton.classList.remove('loading');
                        
                        // Show success notification
                        window.showNotification('Login successful! Redirecting...', 'success');
                        
                        // Redirect to home page after a delay
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1500);
                    })
                    .catch((error) => {
                        // Handle errors
                        console.error("Login error:", error.code, error.message);
                        submitButton.classList.remove('loading');
                        
                        // Display appropriate error message based on error code
                        let errorMessage = 'Login failed. Please try again.';
                        
                        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                            errorMessage = 'Invalid email or password. Please try again.';
                            showError(emailInput, emailError, errorMessage);
                            showError(passwordInput, passwordError, '');
                        } else if (error.code === 'auth/too-many-requests') {
                            errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
                            showError(emailInput, emailError, errorMessage);
                        } else if (error.code === 'auth/user-disabled') {
                            errorMessage = 'This account has been disabled. Please contact support.';
                            showError(emailInput, emailError, errorMessage);
                        } else {
                            // Generic error for other cases
                            console.error('Login error details:', error);
                            window.showNotification(errorMessage, 'error');
                        }
                        
                        // Shake the form to indicate error
                        loginForm.classList.add('shake');
                        setTimeout(() => {
                            loginForm.classList.remove('shake');
                        }, 600);
                    });
            } catch (error) {
                console.error("Unexpected error during login:", error);
                submitButton.classList.remove('loading');
                window.showNotification('An unexpected error occurred. Please try again.', 'error');
            }
        });
    }
    
    // Signup form validation and submission
    if (signupForm) {
        const fullnameInput = signupForm.querySelector('#fullname');
        const emailInput = signupForm.querySelector('#email') || signupForm.querySelector('#signup-email');
        const passwordInput = signupForm.querySelector('#password') || signupForm.querySelector('#signup-password');
        const confirmPasswordInput = signupForm.querySelector('#confirm-password');
        const termsCheckbox = signupForm.querySelector('#terms');
        
        const fullnameError = document.getElementById('fullname-error');
        const emailError = document.getElementById('email-error') || document.getElementById('signup-email-error');
        const passwordError = document.getElementById('password-error') || document.getElementById('signup-password-error');
        const confirmPasswordError = document.getElementById('confirm-password-error');
        const termsError = document.getElementById('terms-error');
        
        const strengthMeter = document.getElementById('strength-meter-fill');
        const strengthText = document.getElementById('strength-text');
        
        // Password strength meter
        if (passwordInput && strengthMeter && strengthText) {
            passwordInput.addEventListener('input', function() {
                updatePasswordStrength(this.value);
            });
        }
        
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset errors
            resetErrors();
            
            let isValid = true;
            
            // Validate full name
            if (fullnameInput.value.trim().length < 2) {
                showError(fullnameInput, fullnameError, 'Please enter your full name');
                isValid = false;
            }
            
            // Validate email
            if (!validateEmail(emailInput.value)) {
                showError(emailInput, emailError, 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate password
            const passwordStrength = checkPasswordStrength(passwordInput.value);
            if (passwordStrength === 'weak' || passwordInput.value.length < 8) {
                showError(passwordInput, passwordError, 'Password must be at least 8 characters with uppercase, lowercase, and numbers');
                isValid = false;
            }
            
            // Validate confirm password
            if (confirmPasswordInput.value !== passwordInput.value) {
                showError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match');
                isValid = false;
            }
            
            // Validate terms
            if (!termsCheckbox.checked) {
                showError(null, termsError, 'You must agree to the Terms of Service and Privacy Policy');
                isValid = false;
            }
            
            if (!isValid) {
                // Shake the form if validation fails
                signupForm.classList.add('shake');
                setTimeout(() => {
                    signupForm.classList.remove('shake');
                }, 600);
                return;
            }
            
            // If validation passes, show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.classList.add('loading');
            
            // Create user with email and password
            console.log("Attempting to create user with:", emailInput.value);
            
            try {
                firebase.auth().createUserWithEmailAndPassword(
                    emailInput.value,
                    passwordInput.value
                )
                .then((userCredential) => {
                    // User created successfully
                    console.log("User created successfully:", userCredential.user.email);
                    const user = userCredential.user;
                    
                    // Update user profile with full name
                    console.log("Updating user profile with name:", fullnameInput.value.trim());
                    return user.updateProfile({
                        displayName: fullnameInput.value.trim()
                    });
                })
                .then(() => {
                    // Profile updated successfully
                    console.log("User profile updated successfully");
                    submitButton.classList.remove('loading');
                    
                    // Show success notification
                    window.showNotification('Account created successfully! Redirecting...', 'success');
                    
                    // Redirect to home page after a delay
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                })
                .catch((error) => {
                    // Handle errors
                    console.error("Signup error:", error.code, error.message);
                    submitButton.classList.remove('loading');
                    
                    // Display appropriate error message based on error code
                    let errorMessage = 'Registration failed. Please try again.';
                    
                    if (error.code === 'auth/email-already-in-use') {
                        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
                        showError(emailInput, emailError, errorMessage);
                    } else if (error.code === 'auth/weak-password') {
                        errorMessage = 'Password is too weak. Please choose a stronger password.';
                        showError(passwordInput, passwordError, errorMessage);
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Invalid email address. Please enter a valid email.';
                        showError(emailInput, emailError, errorMessage);
                    } else {
                        // Generic error for other cases
                        console.error('Signup error details:', error);
                        window.showNotification(errorMessage, 'error');
                    }
                    
                    // Shake the form to indicate error
                    signupForm.classList.add('shake');
                    setTimeout(() => {
                        signupForm.classList.remove('shake');
                    }, 600);
                });
            } catch (error) {
                console.error("Unexpected error during signup:", error);
                submitButton.classList.remove('loading');
                window.showNotification('An unexpected error occurred. Please try again.', 'error');
            }
        });
    }
    
    // Authentication state observer
    function checkAuthState() {
        console.log("Checking authentication state...");
        firebase.auth().onAuthStateChanged(function(user) {
            console.log("Auth state changed:", user ? "User logged in" : "User logged out");
            // Update UI based on authentication state
            updateAuthUI(user);
        });
    }
    
    // Update UI based on authentication state
    function updateAuthUI(user) {
        console.log("Updating UI for auth state:", user ? "logged in" : "logged out");
        
        // Find account elements
        const accountIcon = document.querySelector('.account-icon');
        const accountContainer = document.querySelector('.account-container');
        
        console.log("Account elements found:", 
            accountIcon ? "icon found" : "icon not found", 
            accountContainer ? "container found" : "container not found");
        
        if (user) {
            // User is signed in
            console.log('User is signed in:', user.displayName || user.email);
            
            // Update account icon/container if it exists
            if (accountIcon) {
                // Change the icon to indicate logged in state
                accountIcon.innerHTML = '<i class="fa fa-user-check"></i>';
                accountIcon.setAttribute('aria-label', 'Account settings');
                accountIcon.setAttribute('href', 'account.html');
                
                // Add a logout button if it doesn't exist
                if (accountContainer && !document.querySelector('.logout-button')) {
                    const logoutButton = document.createElement('button');
                    logoutButton.className = 'logout-button';
                    logoutButton.innerHTML = '<i class="fa fa-sign-out-alt"></i>';
                    logoutButton.setAttribute('aria-label', 'Log out');
                    logoutButton.addEventListener('click', logout);
                    
                    accountContainer.appendChild(logoutButton);
                    console.log("Logout button added to account container");
                }
            }
            
            // If we're on login or signup page, redirect to home
            const currentPath = window.location.pathname.toLowerCase();
            if (currentPath.endsWith('login.html') || 
                currentPath.endsWith('signup.html') ||
                currentPath.endsWith('auth.html')) {
                console.log("User is logged in and on auth page, redirecting to home");
                window.location.href = 'index.html';
            }
        } else {
            // User is signed out
            console.log('User is signed out');
            
            // Update account icon if it exists
            if (accountIcon) {
                accountIcon.innerHTML = '<i class="fa fa-user"></i>';
                accountIcon.setAttribute('aria-label', 'Login or create account');
                accountIcon.setAttribute('href', 'auth.html');
                
                // Remove logout button if it exists
                const logoutButton = document.querySelector('.logout-button');
                if (logoutButton) {
                    logoutButton.remove();
                    console.log("Logout button removed");
                }
            }
            
            // If we're on account page, redirect to login
            const currentPath = window.location.pathname.toLowerCase();
            if (currentPath.endsWith('account.html')) {
                console.log("User is logged out and on account page, redirecting to auth");
                window.location.href = 'auth.html';
            }
        }
        
        // Add some CSS for the logout button if it doesn't exist
        if (!document.getElementById('logout-button-style')) {
            const style = document.createElement('style');
            style.id = 'logout-button-style';
            style.textContent = `
                .logout-button {
                    background: none;
                    border: none;
                    color: #333;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 5px;
                    margin-left: 5px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }
                .logout-button:hover {
                    background-color: rgba(231, 76, 60, 0.1);
                    color: #e74c3c;
                }
            `;
            document.head.appendChild(style);
            console.log("Added logout button styles");
        }
    }
    
    // Logout function
    function logout(e) {
        if (e) e.preventDefault();
        
        firebase.auth().signOut()
            .then(() => {
                // Sign-out successful
                window.showNotification('You have been logged out successfully', 'success');
                
                // Redirect to home page
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            })
            .catch((error) => {
                // An error happened
                console.error('Logout error:', error);
                window.showNotification('Error logging out. Please try again.', 'error');
            });
    }
    
    // Helper Functions
    
    // Validate email format
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Check password strength
    function checkPasswordStrength(password) {
        // If empty return nothing
        if (password.length === 0) {
            return '';
        }
        
        // Initialize variables
        let strength = 0;
        
        // If password length is less than 6, return weak
        if (password.length < 6) {
            return 'weak';
        }
        
        // If length is 8 characters or more, increase strength
        if (password.length >= 8) strength += 1;
        
        // If password contains both lower and uppercase characters, increase strength
        if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1;
        
        // If it has numbers and characters, increase strength
        if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1;
        
        // If it has one special character, increase strength
        if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1;
        
        // If it has two special characters, increase strength
        if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1;
        
        // Return the strength rating
        if (strength < 2) {
            return 'weak';
        } else if (strength === 2) {
            return 'medium';
        } else if (strength === 3) {
            return 'good';
        } else {
            return 'strong';
        }
    }
    
    // Update password strength meter
    function updatePasswordStrength(password) {
        const strength = checkPasswordStrength(password);
        
        // Remove all classes
        strengthMeter.parentElement.classList.remove('strength-weak', 'strength-medium', 'strength-good', 'strength-strong');
        
        if (!strength) {
            strengthText.textContent = 'Password strength';
            return;
        }
        
        // Add the appropriate class
        strengthMeter.parentElement.classList.add(`strength-${strength}`);
        
        // Update the text
        switch (strength) {
            case 'weak':
                strengthText.textContent = 'Weak - Add more characters';
                break;
            case 'medium':
                strengthText.textContent = 'Medium - Add numbers or symbols';
                break;
            case 'good':
                strengthText.textContent = 'Good - Almost there';
                break;
            case 'strong':
                strengthText.textContent = 'Strong - Good job!';
                break;
        }
    }
    
    // Show error message
    function showError(input, errorElement, message) {
        if (input) {
            input.classList.add('input-error');
            input.setAttribute('aria-invalid', 'true');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.opacity = '1';
        }
    }
    
    // Reset all errors
    function resetErrors() {
        // Remove error classes from inputs
        const inputs = document.querySelectorAll('.auth-form input');
        inputs.forEach(input => {
            input.classList.remove('input-error', 'input-success');
            input.setAttribute('aria-invalid', 'false');
        });
        
        // Clear error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            error.textContent = '';
            error.style.opacity = '0';
        });
    }
    
    // Real-time validation for email
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const errorElement = document.getElementById(`${this.id}-error`);
            
            if (this.value && !validateEmail(this.value)) {
                showError(this, errorElement, 'Please enter a valid email address');
            } else if (this.value) {
                this.classList.remove('input-error');
                this.classList.add('input-success');
                errorElement.textContent = '';
                errorElement.style.opacity = '0';
            }
        });
    });
    
    // Real-time validation for password match
    const confirmPasswordInputs = document.querySelectorAll('#confirm-password');
    confirmPasswordInputs.forEach(input => {
        input.addEventListener('input', function() {
            const passwordInput = document.getElementById('password');
            const errorElement = document.getElementById('confirm-password-error');
            
            if (this.value && this.value !== passwordInput.value) {
                showError(this, errorElement, 'Passwords do not match');
            } else if (this.value) {
                this.classList.remove('input-error');
                this.classList.add('input-success');
                errorElement.textContent = '';
                errorElement.style.opacity = '0';
            }
        });
    });
    
    // Make logout function globally available
    window.logoutUser = logout;
});