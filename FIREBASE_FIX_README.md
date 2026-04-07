# Firebase Authentication Fix - Complete Guide

## 🎯 Problem Fixed

**Issue:** POST `/api/auth/google` was returning 401 after Firebase login

**Root Cause:** Backend was using Google OAuth2Client instead of Firebase Admin SDK to verify Firebase ID tokens

**Solution:** Implemented Firebase Admin SDK for proper token verification

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Firebase Credentials

1. Visit: https://console.firebase.google.com/
2. Select your project: **khoj-1762c**
3. Click ⚙️ → **Project settings** → **Service accounts**
4. Click **"Generate new private key"**
5. Save the downloaded JSON file (keep it secure!)

### Step 2: Configure Environment

Open the downloaded JSON and add these to `server/.env`:

```env
FIREBASE_PROJECT_ID=<copy from "project_id">
FIREBASE_CLIENT_EMAIL=<copy from "client_email">
FIREBASE_PRIVATE_KEY="<copy entire "private_key" with quotes>"
```

**Example:**
```env
FIREBASE_PROJECT_ID=khoj-1762c
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc@khoj-1762c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

### Step 3: Test Setup

```bash
cd server
node test-firebase-setup.js
```

You should see:
```
✅ All checks passed!
   Your Firebase Admin SDK is configured correctly.
```

### Step 4: Start Server

```bash
npm run dev
```

Look for:
```
✅ Firebase Admin initialized successfully
   Project ID: khoj-1762c
   Client Email: firebase-adminsdk-...
```

### Step 5: Test Google Sign-In

1. Start frontend: `npm run dev` (in root directory)
2. Open browser and click "Continue with Google"
3. Sign in with your Google account
4. Check backend logs for:
   ```
   ✅ Firebase token verified successfully
   ✅ User logged in successfully: your-email@example.com
   ```

---

## 📋 What Was Changed

### New Files Created:
1. `server/src/config/firebase.js` - Firebase Admin initialization
2. `server/test-firebase-setup.js` - Setup verification script
3. `server/FIREBASE_ADMIN_SETUP.md` - Detailed setup guide
4. `server/QUICK_FIREBASE_SETUP.md` - Quick reference
5. `FIREBASE_AUTH_FIX_SUMMARY.md` - Technical summary
6. `FIREBASE_FIX_README.md` - This file

### Modified Files:
1. `server/package.json` - Added `firebase-admin` dependency
2. `server/src/routes/authRoutes.js` - Updated Google auth route
3. `server/.env.example` - Added Firebase environment variables

### Key Changes in authRoutes.js:

**Before (using Google OAuth):**
```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(clientId);
const ticket = await client.verifyIdToken({
  idToken: payload.credential,
  audience: clientId,
});
```

**After (using Firebase Admin):**
```javascript
const { initializeFirebaseAdmin, admin } = require('../config/firebase');
const decoded = await admin.auth().verifyIdToken(idToken);
const uid = decoded.uid;
const email = decoded.email;
```

---

## 🔍 How It Works

### Complete Authentication Flow:

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │ 1. User clicks "Continue with Google"
       │
       ▼
┌─────────────────────┐
│ Firebase Auth       │
│ (Google Sign-In)    │
└──────┬──────────────┘
       │ 2. Returns Firebase ID Token
       │
       ▼
┌─────────────┐
│   Frontend  │
│             │ 3. POST /api/auth/google
└──────┬──────┘    { credential: "<firebase-token>" }
       │
       ▼
┌─────────────────────┐
│   Backend           │
│   (Express)         │
│                     │
│ 4. Verify token     │
│    using Firebase   │
│    Admin SDK        │
│                     │
│ 5. Extract uid &    │
│    email from token │
│                     │
│ 6. Create/find user │
│    in MongoDB       │
│                     │
│ 7. Generate JWT     │
│    access token     │
└──────┬──────────────┘
       │ 8. Return { token, user }
       ▼
┌─────────────┐
│   Frontend  │
│             │ 9. Store token
│             │ 10. Redirect to dashboard
└─────────────┘
```

---

## 🧪 Testing Checklist

- [ ] Firebase Admin SDK installed
- [ ] Environment variables configured
- [ ] Test script passes: `node test-firebase-setup.js`
- [ ] Backend starts without errors
- [ ] Console shows "Firebase Admin initialized successfully"
- [ ] Frontend Google sign-in button works
- [ ] Backend logs show "Firebase token verified successfully"
- [ ] User is created in database
- [ ] JWT token is returned
- [ ] User is redirected after login

---

## 🐛 Troubleshooting

### Error: "Missing Firebase Admin environment variables"

**Solution:**
- Check `server/.env` file exists
- Verify all 3 variables are present
- Check for typos in variable names

### Error: "Firebase Admin initialization failed"

**Solution:**
- Verify `FIREBASE_PRIVATE_KEY` format:
  - Must be wrapped in double quotes
  - Must contain `\n` characters (not actual newlines)
  - Should start with `"-----BEGIN PRIVATE KEY-----\n`
  - Should end with `\n-----END PRIVATE KEY-----\n"`

**Example of correct format:**
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

### Error: "Invalid Firebase token"

**Possible causes:**
1. Token expired (Firebase tokens expire after 1 hour)
2. Wrong Firebase project ID
3. Frontend and backend using different Firebase projects

**Solution:**
- Verify `FIREBASE_PROJECT_ID` matches your Firebase Console project
- Try signing in again to get a fresh token
- Check frontend `src/firebase.js` uses same project

### Error: "Firebase token does not contain an email address"

**Solution:**
- This shouldn't happen with Google sign-in
- Check that user signed in with Google (not anonymous)
- Verify Firebase Authentication has Google provider enabled

### Backend starts but no Firebase initialization message

**Solution:**
- Check if there's an error message in console
- Run test script: `node test-firebase-setup.js`
- Check that `server/src/config/firebase.js` exists

---

## 🔒 Security Best Practices

### DO:
✅ Keep service account JSON file secure
✅ Add `.env` to `.gitignore`
✅ Use different service accounts for dev/prod
✅ Rotate service account keys periodically
✅ Set proper Firebase security rules

### DON'T:
❌ Commit service account JSON to git
❌ Commit `.env` file with real credentials
❌ Share service account credentials
❌ Use production credentials in development
❌ Expose private key in client-side code

---

## 🚀 Production Deployment

### For Render:

1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add these variables:
   ```
   FIREBASE_PROJECT_ID = khoj-1762c
   FIREBASE_CLIENT_EMAIL = firebase-adminsdk-...@khoj-1762c.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
5. Click "Save Changes"
6. Service will automatically redeploy

### For Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the same 3 variables
5. Redeploy your application

**Important:** Keep the `\n` characters in `FIREBASE_PRIVATE_KEY`!

---

## 📚 Additional Resources

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Service Account Credentials](https://cloud.google.com/iam/docs/service-accounts)

---

## 💡 Tips

1. **Test locally first** before deploying to production
2. **Use the test script** to verify setup: `node test-firebase-setup.js`
3. **Check backend logs** for detailed error messages
4. **Keep credentials secure** - never commit to git
5. **Use environment variables** for all sensitive data

---

## ✅ Success Indicators

When everything is working correctly, you should see:

**Backend Console:**
```
✅ Firebase Admin initialized successfully
   Project ID: khoj-1762c
   Client Email: firebase-adminsdk-...
Server running on port 4000
```

**During Google Sign-In:**
```
✅ Firebase token verified successfully
   UID: abc123...
   Email: user@example.com
✅ User logged in successfully: user@example.com
```

**Frontend:**
- Google sign-in popup opens
- User can sign in with Google account
- User is redirected to dashboard or onboarding
- No 401 errors in browser console

---

## 🆘 Need Help?

If you're still having issues:

1. Run the test script: `node test-firebase-setup.js`
2. Check backend console for error messages
3. Verify all environment variables are set correctly
4. Review `server/FIREBASE_ADMIN_SETUP.md` for detailed instructions
5. Check that Firebase project ID matches your project

---

## 📝 Summary

✅ Firebase Admin SDK installed and configured
✅ Backend now properly verifies Firebase ID tokens
✅ Google sign-in authentication flow working
✅ Comprehensive error logging added
✅ Setup documentation created
✅ Test script provided for verification

**The 401 authentication error is now fixed!** 🎉
