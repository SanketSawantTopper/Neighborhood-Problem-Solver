# Firebase Contact Form Setup Guide

## Overview
This setup integrates Firebase Firestore database with your contact form to store submissions securely in the cloud.

## Firebase Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or use existing project
3. Follow the setup wizard

### 2. Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in **Test mode** (for development)
4. Choose a location close to your users

### 3. Get Firebase Configuration
1. Go to Project Settings (gear icon) → **General** tab
2. Scroll to "Your apps" section
3. Click "Add app" → Web (</>) icon
4. **App nickname:** Enter `NeighborSolve Web App` (or similar descriptive name)
5. **Firebase Hosting:** Check this box if you plan to use Firebase Hosting (optional)
6. Click "Register app"
7. Copy the `firebaseConfig` object that appears

### 4. Update Configuration File
1. Open `firebase-config.js`
2. Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-actual-app-id"
};
```

## Database Structure

### Contacts Collection
```
contacts/ (collection)
  └── {auto-generated-id}/ (document)
      ├── name: string
      ├── email: string
      ├── phone: string (optional)
      ├── subject: string
      ├── message: string
      ├── newsletter: boolean
      ├── timestamp: timestamp
      ├── status: string ("new", "read", "replied", "closed")
      ├── userAgent: string
      └── pageUrl: string
```

## Security Rules (Production)

For production, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to contacts collection for authenticated admin users
    match /contacts/{document} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
      allow create: if true; // Allow anyone to create contact submissions
    }
  }
}
```

## Features

### Contact Form (contact.html)
- Form validation
- Loading states during submission
- Success confirmation with reference ID
- Error handling and user feedback
- Newsletter subscription option

### Admin Interface (contact-admin.html)
- View all contact submissions
- Real-time updates using Firestore snapshots
- Statistics dashboard
- Status management (new, read, replied, closed)
- Detailed submission viewing

## Files Modified/Created

1. **contact.html** - Added Firebase SDK imports
2. **firebase-config.js** - Firebase configuration (NEW)
3. **script.js** - Enhanced contact form handling with Firebase
4. **contact-admin.html** - Admin interface for viewing submissions (NEW)
5. **README-firebase.md** - This setup guide (NEW)

## Testing

1. Open `contact.html` in your browser
2. Fill out the contact form
3. Submit the form
4. Check Firebase Console → Firestore Database to see the submission
5. Open `contact-admin.html` to view submissions in the admin interface

## Next Steps

### For Production:
1. **Security**: Set up proper Firestore security rules
2. **Authentication**: Add admin authentication for the admin interface
3. **Email Notifications**: Set up Firebase Cloud Functions to send email notifications
4. **Spam Protection**: Implement reCAPTCHA for the contact form
5. **Analytics**: Add form submission tracking

### Enhancements:
1. **Email Integration**: Use Firebase Cloud Functions with email services
2. **Auto-Reply**: Set up automatic confirmation emails
3. **File Attachments**: Add support for file uploads
4. **Export Data**: Add functionality to export submissions to CSV
5. **Search & Filter**: Add search and filtering capabilities to admin interface

## Troubleshooting

### Common Issues:
1. **Firebase not initialized**: Check console for errors and verify config
2. **Permission denied**: Ensure Firestore is in test mode for development
3. **Network errors**: Check internet connection and Firebase service status

### Debug Mode:
Open browser console to see detailed Firebase operation logs.