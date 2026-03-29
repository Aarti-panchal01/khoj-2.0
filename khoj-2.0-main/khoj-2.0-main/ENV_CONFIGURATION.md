# Environment Variables Configuration Guide

Complete guide for configuring environment variables for deployment on **Khojapp.in**

## Table of Contents
- [Overview](#overview)
- [Local Development (.env files)](#local-development-env-files)
- [Production Deployment (.env changes)](#production-deployment-env-changes)
- [Quick Reference](#quick-reference)

---

## Overview

Your application uses environment variables in three places:

```
┌─────────────────────────────────────────────────────┐
│  1. Frontend (Vite)                                  │
│     Files: .env, .env.production                    │
│     Variables: VITE_API_URL                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  2. Backend (Express)                               │
│     Files: server/.env                              │
│     Variables: MONGODB_URI, JWT_SECRET, etc.       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  3. Hosting Platforms (Vercel, Render)             │
│     Location: Platform dashboard                    │
│     Variables: Same as above, set via UI           │
└─────────────────────────────────────────────────────┘
```

---

## Local Development (.env files)

### 1. Frontend Environment Variables

**File Location**: `/home/shanks/Videos/Kjoh/Khoj/.env`

**Create/Edit this file:**

```env
# API Configuration for Local Development
VITE_API_URL=http://localhost:4000/api
```

**Explanation:**
- `VITE_API_URL`: Points to your local backend server
- Must start with `VITE_` to be accessible in Vite/React
- Uses `http://localhost:4000` when backend runs locally

---

### 2. Backend Environment Variables

**File Location**: `/home/shanks/Videos/Kjoh/Khoj/server/.env`

**Create/Edit this file:**

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Database Connection
# Replace with YOUR actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/khoj?retryWrites=true&w=majority

# JWT Secret - Generate a strong random string
# Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Client Origin (Frontend URL)
# For local development, this is your local Vite server
CLIENT_ORIGIN=http://localhost:5173

# Rate Limiting (requests per 15 minutes)
RATE_LIMIT_MAX=100

# Session/Token Settings
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

**How to Get Your MongoDB URI:**

1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Login and select your project
3. Click "Database" → "Connect" on your cluster
4. Choose "Drivers" → Node.js
5. Copy connection string
6. Replace `<password>` with your actual password
7. Add `/khoj` before the `?` to specify database name

**Example MongoDB URI:**
```
Before: mongodb+srv://khoj_admin:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority

After:  mongodb+srv://khoj_admin:MyPass123@cluster0.abc123.mongodb.net/khoj?retryWrites=true&w=majority
                                    ^^^^^^^^                                  ^^^^
                                  Your password                          Database name
```

**How to Generate JWT Secret:**

```bash
# Run this command in your terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Output example:
# 8f7a9c2d4e6b1f3a5c7e9d0b2f4a6c8e1d3f5b7a9c2e4d6f8a1c3e5d7f9b2c4a6e
```

Copy the output and use it as your `JWT_SECRET`.

---

## Production Deployment (.env changes)

### Step-by-Step: What Changes for Production

When deploying to production on **Khojapp.in**, here's what changes:

#### Local → Production Changes Summary

| Variable | Local Development | Production Deployment |
|----------|-------------------|----------------------|
| **Frontend API URL** | `http://localhost:4000/api` | `https://api.khojapp.in/api` |
| **Backend CORS Origin** | `http://localhost:5173` | `https://khojapp.in,https://www.khojapp.in` |
| **Backend NODE_ENV** | `development` | `production` |
| **MongoDB URI** | Same (use production DB) | Same (use production DB) |
| **JWT Secret** | Random string | **DIFFERENT** random string (more secure) |

---

### 1. Frontend Production Environment

**File Location**: `/home/shanks/Videos/Kjoh/Khoj/.env.production`

**Create this file with:**

```env
# Production API Configuration
# This points to your deployed backend
VITE_API_URL=https://api.khojapp.in/api
```

**Changes Explained:**

| Setting | Local | Production |
|---------|-------|------------|
| Protocol | `http://` | `https://` (SSL encrypted) |
| Domain | `localhost:4000` | `api.khojapp.in` (your custom domain) |
| Path | `/api` | `/api` (same) |

**Important Notes:**
- Vite automatically uses `.env.production` when you run `npm run build`
- You'll also add this variable in **Vercel Dashboard** (we'll cover this below)
- Both must match for production to work!

---

### 2. Backend Production Environment

**For Production, you DON'T edit server/.env**

Instead, you configure environment variables in **Render Dashboard** (your hosting platform).

But for reference, here's what the production values should be:

```env
# THESE VALUES GO IN RENDER DASHBOARD, NOT server/.env

# Server Configuration
PORT=4000
NODE_ENV=production

# MongoDB Database Connection
# Same as local, but ensure it's your production cluster
MONGODB_URI=mongodb+srv://khoj_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/khoj?retryWrites=true&w=majority

# JWT Secret - GENERATE A NEW ONE FOR PRODUCTION
# Run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=DIFFERENT_STRONGER_SECRET_FOR_PRODUCTION_MIN_64_CHARS

# Client Origin - YOUR PRODUCTION DOMAINS
CLIENT_ORIGIN=https://khojapp.in,https://www.khojapp.in

# Rate Limiting
RATE_LIMIT_MAX=100

# Session/Token Settings
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

**Key Changes from Local:**

1. **NODE_ENV**: `development` → `production`
   - Affects logging, error messages, performance optimizations

2. **CLIENT_ORIGIN**: `http://localhost:5173` → `https://khojapp.in,https://www.khojapp.in`
   - CORS will only allow requests from your production domain
   - Multiple domains separated by comma (for www and non-www)

3. **JWT_SECRET**: Generate a NEW, different secret for production
   - Never use the same secret in development and production
   - Production secret should be longer and more random

4. **Protocol**: Everything uses `https://` in production

---

### 3. Setting Environment Variables in Vercel (Frontend)

**Step-by-Step:**

1. **Go to Vercel Dashboard**
   - Login at https://vercel.com/
   - Click on your `khoj` project

2. **Navigate to Settings**
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar

3. **Add Variable**
   - Click "Add" or "Add Environment Variable"

   **Variable Details:**
   ```
   Name:  VITE_API_URL
   Value: https://api.khojapp.in/api

   Environment:
   ✓ Production
   ✓ Preview
   ✓ Development
   ```

4. **Save**
   - Click "Save"

5. **Redeploy** (if already deployed)
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

**Screenshot Reference:**
```
┌─────────────────────────────────────────────┐
│ Vercel Dashboard > Settings > Environment  │
│                                             │
│  Name:  VITE_API_URL                       │
│  Value: https://api.khojapp.in/api         │
│                                             │
│  Environment:                               │
│  [x] Production                             │
│  [x] Preview                                │
│  [x] Development                            │
│                                             │
│          [Cancel]  [Save]                   │
└─────────────────────────────────────────────┘
```

---

### 4. Setting Environment Variables in Render (Backend)

**Step-by-Step:**

1. **Go to Render Dashboard**
   - Login at https://render.com/
   - Click on your `khoj-backend` service

2. **Navigate to Environment**
   - Click "Environment" in left sidebar
   - You'll see "Environment Variables" section

3. **Add Variables One by One**

   Click "Add Environment Variable" and add each of these:

   **Variable 1: NODE_ENV**
   ```
   Key:   NODE_ENV
   Value: production
   ```

   **Variable 2: PORT**
   ```
   Key:   PORT
   Value: 4000
   ```

   **Variable 3: MONGODB_URI**
   ```
   Key:   MONGODB_URI
   Value: mongodb+srv://khoj_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/khoj?retryWrites=true&w=majority
   ```
   ⚠️ **Replace with your actual connection string!**

   **Variable 4: JWT_SECRET**
   ```
   Key:   JWT_SECRET
   Value: [Generated using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"]
   ```
   **Generate a new secret for production:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   # Copy the output
   ```

   **Variable 5: CLIENT_ORIGIN**
   ```
   Key:   CLIENT_ORIGIN
   Value: https://khojapp.in,https://www.khojapp.in
   ```
   ⚠️ **Important**: Include both www and non-www versions!

   **Variable 6: RATE_LIMIT_MAX**
   ```
   Key:   RATE_LIMIT_MAX
   Value: 100
   ```

   **Variable 7: JWT_ACCESS_EXPIRY**
   ```
   Key:   JWT_ACCESS_EXPIRY
   Value: 15m
   ```

   **Variable 8: JWT_REFRESH_EXPIRY**
   ```
   Key:   JWT_REFRESH_EXPIRY
   Value: 7d
   ```

4. **Save All Variables**
   - Render will automatically redeploy your service
   - Wait 2-3 minutes for deployment to complete

**Screenshot Reference:**
```
┌─────────────────────────────────────────────────────┐
│ Render Dashboard > khoj-backend > Environment      │
│                                                     │
│  Environment Variables                              │
│  ┌────────────────────┬──────────────────────────┐ │
│  │ Key                │ Value                    │ │
│  ├────────────────────┼──────────────────────────┤ │
│  │ NODE_ENV           │ production               │ │
│  │ PORT               │ 4000                     │ │
│  │ MONGODB_URI        │ mongodb+srv://...        │ │
│  │ JWT_SECRET         │ 8f7a9c2d4e6b1f3a...     │ │
│  │ CLIENT_ORIGIN      │ https://khojapp.in,...   │ │
│  │ RATE_LIMIT_MAX     │ 100                      │ │
│  │ JWT_ACCESS_EXPIRY  │ 15m                      │ │
│  │ JWT_REFRESH_EXPIRY │ 7d                       │ │
│  └────────────────────┴──────────────────────────┘ │
│                                                     │
│  [+ Add Environment Variable]                      │
└─────────────────────────────────────────────────────┘
```

---

## Complete Configuration Checklist

### Before Deployment

**Local Files Setup:**

- [ ] `/.env` exists with `VITE_API_URL=http://localhost:4000/api`
- [ ] `/.env.production` exists with `VITE_API_URL=https://api.khojapp.in/api`
- [ ] `/server/.env` exists with MongoDB URI and JWT secret
- [ ] MongoDB connection tested locally (run `cd server && npm run dev`)
- [ ] Frontend tested locally (run `npm run dev`)
- [ ] Everything works locally ✅

**Push to GitHub:**

- [ ] All files committed (except `.env` files - they're in `.gitignore`)
- [ ] `.env.example` files committed (safe, no secrets)
- [ ] Code pushed to GitHub

### During Deployment

**Vercel Configuration:**

- [ ] `VITE_API_URL` = `https://api.khojapp.in/api` (set in dashboard)
- [ ] Environment applies to Production, Preview, Development
- [ ] Deployment successful

**Render Configuration:**

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `4000`
- [ ] `MONGODB_URI` = Your MongoDB Atlas connection string
- [ ] `JWT_SECRET` = Generated random string (64+ chars)
- [ ] `CLIENT_ORIGIN` = `https://khojapp.in,https://www.khojapp.in`
- [ ] `RATE_LIMIT_MAX` = `100`
- [ ] `JWT_ACCESS_EXPIRY` = `15m`
- [ ] `JWT_REFRESH_EXPIRY` = `7d`
- [ ] Deployment successful

**Domain Configuration:**

- [ ] DNS A record: `@` → Vercel IP (`76.76.21.21`)
- [ ] DNS CNAME: `www` → `cname.vercel-dns.com`
- [ ] DNS CNAME: `api` → `khoj-backend.onrender.com`
- [ ] DNS propagated (test with `nslookup`)
- [ ] SSL certificates auto-provisioned

### After Deployment

**Testing:**

- [ ] Visit `https://khojapp.in` - loads correctly
- [ ] Backend health: `curl https://api.khojapp.in/health` returns `{"status":"ok"}`
- [ ] Campuses API: `curl https://api.khojapp.in/api/campuses` returns college data
- [ ] Sign up works with college suggestions appearing
- [ ] Login works
- [ ] Post item works
- [ ] All features functional ✅

---

## Quick Reference

### Local Development URLs

```
Frontend: http://localhost:5173
Backend:  http://localhost:4000
API:      http://localhost:4000/api
```

### Production URLs

```
Frontend: https://khojapp.in or https://www.khojapp.in
Backend:  https://api.khojapp.in
API:      https://api.khojapp.in/api
```

### Environment Variable Files

```
Local Development:
  Frontend: /.env
  Backend:  /server/.env

Production (for reference only):
  Frontend: /.env.production
  Backend:  Set in Render dashboard (NOT in server/.env)
```

### Key Differences: Local vs Production

| Aspect | Local | Production |
|--------|-------|------------|
| **Frontend URL** | `http://localhost:5173` | `https://khojapp.in` |
| **Backend URL** | `http://localhost:4000` | `https://api.khojapp.in` |
| **API URL** | `http://localhost:4000/api` | `https://api.khojapp.in/api` |
| **Protocol** | HTTP (no SSL) | HTTPS (with SSL) |
| **CORS Origin** | `http://localhost:5173` | `https://khojapp.in,https://www.khojapp.in` |
| **NODE_ENV** | `development` | `production` |
| **JWT Secret** | Random string | **Different** random string |
| **Error Logging** | Verbose (with stack traces) | Minimal (no stack traces) |
| **Database** | Can use same as production | Production MongoDB Atlas cluster |

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting to Add Database Name

```env
# WRONG - Missing /khoj
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true

# CORRECT - Has /khoj before the ?
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/khoj?retryWrites=true
```

### ❌ Mistake 2: Using Same JWT Secret

```env
# WRONG - Same secret in local and production
Local:      JWT_SECRET=my-secret-123
Production: JWT_SECRET=my-secret-123

# CORRECT - Different secrets
Local:      JWT_SECRET=dev-secret-abc123xyz
Production: JWT_SECRET=8f7a9c2d4e6b1f3a5c7e9d0b2f4a6c8e...
```

### ❌ Mistake 3: Wrong CORS Origin

```env
# WRONG - Missing protocol or www
CLIENT_ORIGIN=khojapp.in

# WRONG - Only one variant
CLIENT_ORIGIN=https://khojapp.in

# CORRECT - Both www and non-www
CLIENT_ORIGIN=https://khojapp.in,https://www.khojapp.in
```

### ❌ Mistake 4: Hardcoding URLs in Code

```javascript
// WRONG - Hardcoded URL
const API_URL = 'http://localhost:4000/api';

// CORRECT - Use environment variable
const API_URL = import.meta.env.VITE_API_URL;
```

### ❌ Mistake 5: Committing .env to Git

```bash
# WRONG - This exposes secrets!
git add .env
git commit -m "Add env file"

# CORRECT - .env is in .gitignore, never commit it
# Only commit .env.example
git add .env.example
git commit -m "Add env example"
```

---

## Troubleshooting

### Issue: College suggestions not appearing

**Check these environment variables:**

```bash
# 1. Check frontend is using correct API URL
# In Vercel dashboard, verify:
VITE_API_URL=https://api.khojapp.in/api

# 2. Test API directly
curl https://api.khojapp.in/api/campuses
# Should return college data

# 3. Check browser console
# Open DevTools → Console → Look for API errors
# Network tab → Check if requests go to https://api.khojapp.in
```

### Issue: CORS errors in browser

**Fix CLIENT_ORIGIN in Render:**

```env
# Make sure it includes BOTH:
CLIENT_ORIGIN=https://khojapp.in,https://www.khojapp.in

# Not just:
CLIENT_ORIGIN=https://khojapp.in  # ❌ Missing www
```

### Issue: MongoDB connection fails

**Check MONGODB_URI:**

1. Verify username and password are correct
2. Check database name is included (`/khoj`)
3. Ensure Network Access allows `0.0.0.0/0` in MongoDB Atlas
4. Test locally first before deploying

### Issue: JWT errors (invalid token, etc.)

**Possible causes:**

1. JWT_SECRET changed between local and production (tokens won't match)
2. JWT_SECRET not set in production
3. Frontend and backend using different secrets

**Solution:**
- Clear browser localStorage
- Log out and log back in
- Verify JWT_SECRET is set in Render dashboard

---

## Security Best Practices

### 1. Never Commit Secrets

**Always in .gitignore:**
```
.env
.env.local
.env.production.local
server/.env
```

**Safe to commit:**
```
.env.example
.env.production (if it has no secrets, only domains)
server/.env.example
```

### 2. Use Different Secrets Per Environment

```env
# Development
JWT_SECRET=dev-only-secret-not-for-production

# Production
JWT_SECRET=super-long-random-production-secret-min-64-chars
```

### 3. Rotate Secrets Regularly

For production, change your JWT_SECRET every 3-6 months:

1. Generate new secret
2. Update in Render dashboard
3. All users will need to log in again (old tokens invalidated)

### 4. Use Strong MongoDB Passwords

```bash
# Generate secure password
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Summary

### Files You Need to Create/Edit:

**For Local Development:**
1. `/.env` - Frontend local config
2. `/server/.env` - Backend local config

**For Production:**
3. `/.env.production` - Frontend production config (reference)
4. Vercel Dashboard - Frontend env vars (actual config)
5. Render Dashboard - Backend env vars (actual config)

### Quick Setup Commands:

```bash
# 1. Create frontend .env files
cat > .env << 'EOF'
VITE_API_URL=http://localhost:4000/api
EOF

cat > .env.production << 'EOF'
VITE_API_URL=https://api.khojapp.in/api
EOF

# 2. Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 3. Create backend .env (edit with your values)
cat > server/.env << 'EOF'
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/khoj?retryWrites=true&w=majority
JWT_SECRET=PASTE_GENERATED_SECRET_HERE
CLIENT_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX=100
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
EOF

# 4. Edit server/.env with your actual values
nano server/.env
```

---

**You're all set!** Follow the main DEPLOYMENT.md guide and use these environment configurations. 🚀
