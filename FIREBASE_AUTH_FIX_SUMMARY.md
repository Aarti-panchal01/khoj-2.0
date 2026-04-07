# Firebase Authentication Fix - Summary

## Problem
POST `/api/auth/google` was returning 401 after Firebase login because the backend was using Google OAuth2Client instead of Firebase Admin SDK to verify tokens.

## Solution Implemented

### 1. Installed Firebase Admin SDK
```bash
cd server
npm install firebase-admin
```

### 2. Created Firebase Admin Configuration
**File:** `server/src/config/firebase.js`

- Initializes Firebase Admin SDK with service account credentials
- Loads credentials from environment variables
- Validates required environment variables
- Provides proper error logging

### 3. Updated Authentication Route
**File:** `server/src/routes/authRoutes.js`

**Changes:**
- Removed: `google-auth-library` OAuth2Client
- Added: Firebase Admin SDK initialization
- Updated `/api/auth/google` route to:
  - Accept Firebase ID token from frontend
  - Verify token using `admin.auth().verifyIdToken(idToken)`
  - Extract `uid` and `email` from decoded token
  - Create or update user in database
  - Return JWT access token

**Key improvements:**
- Proper error logging with console.error
- Detailed success logging
- Better error messages for debugging

### 4. Updated Environment Configuration
**File:** `server/.env.example`

Added required Firebase Admin environment variables:
```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 5. Created Setup Documentation
- `server/FIREBASE_ADMIN_SETUP.md` - Comprehensive setup guide
- `server/QUICK_FIREBASE_SETUP.md` - Quick reference guide

## How It Works Now

### Authentication Flow:

1. **Frontend** (src/pages/auth/Login.jsx):
   - User clicks "Continue with Google"
   - Firebase Authentication popup opens
   - User signs in with Google
   - Frontend gets Firebase ID token: `await user.getIdToken()`

2. **Frontend sends to backend**:
   ```javascript
   POST /api/auth/google
   Body: { credential: "<firebase-id-token>" }
   ```

3. **Backend** (server/src/routes/authRoutes.js):
   - Receives Firebase ID token
   - Verifies using Firebase Admin SDK:
     ```javascript
     const decoded = await admin.auth().verifyIdToken(idToken);
     ```
   - Extracts user info:
     ```javascript
     const uid = decoded.uid;
     const email = decoded.email;
     ```
   - Creates or finds user in MongoDB
   - Generates JWT access token
   - Returns token and user data

4. **Frontend receives response**:
   - Stores JWT token in localStorage
   - Updates auth context
   - Redirects to dashboard or onboarding

## What You Need to Do

### 1. Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `khoj-1762c`
3. Go to: ⚙️ Settings > Service accounts
4. Click "Generate new private key"
5. Download the JSON file

### 2. Add to server/.env

From the downloaded JSON, copy these values to `server/.env`:

```env
FIREBASE_PROJECT_ID=khoj-1762c
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@khoj-1762c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
```

**CRITICAL:** 
- Keep the `\n` characters in the private key
- Wrap the private key in double quotes
- Do NOT commit the service account JSON to git

### 3. Test Locally

```bash
# Start backend
cd server
npm run dev

# Should see:
# ✅ Firebase Admin initialized successfully
# Server running on port 4000

# Start frontend (in another terminal)
cd ..
npm run dev

# Test Google sign-in
# Should see in backend logs:
# ✅ Firebase token verified successfully
# ✅ User logged in successfully: user@example.com
```

### 4. Deploy to Production

Add the same 3 environment variables to your hosting platform (Render/Vercel):

```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

## Verification Checklist

- [ ] Firebase Admin SDK installed (`firebase-admin` in package.json)
- [ ] `server/src/config/firebase.js` created
- [ ] `server/src/routes/authRoutes.js` updated to use Firebase Admin
- [ ] `server/.env.example` updated with Firebase variables
- [ ] Service account JSON downloaded from Firebase Console
- [ ] Environment variables added to `server/.env`
- [ ] Backend starts without errors
- [ ] Console shows "✅ Firebase Admin initialized successfully"
- [ ] Google sign-in works from frontend
- [ ] Backend logs show "✅ Firebase token verified successfully"
- [ ] User is created/logged in successfully
- [ ] JWT token is returned to frontend
- [ ] User is redirected to dashboard/onboarding

## Error Messages to Look For

### Success Messages:
```
✅ Firebase Admin initialized successfully
✅ Firebase token verified successfully
✅ User created successfully: <user-id>
✅ User logged in successfully: <email>
```

### Error Messages:
```
❌ Missing Firebase Admin environment variables: [...]
❌ Firebase Admin initialization error: [...]
❌ Firebase verify error: [...]
❌ Google auth error: [...]
```

## Files Changed

1. `server/package.json` - Added firebase-admin dependency
2. `server/src/config/firebase.js` - NEW: Firebase Admin initialization
3. `server/src/routes/authRoutes.js` - Updated Google auth route
4. `server/.env.example` - Added Firebase environment variables
5. `server/FIREBASE_ADMIN_SETUP.md` - NEW: Setup documentation
6. `server/QUICK_FIREBASE_SETUP.md` - NEW: Quick reference
7. `FIREBASE_AUTH_FIX_SUMMARY.md` - NEW: This file

## Next Steps

1. Follow the setup guide in `server/QUICK_FIREBASE_SETUP.md`
2. Add Firebase credentials to `server/.env`
3. Test locally
4. Deploy to production with environment variables
5. Test in production

## Support

If you encounter issues:
1. Check backend console logs for error messages
2. Verify all 3 Firebase environment variables are set
3. Ensure private key has `\n` characters and quotes
4. Check that Firebase project ID matches your project
5. Verify the service account has proper permissions

## Security Notes

- Never commit service account JSON to git
- Never commit `.env` file with real credentials
- Use different service accounts for dev and production
- Rotate service account keys periodically
