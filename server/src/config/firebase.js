const admin = require('firebase-admin');

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */
const initializeFirebaseAdmin = () => {
  // Check if already initialized
  if (admin.apps.length > 0) {
    console.log('✅ Firebase Admin already initialized');
    return admin;
  }

  // Validate required environment variables
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing Firebase Admin environment variables:', missingVars.join(', '));
    throw new Error(`Missing required Firebase Admin environment variables: ${missingVars.join(', ')}`);
  }

  try {
    // Initialize Firebase Admin with service account credentials
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines in private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });

    console.log('✅ Firebase Admin initialized successfully');
    console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('   Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
    
    return admin;
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    throw error;
  }
};

module.exports = { initializeFirebaseAdmin, admin };
