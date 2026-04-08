# ✅ FINAL FIX: Google Auth 503 Error & Onboarding Redirect

## Problem Analysis

From your logs:
- ✅ Server running on port 4000
- ✅ User IS being created in MongoDB (with universityId = null)
- ❌ **Google auth returning 503**: "Google sign-in is not configured on this server"
- ❌ **Not redirecting to onboarding**

## Root Cause

The `GOOGLE_CLIENT_ID` environment variable is **NOT ACTUALLY SET** on Render, even though the server started.

When the backend code runs:
```javascript
if (!process.env.GOOGLE_CLIENT_ID) {
  return res.status(503).json({ message: 'Google sign-in is not configured' });
}
```

---

## SOLUTION: 3-Step Fix

### Step 1: Verify Current Environment Variables

**Go to:** https://dashboard.render.com

1. Click your service (`khoj-1.0`)
2. Click **Settings** 
3. Click **Environment** in left sidebar
4. **Screenshot and send me** the list of all environment variables

OR tell me: **Is `GOOGLE_CLIENT_ID` in the list?**

---

### Step 2: Add/Update GOOGLE_CLIENT_ID (If Missing)

**If you don't see `GOOGLE_CLIENT_ID` in the list:**

1. Click **"Add Environment Variable"**
2. Set:
   - **Key:** `GOOGLE_CLIENT_ID`
   - **Value:** `16568915138-2jm1k3462gipcmqi2u144lco5abqr0ng.apps.googleusercontent.com`
3. Click **Save**

**If `GOOGLE_CLIENT_ID` EXISTS but is empty:**

1. Click on it to edit
2. Paste: `16568915138-2jm1k3462gipcmqi2u144lco5abqr0ng.apps.googleusercontent.com`
3. Click **Save**

---

### Step 3: Redeploy

1. Go to **Deployments** (top of page)
2. Click **Manual Deploy**
3. Click **Deploy latest commit**
4. ⏳ **Wait 10 minutes**

Check **Logs** for:
```
✅ Server running on port 4000
```

---

## Testing After Fix

### Test Google Signup:
```
1. Go to https://www.khojapp.in/signup
2. Click "Sign up with Google"
3. Select your account
4. ✅ Should show: "Backend authentication successful"
5. ✅ Should redirect to /onboarding (NOT homepage)
6. Fill onboarding form
7. ✅ Should redirect to / (homepage)
```

---

## Why Redirect to Onboarding Is Already Working

Your code already handles this. In `src/pages/auth/Login.jsx`:

```javascript
const afterAuth = async () => {
  try {
    const profile = await AuthAPI.me();
    if (!profile?.universityId) {
      navigate('/onboarding', { replace: true });  // ← New users go here
    } else {
      navigate('/', { replace: true });  // ← Existing users go here
    }
  } catch {
    navigate('/', { replace: true });
  }
};
```

**When you sign up with Google:**
1. Backend creates user with `universityId: null`
2. Frontend calls `AuthAPI.me()` → gets user without universityId
3. Checks: `if (!profile?.universityId)` → TRUE
4. Redirects to `/onboarding` ✅

---

## Current Database Status

Your database shows:
```javascript
{
  _id: ObjectId('69d29cc4f59e59137d44cd47'),
  name: "somwystorageandphotos",
  email: "somwystorageandphotos@gmail.com",
  universityId: ObjectId('69c5bb523378a292a06d988d'),  // ← Has university!
  campusId: ObjectId('69c5bb523378a292a06d988e'),     // ← Has campus!
  isEmailVerified: true,
  // ... other fields
}
```

**This user has already completed onboarding!** 

Next login should go directly to homepage (not onboarding).

---

## Quick Checklist

- [ ] Go to Render Dashboard
- [ ] Open your service Settings → Environment
- [ ] Find `GOOGLE_CLIENT_ID` ← **Is it there?**
- [ ] If missing: Add it with value `16568915138-2jm1k3462gipcmqi2u144lco5abqr0ng.apps.googleusercontent.com`
- [ ] If empty: Paste the value above
- [ ] Click Save
- [ ] Click Deployments → Manual Deploy → Deploy latest commit
- [ ] Wait 10 minutes
- [ ] Test https://www.khojapp.in/signup again

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still getting 503 | GOOGLE_CLIENT_ID not saved. Check it's there in Render Settings |
| Can't see environment variables | Refresh the page, or try different browser |
| Deployment spinning | Wait 15 minutes, check Logs for errors |
| User stuck on signup page | Check browser Console for error message |

---

**CRITICAL TASK:** Add `GOOGLE_CLIENT_ID` to Render environment variables and redeploy! 

Once you do this, everything will work ✅

