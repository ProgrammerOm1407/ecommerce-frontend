# Firebase Authentication Setup Guide

This guide will walk you through setting up Firebase Authentication for the e-commerce frontend project.

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps to create a new project
3. Give your project a name (e.g., "E-Commerce Frontend")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## 2. Register Your Web App

1. In the Firebase Console, select your project
2. Click on the web icon (</>) to add a web app
3. Give your app a nickname (e.g., "E-Commerce Web")
4. Check the box for "Also set up Firebase Hosting" if you plan to use it
5. Click "Register app"
6. You'll see your Firebase configuration - keep this page open as you'll need these values

## 3. Enable Email/Password Authentication

1. In the Firebase Console, go to "Authentication" in the left sidebar
2. Click on the "Sign-in method" tab
3. Click on "Email/Password" in the list of providers
4. Toggle the "Enable" switch to the on position
5. Click "Save"

## 4. Update Firebase Configuration

1. Open the file `scripts/firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {


    apiKey: "AIzaSyAaDZUvEuYiI6tBUyyiRXhW2WLzHPIroNc",
  authDomain: "ecommerce-frontend-a70f7.firebaseapp.com",
  projectId: "ecommerce-frontend-a70f7",
  storageBucket: "ecommerce-frontend-a70f7.firebasestorage.app",
  messagingSenderId: "1011571624772",
  appId: "1:1011571624772:web:aa97570cbbee654657e511",
  measurementId: "G-K46VDQ3G6Z"
};
```

## 5. Test Your Authentication

1. Open the website in your browser
2. Try to sign up with a new account
3. Try to log in with the account you created
4. Test the logout functionality
5. Verify that the authentication state persists when you refresh the page

## 6. Additional Firebase Features (Optional)

You can enhance your application with additional Firebase features:

- **Firestore Database**: Store user data, orders, and product information
- **Cloud Storage**: Store product images and user uploads
- **Cloud Functions**: Implement serverless backend logic
- **Firebase Hosting**: Deploy your website to Firebase's global CDN

To add these features, you'll need to:

1. Enable them in the Firebase Console
2. Install the corresponding Firebase SDK modules
3. Update your code to use these features

## Troubleshooting

If you encounter issues:

1. Check the browser console for error messages
2. Verify that your Firebase configuration is correct
3. Make sure you've enabled Email/Password authentication
4. Check that you're using the correct Firebase SDK version
5. Ensure your Firebase project has the correct permissions

For more help, refer to the [Firebase Documentation](https://firebase.google.com/docs).