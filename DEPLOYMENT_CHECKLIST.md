# Deployment Checklist

## ✅ Code Changes Pushed to GitHub

Both fixes are now on GitHub:
1. ✅ Firebase Admin SDK implementation
2. ✅ Token propagation fix

## 🔥 Manual Steps Required

### Step 1: Add Firebase Environment Variables to Production

You need to add these 3 environment variables to your production server (Render/Vercel/etc.):

#### Get Firebase Credentials:
1. Go to: https://console.firebase.google.com/
2. Select project: **khoj-1762c**
3. Click ⚙️ → **Project settings** → **Service accounts**
4. Click **"Generate new private key"**
5. Download the JSON file

#### Add to Production Server:

**For Render:**
1. Go to: https://dashboard.render.com/
2. Select your backend service
3. Go to "Environment" tab
4. Add these variables:

```
FIREBASE_PROJECT_ID
Value: khoj-1762c

FIREBASE_CLIENT_EMAIL
Value: (copy from JSON file - looks like firebase-adminsdk-xxxxx@khoj-1762c.iam.gserviceaccount.com)

FIREBASE_PRIVATE_KEY
Value: (copy entire private_key from JSON - keep the \n characters and quotes!)
```

5. Click "Save Changes"
6. Render will automatically redeploy

**For Vercel/Railway:**
Same process - add the 3 environment variables in your platform's dashboard.

---

## 🧪 Testing After Deployment

### 1. Check Backend Logs

After deployment completes, check your backend logs for:
```
✅ Firebase Admin initialized successfully
   Project ID: khoj-1762c
   Client Email: firebase-adminsdk-...
```

### 2. Test Google Sign-In

1. Go to your production site: https://khojapp.in
2. Click "Continue with Google"
3. Sign in with your Google account

### 3. Check Backend Logs During Sign-In

You should see:
```
✅ Firebase token verified successfully
   UID: abc123...
   Email: user@example.com
✅ User logged in successfully: user@example.com
```

### 4. Check Browser Console

You should see:
```
🔐 Starting Google login...
✅ Google signin successful: user@example.com
✅ ID token obtained
✅ Backend authentication successful
✅ Token saved to localStorage
✅ Token saved, user set
🔑 Token being sent: eyJhbGciOiJIUzI1NiIs...
📡 GET /auth/me - Auth: true, Token: present
```

### 5. Complete Onboarding

If you're a new user:
1. Fill in name, phone, university, campus
2. Click "Save and continue"
3. Should redirect to homepage (no 401 errors!)

### 6. Verify Protected Routes Work

After login:
- Profile page should load
- Post item should work
- Claims management should work
- All should show user data correctly

---

## ✅ Success Indicators

### Backend Logs:
- ✅ Firebase Admin initialized successfully
- ✅ Firebase token verified successfully
- ✅ User logged in successfully

### Frontend Console:
- ✅ Token saved to localStorage
- ✅ Token being sent with requests
- ✅ No 401 errors on /api/auth/me
- ✅ No 401 errors on /api/auth/profile

### User Experience:
- ✅ Google sign-in works
- ✅ Onboarding completes
- ✅ Redirects to homepage
- ✅ Protected pages load correctly

---

## 🐛 Troubleshooting

### Backend: "Missing Firebase Admin environment variables"
→ Add all 3 Firebase variables to production environment
→ Check for typos in variable names

### Backend: "Firebase Admin initialization failed"
→ Check FIREBASE_PRIVATE_KEY format
→ Must have quotes and \n characters
→ Copy entire value from JSON file

### Frontend: Still getting 401 errors
→ Clear browser cache and localStorage
→ Try signing in again
→ Check browser console for token logs
→ Verify backend logs show token verification

### Onboarding fails with 401
→ Check browser console for "Token being sent" log
→ Verify token exists in localStorage
→ Check backend logs for authentication errors

---

## 📊 Deployment Timeline

1. **Add Firebase env vars**: 5 minutes (manual)
2. **Redeploy**: 2-3 minutes (automatic)
3. **Test**: 5 minutes
4. **Total**: ~15 minutes

---

## 🎉 What's Fixed

After deployment with Firebase credentials:

### Firebase Admin SDK:
✅ Backend can verify Firebase ID tokens
✅ Google sign-in authentication works
✅ Users can be created/logged in via Google

### Token Propagation:
✅ Token is stored in localStorage
✅ Token is sent with all protected requests
✅ Authorization header is properly formatted
✅ /api/auth/me returns user data
✅ /api/auth/profile updates work
✅ Onboarding completes successfully

---

## 📝 Summary

**What you need to do:**
1. Download Firebase service account JSON
2. Add 3 environment variables to production
3. Wait for redeploy
4. Test Google sign-in

**What happens automatically:**
- Code is already on GitHub
- Production will pull latest code
- Frontend and backend will use new code
- Token propagation will work correctly

**Time required:** ~15 minutes total

---

## 📞 Need Help?

If issues persist after deployment:
1. Check backend logs for error messages
2. Check browser console for token logs
3. Verify all 3 Firebase env vars are set
4. Try clearing browser cache/localStorage
5. Review `TOKEN_PROPAGATION_FIX.md` for technical details
6. Review `FIREBASE_FIX_README.md` for Firebase setup details
