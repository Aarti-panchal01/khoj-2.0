# 🔧 Get Correct Google OAuth Client ID from Firebase

> The current ID might be wrong. Let's get the CORRECT one!

---

## Step 1: Go to Firebase Console

**Open:** https://console.firebase.google.com

1. Click your project: **khoj-1762c**
2. Click **⚙️ Settings** (gear icon, top left)
3. Click **"Project Settings"**

---

## Step 2: Go to Service Accounts Tab

In Project Settings:
1. Click **"Service Accounts"** tab
2. Scroll down
3. Click **"Generate New Private Key"** (or skip this, we need Web Client ID)

---

## Step 3: Get Web Client ID from Google Cloud

1. From Project Settings, click **"Google Cloud Console"** link (opens in new tab)
2. Or go directly: https://console.cloud.google.com/

### In Google Cloud Console:

1. Click **☰ Menu** (hamburger, top left)
2. Go to **"APIs & Services"**
3. Click **"Credentials"**
4. Look for **"Web application"** or **"OAuth 2.0 Client IDs"**
5. If you see one, click it to view details
6. Copy the **"Client ID"** (looks like: `xxxxx-yyyyy.apps.googleusercontent.com`)

---

## Step 4: If No Web Client ID Exists, Create One

### Create OAuth 2.0 Credential:

1. In Google Cloud Console → **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. If asked: Select **"Web application"**
4. Set authorized redirect URIs:
   ```
   https://www.khojapp.in/
   https://khojapp.in/
   https://khoj-2-0.vercel.app/
   http://localhost:5173
   ```
5. Click **Create**
6. Copy the **Client ID** from the popup

---

## Step 5: Verify You Have Correct Format

The correct Google OAuth Client ID should look like:

```
16568915138-2jm1k3462gipcmqi2u144lco5abqr0ng.apps.googleusercontent.com
```

**Pattern:** `[numbers]-[alphanumeric].apps.googleusercontent.com`

If yours looks different, you have the WRONG ID!

---

## Step 6: Update Render with NEW Client ID

### Go to Render Dashboard:
1. https://dashboard.render.com
2. Click your service `khoj-1.0`
3. **Settings** → **Environment**
4. Find `GOOGLE_CLIENT_ID`
5. **DELETE the old value**
6. **PASTE your new Google OAuth Client ID**
7. Click **Save**

### Redeploy:
1. Go to **Deployments** tab
2. Click **Manual Deploy**
3. Click **Deploy latest commit**
4. Wait 10 minutes

---

## Step 7: Update Vercel with NEW Client ID

### Go to Vercel Dashboard:
1. https://vercel.com/dashboard
2. Click your project
3. **Settings** → **Environment Variables**
4. Find or create `VITE_GOOGLE_CLIENT_ID`
5. Update value to your new Google OAuth Client ID
6. Click **Save**
7. **Redeploy** latest deployment

---

## Step 8: Test Again

1. Go to https://www.khojapp.in/signup
2. Click **"🔍 Sign up with Google"**
3. ✅ Should work now!

---

## Quick Reference

| Name | What It Is | Where to Find |
|------|-----------|----------------|
| **Firebase Project ID** | `khoj-1762c` | Firebase Console |
| **Google OAuth Client ID** | `xxxxx-yyyy.apps.googleusercontent.com` | Google Cloud Console → APIs & Services → Credentials |
| **Firebase Web API Key** | `AIzaSyC24KdyqaqSQAxQ1tegCOWCkvrlRTNSpFs` | Firebase Console → Project Settings → Web API Key |

---

## Common Mistakes

❌ Using Firebase API Key instead of Google OAuth Client ID
❌ Using Service Account ID instead of Web Client ID  
❌ Using old/expired Client ID
❌ Typo in Client ID

✅ Make sure it ends with `.apps.googleusercontent.com`

---

## If You're Still Stuck

1. **Screenshot your Google Cloud Console** Credentials page
2. **Send me the exact Client ID** you see
3. I'll verify it's correct format
4. We'll update Render & Vercel

**Let's get this working!** 🚀

