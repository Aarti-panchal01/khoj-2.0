# Quick Deploy Guide

## ✅ Code Already Pushed to GitHub

Both fixes are live on GitHub:
- Firebase Admin SDK ✅
- Token propagation fix ✅

---

## 🚀 Deploy to Production (5 Minutes)

### Step 1: Get Firebase Credentials (2 min)

1. Visit: https://console.firebase.google.com/
2. Select: **khoj-1762c**
3. Go to: ⚙️ Settings → Service accounts
4. Click: **"Generate new private key"**
5. Download the JSON file

### Step 2: Add to Production (2 min)

Go to your hosting dashboard (Render/Vercel) and add:

```
FIREBASE_PROJECT_ID = khoj-1762c

FIREBASE_CLIENT_EMAIL = (from JSON: "client_email")

FIREBASE_PRIVATE_KEY = (from JSON: "private_key" - keep \n and quotes!)
```

Save → Auto-redeploys

### Step 3: Test (1 min)

1. Go to https://khojapp.in
2. Click "Continue with Google"
3. Sign in
4. Complete onboarding
5. Should redirect to homepage ✅

---

## ✅ Success Indicators

**Backend logs:**
```
✅ Firebase Admin initialized successfully
✅ Firebase token verified successfully
✅ User logged in successfully
```

**Browser console:**
```
✅ Token saved to localStorage
🔑 Token being sent: eyJhbGci...
📡 GET /auth/me - Auth: true, Token: present
```

**User experience:**
- Google sign-in works
- No 401 errors
- Onboarding completes
- Redirects to homepage

---

## 🐛 Quick Fixes

**"Missing Firebase Admin environment variables"**
→ Add all 3 variables to production

**"Firebase Admin initialization failed"**
→ Check FIREBASE_PRIVATE_KEY has quotes and \n

**Still getting 401 errors**
→ Clear browser cache and try again

---

## 📖 Detailed Docs

- `DEPLOYMENT_CHECKLIST.md` - Full deployment guide
- `TOKEN_PROPAGATION_FIX.md` - Technical details
- `FIREBASE_FIX_README.md` - Firebase setup guide

---

## 🎉 Done!

After adding Firebase credentials and redeploying, everything should work! 🚀
