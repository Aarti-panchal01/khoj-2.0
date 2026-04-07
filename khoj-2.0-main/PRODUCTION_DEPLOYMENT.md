# 🚀 Production Deployment Guide - Khoj 2.0

> **Status:** ✅ Code pushed to GitHub | Ready for production deployment

---

## Quick Summary

Your application has been updated with:
- ✅ Google OAuth authentication flow (login → onboarding → homepage)
- ✅ Production environment configuration
- ✅ Proper API routing setup
- ✅ All changes committed to GitHub main branch

Now we need to configure and deploy on **Render (Backend)** and **Vercel (Frontend)**.

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Render Account** - https://render.com (free tier available)
2. **Vercel Account** - https://vercel.com (free tier available)
3. **Access to both dashboards** from your GitHub-connected accounts

---

## 🔧 Part 1: RENDER Backend Deployment

### Step 1: Access Render Dashboard
1. Go to https://dashboard.render.com
2. Log in with GitHub account
3. Find your backend service named **`khoj-backend`**

### Step 2: Update Environment Variables

Click on the service → **Settings** → **Environment** → Add/Update these variables:

```
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb+srv://khojappteam:sang04102006@ac-yvmdj6j-shard-00-00.t5mxrfr.mongodb.net:27017,ac-yvmdj6j-shard-00-01.t5mxrfr.mongodb.net:27017,ac-yvmdj6j-shard-00-02.t5mxrfr.mongodb.net:27017/?ssl=true&replicaSet=atlas-6h99yn-shard-0&authSource=admin&appName=Cluster0
JWT_SECRET=cdb96f91528db0ad137fdaf517468b2c0f6ca25303e7e8d020108dafa780fde9bbe8fca4d460e2597dad57eafe4272b84192c32943002fba7b061ae460eba42b
JWT_REFRESH_SECRET=68428df87222c4e5fd598032f6a2cf88a67fe7aa93b9d9c847277745cb30289f520705f6bbb840a91f47e215ee7d0a6322b6043b3503b6312b45f895506576c2
CLIENT_ORIGIN=https://khojapp.in,https://www.khojapp.in,https://[your-vercel-domain].vercel.app
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

### Step 3: Save & Redeploy

1. Click **Save** after updating variables
2. Scroll to top → Click **Manual Deploy** button
3. Select **Deploy latest commit**
4. Wait 5-10 minutes for deployment to complete
5. Check the **Logs** tab to verify successful startup

✅ Look for: `✅ Server running on port 4000`

### Step 4: Get Your Backend URL

Once deployed successfully:
1. Go to **Settings** → **Domains**
2. Copy your render URL (something like `https://khoj-backend-xxxxx.onrender.com`)
3. **Save this URL** - you'll need it for Vercel

---

## 🎨 Part 2: VERCEL Frontend Deployment

### Step 1: Access Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Log in with GitHub account
3. Find your project named **`khoj`** or **`khoj-2.0`**

### Step 2: Update Environment Variables

Click on project → **Settings** → **Environment Variables**

Add/Update these variables for **Production**:

```
VITE_API_URL=https://[your-render-backend].onrender.com/api
VITE_GOOGLE_CLIENT_ID=16568915138-2jm1k3462gipcmqi2u144lco5abqr0ng.apps.googleusercontent.com
```

**Example:**
```
VITE_API_URL=https://khoj-backend-abc123.onrender.com/api
VITE_GOOGLE_CLIENT_ID=16568915138-2jm1k3462gipcmqi2u144lco5abqr0ng.apps.googleusercontent.com
```

### Step 3: Redeploy

1. Click **Deployments** tab
2. Find the latest deployment
3. Click **... (three dots)** → **Redeploy**
4. Confirm redeploy
5. Wait 2-3 minutes for deployment
6. Check **Logs** for successful build

✅ Look for green checkmark and URL like `https://khoj-9xyz.vercel.app`

---

## ✅ Step 3: Production Verification

After both deployments are complete, test the full flow:

### Test 1: Google Signup Flow
1. Go to: `https://[your-vercel-domain].vercel.app/login`
2. Click **"🔍 Continue with Google"**
3. Select/authorize your Google account
4. ✅ Should redirect to `/onboarding`

### Test 2: Complete Onboarding
1. Fill in name and phone
2. Select university (e.g., "Bangalore University")
3. Select campus
4. Click **"Save and continue"**
5. ✅ Should redirect to homepage `/`

### Test 3: Logout & Login Loop
1. On homepage, find logout button (profile menu)
2. Click **Logout**
3. Go back to `/login`
4. Click **"🔍 Continue with Google"** again
5. ✅ Should go directly to homepage (skip onboarding for existing users)

### Test 4: Check Network Requests
Open DevTools (F12) → **Console** tab:
- ✅ No 401 errors
- ✅ No CORS errors
- ✅ Google auth token logs visible
- ✅ Clean authentication flow

---

## 🔒 Security Checklist

- ✅ Google OAuth Client ID is configured
- ✅ JWT secrets are strong (min 64 chars)
- ✅ MongoDB Atlas has IP whitelist configured
- ✅ CORS origin is set to your production domain
- ✅ Environment variables are NOT in code (only in deployment platform)
- ✅ .env files are in .gitignore (never committed)

---

## 📱 Update Your Production Domain

If you have a custom domain (e.g., `khojapp.in`):

### Vercel
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records (Vercel will provide instructions)

### Render
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records or CNAME

---

## 🆘 Troubleshooting

### Issue: "Cannot find module 'google-auth-library'"
- **Solution:** This is already fixed in the latest push. Just redeploy on Render.

### Issue: CORS errors in browser console
- **Solution:** Update `CLIENT_ORIGIN` on Render to include your Vercel domain
- Format: `https://your-vercel-domain.vercel.app`

### Issue: Google login doesn't work
- **Solution:** Verify `GOOGLE_CLIENT_ID` is set correctly on both Render and Vercel
- Should be: `16568915138-2jm1k3462gipcmqi2u144lco5abqr0ng.apps.googleusercontent.com`

### Issue: API returns 401 (Unauthorized)
- **Solution:** Check that `JWT_SECRET` and `JWT_REFRESH_SECRET` match between Render and your local .env
- In production, use the values from `.env.example` or generate new ones with `openssl rand -hex 64`

### Issue: Deployment stuck or failing
- **Solution:** 
  1. Check the Logs tab for specific error
  2. Verify all required environment variables are set
  3. Click **Manual Deploy** → **Deploy latest commit** again
  4. Wait 10 minutes before concluding it failed

---

## 📊 Deployment Status Tracking

After deploying, you can track:

| Component | Status | URL |
|-----------|--------|-----|
| Backend API | 🔄 Deploying | https://dashboard.render.com/services/khoj-backend |
| Frontend | 🔄 Deploying | https://vercel.com/dashboard |
| GitHub Commit | ✅ Pushed | [View on GitHub](https://github.com/Aarti-panchal01/khoj-2.0) |

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ Backend service says "Live" on Render
✅ Frontend deployment shows green checkmark on Vercel
✅ Google login works without errors
✅ Onboarding flow completes successfully
✅ Dashboard/homepage loads and displays items
✅ No CORS or authentication errors in console

---

## 📞 Next Steps

1. **Deploy to Render** (backend)
2. **Deploy to Vercel** (frontend) with correct API URL
3. **Test production flow** (Google login → onboarding → homepage)
4. **Monitor logs** for any errors
5. **Update DNS** if using custom domain

---

**Current Commit:** `f527790` - Google OAuth and production verification
**Branch:** `main` (production-ready)
**Last Update:** April 8, 2026

