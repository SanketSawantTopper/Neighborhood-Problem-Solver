// Firebase Configuration for NeighborSolve
// ⚠️ IMPORTANT: Replace the values below with your actual Firebase project config
// Get your config from: Firebase Console > Project Settings > Your apps > Web app

const firebaseConfig = {
  apiKey: "AIzaSyAB9r7FKryDqCyDqoXRqWuQLmfd4dzNzCA",
  authDomain: "neabhour2problemsolver9.firebaseapp.com",
  projectId: "neabhour2problemsolver9",
  storageBucket: "neabhour2problemsolver9.firebasestorage.app",
  messagingSenderId: "89488605084",
  appId: "1:89488605084:web:305d7dba6e2bf5177b5259",
  measurementId: "G-2JPBN20PX9"
};

// Example of what your config should look like:
// const firebaseConfig = {
//     apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
//     authDomain: "neighborsolve-2024.firebaseapp.com",
//     projectId: "neighborsolve-2024",
//     storageBucket: "neighborsolve-2024.appspot.com",
//     messagingSenderId: "123456789012",
//     appId: "1:123456789012:web:abcdef123456789012345"
// };

// Check if Firebase is loaded
if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK not loaded. Please check your internet connection.');
} else {
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
        // Initialize Firestore
        const db = firebase.firestore();
        
        // Export database for use in other files
        window.db = db;
        
        console.log('✅ Firebase initialized successfully!');
        console.log('Project ID:', firebaseConfig.projectId);
        
        // Test database connection
        db.enableNetwork().then(() => {
            console.log('✅ Firestore connection established');
        }).catch((error) => {
            console.error('❌ Firestore connection failed:', error);
        });
        
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        console.error('Please check your Firebase configuration values.');
    }
}