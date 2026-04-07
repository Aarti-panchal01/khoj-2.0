/**
 * Test script to verify Firebase Admin SDK setup
 * Run with: node test-firebase-setup.js
 */

require('dotenv').config();

console.log('\n🔍 Testing Firebase Admin SDK Setup...\n');

// Check environment variables
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

let allVarsPresent = true;

console.log('1️⃣  Checking environment variables:');
requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName} is set`);
    if (varName === 'FIREBASE_PROJECT_ID') {
      console.log(`      Value: ${process.env[varName]}`);
    } else if (varName === 'FIREBASE_CLIENT_EMAIL') {
      console.log(`      Value: ${process.env[varName]}`);
    } else if (varName === 'FIREBASE_PRIVATE_KEY') {
      const keyPreview = process.env[varName].substring(0, 50);
      console.log(`      Preview: ${keyPreview}...`);
      
      // Check if key has proper format
      if (!process.env[varName].includes('BEGIN PRIVATE KEY')) {
        console.log(`      ⚠️  Warning: Key doesn't contain "BEGIN PRIVATE KEY"`);
      }
      if (!process.env[varName].includes('\\n')) {
        console.log(`      ⚠️  Warning: Key doesn't contain \\n characters`);
      }
    }
  } else {
    console.log(`   ❌ ${varName} is NOT set`);
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log('\n❌ Missing required environment variables!');
  console.log('   Please add them to server/.env file');
  console.log('   See server/QUICK_FIREBASE_SETUP.md for instructions\n');
  process.exit(1);
}

console.log('\n2️⃣  Attempting to initialize Firebase Admin SDK:');

try {
  const { initializeFirebaseAdmin } = require('./src/config/firebase');
  initializeFirebaseAdmin();
  console.log('   ✅ Firebase Admin SDK initialized successfully!\n');
  
  console.log('✅ All checks passed!');
  console.log('   Your Firebase Admin SDK is configured correctly.');
  console.log('   You can now start the server with: npm run dev\n');
  
  process.exit(0);
} catch (error) {
  console.log('   ❌ Firebase Admin SDK initialization failed!');
  console.log(`   Error: ${error.message}\n`);
  
  if (error.message.includes('private_key')) {
    console.log('💡 Tip: Check that FIREBASE_PRIVATE_KEY:');
    console.log('   - Is wrapped in double quotes');
    console.log('   - Contains \\n characters (not actual newlines)');
    console.log('   - Starts with "-----BEGIN PRIVATE KEY-----"');
    console.log('   - Ends with "-----END PRIVATE KEY-----"\n');
  }
  
  process.exit(1);
}
