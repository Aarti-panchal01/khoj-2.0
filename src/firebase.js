import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';

// TODO: Replace these placeholder values with your Firebase config
// Get these values from your Firebase Console:
// https://console.firebase.google.com/project/YOUR_PROJECT/settings/general
const firebaseConfig = {
  apiKey: "AIzaSyC24KdyqaqSQAxQ1tegCOWCkvrlRTNSpFs",
  authDomain: "khoj-1762c.firebaseapp.com",
  projectId: "khoj-1762c",
  storageBucket: "khoj-1762c.firebasestorage.app",
  messagingSenderId: "41563929635",
  appId: "1:41563929635:web:f797653fdb1c8281558596",
  measurementId: "G-WHB55W8NFG"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
