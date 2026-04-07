# Firebase Admin SDK Setup Guide

This guide explains how to set up Firebase Admin SDK for backend authentication.

## Why Firebase Admin SDK?

The backend uses Firebase Admin SDK to verify Firebase ID tokens sent from the frontend. This allows secure authentication without using Google OAuth directly.

## Setup Steps

### 1. Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (e.g., `khoj-1762c`)
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Go to the "Service accounts" tab
6. Click "Generate new private key"
7. Click "Generate key" - this will download a JSON file

### 2. Extract Credentials from JSON

The downloaded JSON file will look like this:

```json
{
  "type": "service_account",
  "project_id": "khoj-1762c",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@khoj-1762c.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### 3. Add to Environment Variables

Add these three values to your `server/.env` file:

```env
FIREBASE_PROJECT_ID=khoj-1762c
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@khoj-1762c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

**IMPORTANT NOTES:**

- The `FIREBASE_PRIVATE_KEY` must be wrapped in double quotes
- Keep the `\n` characters in the private key - they are important
- The private key should start with `-----BEGIN PRIVATE KEY-----` and end with `-----END PRIVATE KEY-----`

### 4. For Production (Render/Vercel)

When deploying to production:

1. Go to your hosting platform's environment variables settings
2. Add the same three variables
3. For `FIREBASE_PRIVATE_KEY`, you can either:
   - Copy the entire value with `\n` characters (recommended)
   - Or replace `\n` with actual newlines (some platforms support this)

**Render Example:**
```
FIREBASE_PROJECT_ID = khoj-1762c
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxxxx@khoj-1762c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

## How It Works

1. **Frontend**: User signs in with Google using Firebase Authentication
2. **Frontend**: Gets Firebase ID token from the authenticated user
3. **Frontend**: Sends ID token to backend `/api/auth/google` endpoint
4. **Backend**: Verifies the ID token using Firebase Admin SDK
5. **Backend**: Extracts user info (uid, email) from verified token
6. **Backend**: Creates or updates user in database
7. **Backend**: Returns JWT access token to frontend

## Verification

After setting up, you can verify it works by:

1. Starting the backend server: `npm run dev`
2. Check the console for: `✅ Firebase Admin initialized successfully`
3. Try signing in with Google from the frontend
4. Check backend logs for: `✅ Firebase token verified successfully`

## Troubleshooting

### Error: "Missing Firebase Admin environment variables"
- Make sure all three variables are set in your `.env` file
- Check for typos in variable names

### Error: "Invalid Firebase token"
- The token from frontend might be expired (tokens expire after 1 hour)
- Make sure the frontend is using the same Firebase project
- Check that `FIREBASE_PROJECT_ID` matches your Firebase project

### Error: "Firebase Admin initialization failed"
- Check that `FIREBASE_PRIVATE_KEY` is properly formatted
- Make sure the private key is wrapped in double quotes
- Verify the `\n` characters are present in the key

### Error: "Firebase token does not contain an email address"
- The user's Firebase account doesn't have an email
- This shouldn't happen with Google sign-in, but can occur with anonymous auth

## Security Notes

- **NEVER** commit the service account JSON file to git
- **NEVER** commit the `.env` file with real credentials
- The private key should be kept secret
- Rotate the service account key periodically for security
- Use different service accounts for development and production

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
