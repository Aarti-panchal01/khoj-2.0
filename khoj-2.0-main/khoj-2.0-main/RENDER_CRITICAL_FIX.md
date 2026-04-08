# ⚠️ CRITICAL: Backend Environment Variables NOT Set

## Problem
The Render backend is missing the `GOOGLE_CLIENT_ID` environment variable.

## Error Log Analysis
```
POST /google HTTP/1.1" 503 62
→ Response: "Google sign-in is not configured on this server"

GET /api/auth/google HTTP/1.1" 404 45  
→ Response: "Route not found"
```

## Solution - Set Environment Variables on Render NOW

### Quick Manual Fix (2 minutes):

1. **Open Render Dashboard** → https://dashboard.render.com
2. **Find your backend service** (e.g., `khoj-1.0`)
3. **Click Settings** → **Environment**
4. **Add/Update ONLY these critical variables:**

```
PORT=4000
GOOGLE_CLIENT_ID=16568915138-2jm1k3462gipcmqi2u144lco5abqr0ng.apps.googleusercontent.com
```

5. **Click Save**
6. **Manual Deploy** → **Deploy latest commit**
7. **Wait 10 minutes**

### All Required Variables (Complete List):

Copy the ENTIRE configuration below:

```env
# Core
PORT=4000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://khojappteam:sang04102006@ac-yvmdj6j-shard-00-00.t5mxrfr.mongodb.net:27017,ac-yvmdj6j-shard-00-01.t5mxrfr.mongodb.net:27017,ac-yvmdj6j-shard-00-02.t5mxrfr.mongodb.net:27017/?ssl=true&replicaSet=atlas-6h99yn-shard-0&authSource=admin&appName=Cluster0

# JWT Secrets
JWT_SECRET=cdb96f91528db0ad137fdaf517468b2c0f6ca25303e7e8d020108dafa780fde9bbe8fca4d460e2597dad57eafe4272b84192c32943002fba7b061ae460eba42b
JWT_REFRESH_SECRET=68428df87222c4e5fd598032f6a2cf88a67fe7aa93b9d9c847277745cb30289f520705f6bbb840a91f47e215ee7d0a6322b6043b3503b6312b45f895506576c2

# CORS - Frontend Origins
CLIENT_ORIGIN=https://khoj-2-0.vercel.app,https://www.khojapp.in,https://khojapp.in

# CRITICAL: Google OAuth
GOOGLE_CLIENT_ID=16568915138-2jm1k3462gipcmqi2u144lco5abqr0ng.apps.googleusercontent.com

# Storage
CLOUDINARY_CLOUD_NAME=dcleknvcv
CLOUDINARY_API_KEY=478554286536637
CLOUDINARY_API_SECRET=snBhNclOV8A20BmjuorTFFI14Eg

# Firebase
FIREBASE_PROJECT_ID=khoj-1762c

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## Verification After Setting

After you update variables and redeploy, check:

1. **Render Logs** should show:
   ```
   ✅ Server running on port 4000
   ```

2. **Backend API** should respond at:
   ```
   https://api.khojapp.in/health
   → { "status": "ok", "env": "production" }
   ```

3. **Google Auth endpoint** should be accessible:
   ```
   POST https://api.khojapp.in/api/auth/google
   → Should accept Google token (not 503)
   ```

---

## Render Dashboard Steps (Screenshot Guide)

### Step 1: Open Service Settings
- Go to https://dashboard.render.com
- Find your service
- Click **Settings** tab

### Step 2: Open Environment Variables
- Click **Environment** in left sidebar
- Click **Add Environment Variable** (if new)
- Or edit existing ones

### Step 3: Paste Variables
- Copy the complete env list above
- Paste into Render UI
- Make sure `PORT=4000` and `GOOGLE_CLIENT_ID` are present

### Step 4: Deploy
- Click **Save** (top right)
- Go to **Deployments** section
- Click **Manual Deploy**
- Select **Deploy latest commit**

### Step 5: Monitor
- Check **Logs** tab
- Wait for green "Live" status
- Look for `✅ Server running on port 4000`

---

## Testing After Deployment

```bash
# Test 1: Check health endpoint
curl https://api.khojapp.in/health

# Expected Response:
# {"status":"ok","env":"production"}

# Test 2: Try Google auth (will fail without token, but shows route exists)
curl -X POST https://api.khojapp.in/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"credential":"test"}'

# Expected Response (error about invalid token, NOT 503 or 404):
# {"message":"Google did not return..."}
```

---

**DO THIS NOW:** Set `GOOGLE_CLIENT_ID` on Render and redeploy! 🚀

