// Firebase configuration
// Replace these values with your Firebase project configuration
// from the Firebase console

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAaDZUvEuYiI6tBUyyiRXhW2WLzHPIroNc",
    authDomain: "ecommerce-frontend-a70f7.firebaseapp.com",
    projectId: "ecommerce-frontend-a70f7",
    storageBucket: "ecommerce-frontend-a70f7.firebasestorage.app",
    messagingSenderId: "1011571624772",
    appId: "1:1011571624772:web:aa97570cbbee654657e511",
    measurementId: "G-K46VDQ3G6Z"
};

// Initialize Firebase
console.log("Initializing Firebase...");
try {
    const app = firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");

    // Initialize Firebase Authentication and get a reference to the service
    const auth = firebase.auth();
    console.log("Firebase Auth initialized");

    // Make auth available globally
    window.firebaseAuth = auth;
    
    // Log auth state changes for debugging
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log("Firebase Auth: User is signed in", user.email);
        } else {
            console.log("Firebase Auth: User is signed out");
        }
    });
} catch (error) {
    console.error("Error initializing Firebase:", error);
}