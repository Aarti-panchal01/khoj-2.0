# Production Deployment Steps

## ✅ Step 1: Code Pushed to GitHub
Your Firebase Admin SDK changes are now on GitHub!

---

## 🔥 Step 2: Get Firebase Service Account Credentials

1. Go to: https://console.firebase.google.com/
2. Select project: **khoj-1762c**
3. Click ⚙️ → **Project settings** → **Service accounts** tab
4. Click **"Generate new private key"** button
5. Click **"Generate key"** to download JSON file
6. **Save this file securely** (don't share it!)

---

## 🚀 Step 3: Add Environment Variables to Production

### If using Render.com:

1. Go to: https://dashboard.render.com/
2. Select your **backend service** (khoj-backend or similar)
3. Click **"Environment"** in the left sidebar
4. Click **"Add Environment Variable"**
5. Add these 3 variables:

```
Key: FIREBASE_PROJECT_ID
Value: khoj-1762c

Key: FIREBASE_CLIENT_EMAIL  
Value: firebase-adminsdk-xxxxx@khoj-1762c.iam.gserviceaccount.com
(copy from the JSON file you downloaded)

Key: FIREBASE_PRIVATE_KEY
Value: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
(copy the ENTIRE private_key value from JSON, including quotes and \n)
```

6. Click **"Save Changes"**
7. Render will automatically redeploy your service

### If using Railway/Heroku/Other:

Same process - add the 3 environment variables in your platform's dashboard.

---

## 📋 Important Notes

### For FIREBASE_PRIVATE_KEY:
- ✅ Keep the `\n` characters (they are important!)
- ✅ Keep the double quotes around the key
- ✅ Copy the entire value from the JSON file
- ❌ Don't replace `\n` with actual newlines

### Example from JSON:
```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
}
```

Copy exactly as shown above ↑

---

## ✅ Step 4: Verify Deployment

After Render redeploys (takes 2-3 minutes):

1. Check your backend logs in Render dashboard
2. Look for: `✅ Firebase Admin initialized successfully`
3. If you see this, Firebase is configured correctly!

### Test Google Sign-In:

1. Go to your production website: https://khojapp.in
2. Click "Continue with Google"
3. Sign in with your Google account
4. Check backend logs for:
   ```
   ✅ Firebase token verified successfully
   ✅ User logged in successfully: your-email@example.com
   ```

---

## 🐛 Troubleshooting

### Backend logs show: "Missing Firebase Admin environment variables"
→ Check that all 3 variables are added in Render dashboard
→ Make sure there are no typos in variable names

### Backend logs show: "Firebase Admin initialization failed"
→ Check `FIREBASE_PRIVATE_KEY` format
→ Make sure it has quotes and `\n` characters
→ Try copying the value again from the JSON file

### Google sign-in still returns 401
→ Wait for Render to finish redeploying
→ Check that `FIREBASE_PROJECT_ID` is exactly: `khoj-1762c`
→ Verify the service account JSON is from the correct Firebase project

---

## 📊 Deployment Checklist

- [x] Code pushed to GitHub
- [ ] Firebase service account JSON downloaded
- [ ] FIREBASE_PROJECT_ID added to Render
- [ ] FIREBASE_CLIENT_EMAIL added to Render
- [ ] FIREBASE_PRIVATE_KEY added to Render
- [ ] Render redeployment completed
- [ ] Backend logs show "Firebase Admin initialized successfully"
- [ ] Google sign-in tested and working
- [ ] User can log in successfully

---

## 🎉 Success!

Once you see these in your production logs:
```
✅ Firebase Admin initialized successfully
✅ Firebase token verified successfully
✅ User logged in successfully
```

Your Firebase authentication is working in production! 🚀

---

## 📞 Need Help?

If you encounter issues:
1. Check Render logs for error messages
2. Verify all 3 environment variables are set correctly
3. Make sure the private key format is correct
4. Try redeploying manually from Render dashboard
