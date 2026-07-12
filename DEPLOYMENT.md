# Complete Deployment Guide - Khoj Lost & Found on Khojapp.in

This comprehensive guide covers deploying your Khoj application to your custom domain **Khojapp.in** with professional hosting.

## Table of Contents
- [Overview & Architecture](#overview--architecture)
- [Server Options & Costs](#server-options--costs)
- [Prerequisites](#prerequisites)
- [Step 1: Setup MongoDB Database](#step-1-setup-mongodb-database)
- [Step 2: Deploy Backend](#step-2-deploy-backend)
- [Step 3: Deploy Frontend](#step-3-deploy-frontend)
- [Step 4: Configure Domain (Khojapp.in)](#step-4-configure-domain-khojappin)
- [Step 5: Setup SSL/HTTPS](#step-5-setup-sslhttps)
- [Step 6: Final Testing](#step-6-final-testing)
- [Ongoing Maintenance](#ongoing-maintenance)
- [Cost Summary](#cost-summary)

---

## Overview & Architecture

Your application will be deployed as:

```
┌─────────────────────────────────────────────────────────────┐
│                      KHOJAPP.IN                              │
│                    (Your Domain)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴──────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│   Frontend       │                  │    Backend       │
│   Vercel/Netlify │                  │  Render/Railway  │
│   khojapp.in     │←─── calls ──────→│  api.khojapp.in  │
└──────────────────┘                  └──────────────────┘
                                             ↓
                                   ┌──────────────────┐
                                   │  MongoDB Atlas   │
                                   │   (Database)     │
                                   └──────────────────┘
```

**URLs:**
- **Main App**: https://khojapp.in or https://www.khojapp.in
- **API Backend**: https://api.khojapp.in

---

## Server Options & Costs

### Recommended Setup (Best Value for Students/Startups)

| Service | Purpose | Plan | Cost | Why This Choice |
|---------|---------|------|------|-----------------|
| **Vercel** | Frontend Hosting | Hobby (Free) | $0/month | Fast, auto-scaling, perfect for React/Vite |
| **Render** | Backend API | Free Tier | $0/month | Easy Node.js hosting, auto-deploy from Git |
| **MongoDB Atlas** | Database | M0 Free Tier | $0/month | 512MB storage, perfect for starting |
| **Cloudflare** | DNS & CDN | Free | $0/month | Fast DNS, SSL, DDoS protection |

**Total Cost: $0/month** ✨ (Perfect for MVP and initial launch)

### Alternative: Production-Grade Setup

If you need better performance and uptime (for 1000+ users):

| Service | Purpose | Plan | Cost | Features |
|---------|---------|------|------|----------|
| **Vercel** | Frontend | Pro | $20/month | More bandwidth, better support |
| **Render** | Backend | Starter | $7/month | Always-on, 512MB RAM, no cold starts |
| **MongoDB Atlas** | Database | M10 | $9/month | 2GB RAM, 10GB storage, backups |
| **Cloudflare** | DNS | Free | $0/month | Same features |

**Total Cost: $36/month**

### Enterprise Option (High Traffic)

For 10,000+ active users:

| Service | Purpose | Plan | Cost |
|---------|---------|------|------|
| **AWS/DigitalOcean** | VPS | 2GB Droplet | $12-18/month |
| **Vercel/Cloudflare Pages** | Frontend | Pro | $20/month |
| **MongoDB Atlas** | Database | M30 | $60/month |

**Total Cost: $92-98/month**

---

## Prerequisites

Before you begin, make sure you have:

- ✅ Domain name **Khojapp.in** purchased and accessible
- ✅ GitHub account (for code repository)
- ✅ Your code pushed to GitHub
- ✅ MongoDB Atlas account (free)
- ✅ Email access for verifications

**Time Required:**
- First time: 2-3 hours
- With this guide: 45-60 minutes

---

## Step 1: Setup MongoDB Database

### 1.1 Create MongoDB Atlas Account

1. **Go to MongoDB Atlas**
   - Visit: https://cloud.mongodb.com/
   - Click "Try Free" or "Sign Up"
   - Sign up with Google/GitHub (faster) or email

2. **Create Organization**
   - Name: `Khoj` or your preferred name
   - Click "Next"

3. **Create Project**
   - Project Name: `Khoj Production`
   - Click "Create Project"

### 1.2 Create Database Cluster

1. **Build a Database**
   - Click "Build a Database" button
   - Choose **M0 FREE** tier
   - Cloud Provider: **AWS** (recommended)
   - Region: Choose closest to your users:
     - India users: `Mumbai (ap-south-1)`
     - Global: `N. Virginia (us-east-1)`
   - Cluster Name: `Khoj-Cluster` (or leave default)
   - Click **"Create"**

2. **Setup Security - Database User**

   You'll see "Security Quickstart":

   a. **Authentication Method**: Username and Password

   b. **Create Database User**:
   ```
   Username: khoj_admin
   Password: [Click "Autogenerate Secure Password"]
   ```

   c. **IMPORTANT**: Copy and save the password immediately!
   ```
   Example: a7B9cD2eF4gH6iJ8k
   ```

   d. Click **"Create User"**

3. **Setup Network Access**

   Still in Security Quickstart:

   a. **Connection Location**:
   - Click "Add My Current IP Address" (for now)
   - Then click "Add a Different IP Address"
   - Enter: `0.0.0.0/0` (allows from anywhere - needed for Render/Vercel)
   - Description: `Allow from anywhere (production)`
   - Click "Add Entry"

   b. Click **"Finish and Close"**

### 1.3 Get Connection String

1. **Click "Connect"** on your cluster

2. **Choose "Drivers"**

3. **Select**:
   - Driver: Node.js
   - Version: 5.5 or later

4. **Copy Connection String**:
   ```
   mongodb+srv://khoj_admin:<password>@khoj-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Modify Connection String**:

   Replace `<password>` with your actual password and add database name:

   ```
   mongodb+srv://khoj_admin:YOUR_PASSWORD@khoj-cluster.xxxxx.mongodb.net/khoj?retryWrites=true&w=majority
   ```

   Save this - you'll need it soon!

### 1.4 Test Connection Locally (Optional but Recommended)

1. Update your `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://khoj_admin:YOUR_PASSWORD@khoj-cluster.xxxxx.mongodb.net/khoj?retryWrites=true&w=majority
   ```

2. Test:
   ```bash
   cd server
   npm run dev
   ```

   You should see:
   ```
   ✅ MongoDB connected successfully
   ✅ Colleges seeded successfully
   ```

---

## Step 2: Deploy Backend

We'll use **Render** (free tier) for the backend.

### 2.1 Prepare Backend for Deployment

1. **Push Code to GitHub** (if not already done):

   ```bash
   cd your-project-directory

   # Initialize git if needed
   git init
   git add .
   git commit -m "Ready for deployment"

   # Create GitHub repo and push
   # Go to github.com and create new repository called "khoj"
   git remote add origin https://github.com/YOUR_USERNAME/khoj.git
   git branch -M main
   git push -u origin main
   ```

2. **Verify File Structure**:

   Your GitHub repo should have:
   ```
   khoj/
   ├── server/
   │   ├── src/
   │   ├── package.json
   │   └── .env.example
   ├── src/
   ├── package.json
   └── README.md
   ```

### 2.2 Deploy to Render

1. **Create Render Account**
   - Go to: https://render.com/
   - Click "Get Started"
   - Sign up with **GitHub** (recommended - easier deployment)

2. **Create New Web Service**
   - Click "New +" in top right
   - Select "Web Service"

3. **Connect Repository**
   - Click "Connect account" if needed
   - Find and select your `khoj` repository
   - Click "Connect"

4. **Configure Web Service**:

   **Basic Settings:**
   ```
   Name: khoj-backend
   Region: Singapore (for India) or Oregon (for global)
   Branch: main
   Root Directory: server
   ```

   **Build & Deploy:**
   ```
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

   **Instance Type:**
   ```
   Plan: Free (0$)
   ```

5. **Add Environment Variables**

   Scroll down to "Environment Variables" section.

   Click "Add Environment Variable" and add these one by one:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
   | `MONGODB_URI` | `mongodb+srv://khoj_admin:YOUR_PASSWORD@...` (your full connection string) |
   | `JWT_SECRET` | Generate using command below |
   | `CLIENT_ORIGIN` | `https://khojapp.in,https://www.khojapp.in` |
   | `RATE_LIMIT_MAX` | `100` |
   | `JWT_ACCESS_EXPIRY` | `15m` |
   | `JWT_REFRESH_EXPIRY` | `7d` |

   **Generate JWT Secret**:
   ```bash
   # Run this in your terminal
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and use it as `JWT_SECRET`

6. **Create Web Service**

   - Scroll to bottom
   - Click **"Create Web Service"**
   - Wait 3-5 minutes for deployment

7. **Get Backend URL**

   Once deployed, you'll see:
   ```
   https://khoj-backend.onrender.com
   ```

   **Copy this URL** - you'll need it for frontend!

8. **Test Backend**

   In your browser or terminal:
   ```bash
   curl https://khoj-backend.onrender.com/health

   # Should return:
   {"status":"ok"}
   ```

   Test campuses endpoint:
   ```bash
   curl https://khoj-backend.onrender.com/api/campuses

   # Should return college data
   ```

### 2.3 Configure Custom Domain for Backend

1. **In Render Dashboard**:
   - Click on your `khoj-backend` service
   - Go to "Settings" tab
   - Scroll to "Custom Domain"
   - Click "Add Custom Domain"

2. **Add Domain**:
   ```
   Custom Domain: api.khojapp.in
   ```
   - Click "Add"

3. **You'll see DNS instructions** like:
   ```
   Add a CNAME record:
   Name: api
   Value: khoj-backend.onrender.com
   ```

   **Save these instructions** - we'll configure DNS later!

---

## Step 3: Deploy Frontend

We'll use **Vercel** (free tier) for the frontend.

### 3.1 Prepare Frontend for Deployment

1. **Update Environment Variables**

   Edit `.env.production`:
   ```env
   VITE_API_URL=https://api.khojapp.in/api
   ```

   Save and commit:
   ```bash
   git add .env.production
   git commit -m "Update production API URL"
   git push
   ```

2. **Verify vercel.json Exists**

   Check if `vercel.json` exists in root:
   ```bash
   cat vercel.json
   ```

   Should show:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### 3.2 Deploy to Vercel

1. **Create Vercel Account**
   - Go to: https://vercel.com/
   - Click "Sign Up"
   - Choose "Continue with GitHub"
   - Authorize Vercel

2. **Import Project**
   - Click "Add New..." → "Project"
   - Find your `khoj` repository
   - Click "Import"

3. **Configure Project**:

   **Framework Preset**: Vite

   **Root Directory**: `./` (leave as is, don't change)

   **Build Settings**:
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**

   Click "Environment Variables" section

   Add:
   ```
   Name: VITE_API_URL
   Value: https://api.khojapp.in/api
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - You'll get a temporary URL like: `khoj-xyz123.vercel.app`

6. **Test Deployment**

   Visit: `https://khoj-xyz123.vercel.app`

   - You should see your app
   - Try signing up (it should work with backend!)

### 3.3 Configure Custom Domain for Frontend

1. **In Vercel Dashboard**:
   - Go to your project
   - Click "Settings" tab
   - Click "Domains" in sidebar

2. **Add Domain**:
   - Enter: `khojapp.in`
   - Click "Add"
   - Also add: `www.khojapp.in`
   - Click "Add"

3. **You'll see DNS instructions**:

   For `khojapp.in`:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   For `www.khojapp.in`:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

   **Save these instructions** - next step!

---

## Step 4: Configure Domain (Khojapp.in)

Now we'll configure your domain to point to both frontend and backend.

### 4.1 Access Your Domain Registrar

Where did you buy `khojapp.in`? Common registrars:
- GoDaddy
- Namecheap
- Google Domains
- Hostinger
- BigRock (India)

**Steps below use generic terms - adapt to your registrar.**

### 4.2 Configure DNS Records

1. **Login to Domain Registrar**
   - Go to your domain provider's website
   - Login to your account
   - Find "Domains" or "My Domains"
   - Click "Manage" on `khojapp.in`

2. **Go to DNS Settings**
   - Look for "DNS Settings", "DNS Management", or "Advanced DNS"
   - Click to open DNS editor

3. **Add/Edit DNS Records**

   **Delete any existing A/CNAME records** for @ and www first!

   Then add these records:

   | Type | Name/Host | Value/Points To | TTL |
   |------|-----------|-----------------|-----|
   | **A** | `@` | `76.76.21.21` | 3600 |
   | **CNAME** | `www` | `cname.vercel-dns.com` | 3600 |
   | **CNAME** | `api` | `khoj-backend.onrender.com` | 3600 |

   **Explanation:**
   - `@` (root domain) → Points to Vercel IP (frontend)
   - `www` subdomain → Points to Vercel (frontend)
   - `api` subdomain → Points to Render (backend)

4. **Save Changes**

   Click "Save" or "Update"

### 4.3 Wait for DNS Propagation

- **Local**: 5-10 minutes
- **Global**: Up to 48 hours (usually 1-2 hours)

**Check DNS Propagation**:
```bash
# Check main domain
nslookup khojapp.in

# Check API subdomain
nslookup api.khojapp.in

# Or use online tools:
# https://www.whatsmydns.net/
```

### 4.4 Verify in Vercel and Render

1. **Vercel**:
   - Go to Settings → Domains
   - Wait until you see green checkmarks next to:
     - `khojapp.in` ✓
     - `www.khojapp.in` ✓

2. **Render**:
   - Go to Settings → Custom Domain
   - Wait for `api.khojapp.in` to show "Verified" ✓

---

## Step 5: Setup SSL/HTTPS

**Good news!** Both Vercel and Render automatically provision SSL certificates.

### 5.1 Vercel SSL (Frontend)

1. **Automatic SSL**:
   - Vercel auto-provisions Let's Encrypt SSL
   - Usually takes 1-5 minutes after DNS verification
   - Check: Settings → Domains → SSL status

2. **Verify HTTPS**:
   ```bash
   curl -I https://khojapp.in

   # Should return: HTTP/2 200
   ```

### 5.2 Render SSL (Backend)

1. **Automatic SSL**:
   - Render auto-provisions SSL for custom domains
   - Takes 1-10 minutes after DNS verification

2. **Verify HTTPS**:
   ```bash
   curl https://api.khojapp.in/health

   # Should return: {"status":"ok"}
   ```

### 5.3 Update Backend CORS

**Important!** Update CORS to use new domain:

1. **Go to Render Dashboard**
   - Click on `khoj-backend`
   - Go to "Environment" tab
   - Find `CLIENT_ORIGIN` variable
   - Click "Edit"
   - Update value to:
     ```
     https://khojapp.in,https://www.khojapp.in
     ```
   - Click "Save Changes"

2. **Service will auto-redeploy** (takes 1-2 minutes)

---

## Step 6: Final Testing

### 6.1 Test Backend API

1. **Health Check**:
   ```bash
   curl https://api.khojapp.in/health
   ```
   Expected: `{"status":"ok"}`

2. **Campuses Endpoint**:
   ```bash
   curl https://api.khojapp.in/api/campuses
   ```
   Expected: Array of colleges

### 6.2 Test Frontend

1. **Visit Your Domain**:
   ```
   https://khojapp.in
   ```

2. **Test College Suggestions**:
   - Click "Sign Up"
   - In "College/University" field, type "PES"
   - You should see suggestions! ✨
   - Select "PES University"
   - Campus suggestions should appear!

3. **Complete Signup Flow**:
   - Fill all fields
   - Submit
   - Should successfully create account

4. **Test Item Posting**:
   - Login
   - Click "Post Item"
   - Fill form
   - Submit
   - Item should appear in feed

### 6.3 Check Browser Console

1. Open DevTools (F12)
2. Check Console tab - should be no errors
3. Check Network tab:
   - All API calls should be to `https://api.khojapp.in`
   - All should return 200 status

---

## Ongoing Maintenance

### Daily/Weekly Tasks

**Monitor Services**:
- Check Vercel dashboard for deployments
- Check Render dashboard for backend health
- Monitor MongoDB Atlas usage

**Free Tier Limitations**:
- **Render Free**:
  - Spins down after 15 min inactivity
  - First request after spin-down takes 30-60s
  - 750 hours/month limit
- **Vercel Free**:
  - 100GB bandwidth/month
  - No limitation on requests
- **MongoDB Atlas M0**:
  - 512MB storage
  - Connection limit: 500 concurrent

### When to Upgrade?

**Upgrade Render ($7/month)** when:
- Users complain about slow first load
- You have 50+ daily active users
- You need always-on backend

**Upgrade MongoDB ($9/month)** when:
- Storage reaches 400MB (80% of 512MB)
- You have 1000+ items in database
- You need automated backups

**Upgrade Vercel ($20/month)** when:
- You exceed 100GB bandwidth
- You need analytics
- You have commercial usage

### Backup Strategy

**Automated Backups** (MongoDB Atlas M10+):
- Daily snapshots
- 7-day retention

**Manual Backups** (Free Tier):
```bash
# Export database
mongodump --uri="mongodb+srv://khoj_admin:PASSWORD@cluster.mongodb.net/khoj"

# Restore
mongorestore --uri="mongodb+srv://khoj_admin:PASSWORD@cluster.mongodb.net/khoj" dump/
```

### Update Deployment

**Backend Updates**:
1. Make changes locally
2. Commit and push to GitHub
3. Render auto-deploys (takes 2-3 min)

**Frontend Updates**:
1. Make changes locally
2. Commit and push to GitHub
3. Vercel auto-deploys (takes 1-2 min)

---

## Cost Summary

### Free Tier (Recommended Start)

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| **Vercel** | Hobby | $0 | 100GB bandwidth, unlimited requests |
| **Render** | Free | $0 | 750 hours, spins down after 15min |
| **MongoDB Atlas** | M0 | $0 | 512MB storage, 500 connections |
| **Cloudflare** | Free | $0 | Unlimited DNS queries |
| **SSL Certificates** | Let's Encrypt | $0 | Auto-renewed |
| **Total** | | **$0/month** | Perfect for 100-500 users |

### Paid Tier (Serious Project)

| Service | Plan | Cost | Benefits |
|---------|------|------|----------|
| **Vercel** | Pro | $20/month | More bandwidth, analytics, priority support |
| **Render** | Starter | $7/month | Always-on, 512MB RAM, no cold starts |
| **MongoDB Atlas** | M10 | $9/month | 2GB storage, automated backups, better performance |
| **Total** | | **$36/month** | Handles 1000-5000 users smoothly |

### Domain Cost

- **Khojapp.in**: ~₹800-1200/year (~$10-15/year)
- Renewal: Same price annually

---

## Troubleshooting

### Frontend Not Loading

**Check DNS**:
```bash
nslookup khojapp.in
```

**Check Vercel**:
- Settings → Domains → Verify green checkmarks

### Backend Not Responding

**Check DNS**:
```bash
nslookup api.khojapp.in
```

**Check Render logs**:
- Dashboard → Logs tab → Look for errors

### CORS Errors

**Fix**:
1. Render Dashboard → Environment
2. Update `CLIENT_ORIGIN`: `https://khojapp.in,https://www.khojapp.in`
3. Save and redeploy

### College Suggestions Not Working

**Check**:
1. Backend health: `curl https://api.khojapp.in/health`
2. Campuses endpoint: `curl https://api.khojapp.in/api/campuses`
3. Frontend .env.production has: `VITE_API_URL=https://api.khojapp.in/api`
4. Browser console for API errors

### Database Connection Issues

**Check MongoDB Atlas**:
1. Network Access → Verify `0.0.0.0/0` is added
2. Database Access → Verify user exists
3. Test connection string locally first

---

## Quick Deployment Checklist

- [ ] MongoDB Atlas cluster created (M0 Free)
- [ ] Database user created with password
- [ ] Network access allows 0.0.0.0/0
- [ ] Connection string tested locally
- [ ] Code pushed to GitHub
- [ ] Render backend deployed
- [ ] Backend environment variables configured
- [ ] Backend health check passes
- [ ] Vercel frontend deployed
- [ ] Frontend environment variable set
- [ ] DNS A record added for @ → Vercel IP
- [ ] DNS CNAME added for www → Vercel
- [ ] DNS CNAME added for api → Render
- [ ] DNS propagated (check with nslookup)
- [ ] SSL certificates auto-provisioned
- [ ] CORS configured with production domain
- [ ] Test signup with college suggestions
- [ ] Test item posting
- [ ] Verify all features work

---

## Support Resources

**Vercel**:
- Docs: https://vercel.com/docs
- Support: help@vercel.com

**Render**:
- Docs: https://render.com/docs
- Support: support@render.com

**MongoDB Atlas**:
- Docs: https://docs.atlas.mongodb.com/
- Support: https://support.mongodb.com/

**Domain Issues**:
- Check with your registrar's support

---

## Next Steps After Deployment

1. **Add Analytics**
   - Google Analytics
   - Vercel Analytics (paid)

2. **Setup Monitoring**
   - UptimeRobot (free uptime monitoring)
   - Sentry (error tracking)

3. **Email Notifications**
   - SendGrid/Mailgun integration
   - Email when items are matched

4. **Image Upload**
   - Cloudinary integration
   - Replace base64 storage

5. **SEO Optimization**
   - Add meta tags
   - Sitemap.xml
   - robots.txt

---

## Congratulations! 🎉

Your Khoj Lost & Found application is now live on **https://khojapp.in**!

**What you've achieved**:
- ✅ Professional full-stack deployment
- ✅ Custom domain with SSL
- ✅ Scalable architecture
- ✅ Production-ready security
- ✅ Auto-deployments from Git
- ✅ Zero cost (on free tier)

**Share your app**:
- Add to your resume/portfolio
- Share with your college
- Post on social media

**Keep building!** 🚀
