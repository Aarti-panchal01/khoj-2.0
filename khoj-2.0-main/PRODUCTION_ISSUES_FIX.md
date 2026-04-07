# 🚨 Production Issues - Quick Fix

## Issues Found
1. ❌ Render backend PORT=587 (should be 4000)
2. ❌ GOOGLE_CLIENT_ID not configured on Render
3. ❌ CORS errors preventing authentication

## Fix (5 minutes)

### Step 1: Go to Render Dashboard
https://dashboard.render.com

### Step 2: Click Your Backend Service
Find `khoj-1.0` or similar backend service

### Step 3: Go to Settings → Environment

**DELETE or CHANGE these variables:**

```
PORT=4000  ← Change from 587 to 4000
NODE_ENV=production
GOOGLE_CLIENT_ID=16568915138-2jm1k3462gipcmqi2u144lco5abqr0ng.apps.googleusercontent.com
```

**Make sure these are set:**
```
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb+srv://khojappteam:sang04102006@ac-yvmdj6j-shard-00-00.t5mxrfr.mongodb.net:27017,ac-yvmdj6j-shard-00-01.t5mxrfr.mongodb.net:27017,ac-yvmdj6j-shard-00-02.t5mxrfr.mongodb.net:27017/?ssl=true&replicaSet=atlas-6h99yn-shard-0&authSource=admin&appName=Cluster0
JWT_SECRET=cdb96f91528db0ad137fdaf517468b2c0f6ca25303e7e8d020108dafa780fde9bbe8fca4d460e2597dad57eafe4272b84192c32943002fba7b061ae460eba42b
JWT_REFRESH_SECRET=68428df87222c4e5fd598032f6a2cf88a67fe7aa93b9d9c847277745cb30289f520705f6bbb840a91f47e215ee7d0a6322b6043b3503b6312b45f895506576c2
CLIENT_ORIGIN=https://khoj-2-0.vercel.app,https://www.khojapp.in,https://khojapp.in
GOOGLE_CLIENT_ID=16568915138-2jm1k3462gipcmqi2u144lco5abqr0ng.apps.googleusercontent.com
CLOUDINARY_CLOUD_NAME=dcleknvcv
CLOUDINARY_API_KEY=478554286536637
CLOUDINARY_API_SECRET=snBhNclOV8A20BmjuorTFFI14Eg
FIREBASE_PROJECT_ID=khoj-1762c
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Step 4: Save & Redeploy
1. Click **Save** (if you made changes)
2. Go to **Deployments** section
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait 5 minutes

### Step 5: Test
After deployment completes:
1. Go to https://www.khojapp.in/signup
2. Click "Sign up with Google"
3. Should work now! ✅

---

## What was wrong?

| Issue | Cause | Fix |
|-------|-------|-----|
| Port 587 | Wrong PORT env var | Set to 4000 |
| Google error | GOOGLE_CLIENT_ID empty | Set the Google OAuth ID |
| CORS errors | CLIENT_ORIGIN mismatch | Verify Vercel domain matches |

---

**Still having issues?**
1. Check Render Logs tab for errors
2. Verify all env vars are exactly as shown above
3. Wait 5 minutes after redeploy for startup

