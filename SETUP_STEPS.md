# Firebase Admin Setup - Quick Steps

## 🎯 Goal
Fix the 401 error when signing in with Google by configuring Firebase Admin SDK.

---

## ⚡ 3-Minute Setup

### 1. Download Credentials (1 min)
```
https://console.firebase.google.com/
→ Select "khoj-1762c" project
→ ⚙️ Settings → Service accounts
→ "Generate new private key"
→ Download JSON file
```

### 2. Add to server/.env (1 min)
```env
FIREBASE_PROJECT_ID=khoj-1762c
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@khoj-1762c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key\n-----END PRIVATE KEY-----\n"
```

Copy these values from the downloaded JSON file.

### 3. Test (1 min)
```bash
cd server
node test-firebase-setup.js
```

Should see: `✅ All checks passed!`

### 4. Start & Test
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd ..
npm run dev

# Browser - Test Google sign-in
```

---

## ✅ Success Checklist

Backend console shows:
```
✅ Firebase Admin initialized successfully
```

When signing in with Google:
```
✅ Firebase token verified successfully
✅ User logged in successfully
```

---

## 🐛 Quick Fixes

**"Missing environment variables"**
→ Check all 3 variables are in `server/.env`

**"Initialization failed"**
→ Verify `FIREBASE_PRIVATE_KEY` has quotes and `\n` characters

**"Invalid token"**
→ Check `FIREBASE_PROJECT_ID` matches your Firebase project

---

## 📖 Full Documentation

- `FIREBASE_FIX_README.md` - Complete guide
- `server/QUICK_FIREBASE_SETUP.md` - Quick reference
- `server/FIREBASE_ADMIN_SETUP.md` - Detailed setup
- `FIREBASE_AUTH_FIX_SUMMARY.md` - Technical details

---

## 🚀 Production

Add the same 3 environment variables to Render/Vercel dashboard.

**Done!** 🎉
