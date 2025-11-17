# Firebase Setup Guide

This guide will help you configure Firebase for cloud sync functionality in KVNG HORLA SCOPE.

## Prerequisites

- A Google account
- Basic knowledge of Firebase console

## Steps to Configure Firebase

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "KVNG-HORLA-SCOPE")
4. Follow the setup wizard (you can disable Google Analytics if not needed)
5. Click "Create project"

### 2. Enable Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode" (for development)
4. Select a Cloud Firestore location (choose the closest to your users)
5. Click "Enable"

### 3. Set Up Security Rules (Important!)

In the Firestore Database rules tab, update your rules to control access:

**For Development/Testing (Not secure - anyone can read/write):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**For Production (Recommended):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transactionId} {
      // Only authenticated users can read/write
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Get Your Firebase Configuration

1. In the Firebase console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "KVNG HORLA SCOPE Web")
6. Copy the Firebase configuration object

### 5. Update Your App

1. Open the `app.js` file in your project
2. Find the `firebaseConfig` object (around line 6-13)
3. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### 6. Test the Configuration

1. Open your app in a web browser
2. Add some transactions
3. Click the "💾 Save to Cloud" button
4. If configured correctly, you should see a success message
5. Check your Firestore Database in the Firebase console to see the saved transactions

## Troubleshooting

### "Firebase is not configured" Alert

This means the Firebase SDK couldn't initialize. Check:
- Make sure you've updated all the placeholder values in `firebaseConfig`
- Verify your Firebase project is active
- Check the browser console for specific error messages

### "Failed to save to cloud" Error

This could be due to:
- **Security Rules**: Your Firestore rules might be blocking writes
  - Go to Firestore Database → Rules
  - Temporarily use test mode rules to verify connectivity
- **Network Issues**: Check your internet connection
- **Invalid Credentials**: Double-check your Firebase configuration values

### Data Not Appearing in Firestore

- Check that the collection name is "transactions"
- Verify you clicked "Save to Cloud" after adding transactions
- Look for any error messages in the browser console (F12)

## Security Best Practices

1. **Never commit your Firebase config to public repositories** with sensitive data
2. **Use Firebase Authentication** to restrict access to your data
3. **Set up proper security rules** in production
4. **Monitor your Firebase usage** to prevent unexpected costs
5. **Use environment variables** for sensitive configuration in production deployments

## Data Structure

The app saves transactions in the following format:

```javascript
{
  id: "unique-transaction-id",
  date: "2025-11-17",
  gameId: 201,
  gameName: "Monday Starter",
  gameTime: "08:00",
  sales: 1000,
  profit13: 130,
  expense: 870,
  notes: "Optional notes"
}
```

## Support

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Verify your Firebase configuration
3. Ensure Firestore is enabled in your Firebase project
4. Review Firebase security rules

## Local Storage Fallback

Even without Firebase configuration, the app will continue to work using browser's localStorage. Your data will be saved locally and persist across browser sessions, but won't sync to the cloud.
