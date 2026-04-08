import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';

// Firebase config from environment variables or hardcoded defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC24KdyqaqSQAxQ1tegCOWCkvrlRTNSpFs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "khoj-1762c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "khoj-1762c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "khoj-1762c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "41563929635",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:41563929635:web:f797653fdb1c8281558596",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WHB55W8NFG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set persistence to LOCAL so login persists across sessions
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Silently handle persistence errors in production
});

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  'prompt': 'consent'
});

export default app;
