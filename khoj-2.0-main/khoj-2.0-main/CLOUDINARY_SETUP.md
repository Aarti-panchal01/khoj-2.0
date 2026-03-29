# Cloudinary Image Upload Setup Guide

This guide explains how to set up Cloudinary for image uploads in your Khoj Lost & Found application.

## Table of Contents
- [Why Cloudinary?](#why-cloudinary)
- [Create Cloudinary Account](#create-cloudinary-account)
- [Get API Credentials](#get-api-credentials)
- [Configure Your Application](#configure-your-application)
- [Testing the Integration](#testing-the-integration)
- [Pricing & Limits](#pricing--limits)
- [Troubleshooting](#troubleshooting)

---

## Why Cloudinary?

Cloudinary is perfect for the Khoj Lost & Found app because:

- **Free Tier**: 25GB storage + 25GB bandwidth/month (handles 100,000+ images/year with optimization)
- **Automatic Optimization**: Reduces image sizes by 50-70% automatically
- **Fast CDN**: Images load quickly from servers worldwide
- **Easy Integration**: Works seamlessly with Node.js and React
- **Production Ready**: Used by major companies like Uber, Forbes, etc.

---

## Create Cloudinary Account

### Step 1: Sign Up

1. **Go to Cloudinary**: https://cloudinary.com/
2. **Click "Sign Up for Free"** in the top right
3. **Choose sign-up method**:
   - Recommended: "Continue with Google" or "Continue with GitHub" (faster)
   - Or use your email

4. **Fill in the form**:
   - Choose a plan: **Free** (this is pre-selected)
   - Cloud name: Choose a unique name (e.g., `khoj-app` or `your-name-khoj`)
     - This will be used in your environment variables
     - Cannot be changed later, so choose carefully!
   - Click "Create Account"

5. **Verify your email** (if using email signup)

### Step 2: Complete Setup

1. After login, you'll see the **Dashboard**
2. Skip any tutorials or onboarding prompts for now
3. You should now see your dashboard with usage statistics

---

## Get API Credentials

### Method 1: From Dashboard (Easiest)

1. **Login to Cloudinary**: https://console.cloudinary.com/
2. **Go to Dashboard** (should be the default page)
3. **Look for "Account Details" section** (usually at the top)
4. You'll see three important values:
   ```
   Cloud name: your-cloud-name
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz123456 (click "Reveal")
   ```

5. **Click the "eye" icon** next to API Secret to reveal it

### Method 2: From Settings Page

1. **Click the gear icon** (Settings) in the top right
2. **Go to "Access Keys"** in the left sidebar
3. You'll see your credentials:
   - Cloud Name
   - API Key
   - API Secret (click to reveal)

### Important Notes

⚠️ **Keep these credentials secret!**
- Never commit them to Git
- Never share them publicly
- Don't include them in screenshots

✅ **Copy them safely**:
- Use a password manager
- Or keep them in a secure note
- You'll need them in the next step

---

## Configure Your Application

### Local Development Setup

#### Step 1: Update Backend Environment Variables

   Open your `server/.env` file and add Cloudinary credentials:
   ```env
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
   ```

3. **Replace the values** with your actual credentials from the previous step

4. **Save the file**:
   - In nano: `Ctrl + O`, then `Enter`, then `Ctrl + X`
   - In vim: `:wq`

#### Step 2: Verify Configuration

Your complete `server/.env` should now look like this:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Database
MONGODB_URI=mongodb+srv://...your connection string...

# JWT Secret
JWT_SECRET=your-jwt-secret

# Client Origin
CLIENT_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_MAX=100

# Session/Token Settings
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

#### Step 3: Restart Your Backend Server

```bash
# If server is running, stop it (Ctrl + C)
# Then restart:
cd server
npm run dev
```

You should see no errors. If Cloudinary credentials are incorrect, you'll see errors when trying to upload images.

---

### Production Deployment Setup

When deploying to Render (or any other hosting platform), you need to add the Cloudinary environment variables.

#### For Render:

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click on your `khoj-backend` service**
3. **Go to "Environment" tab** in the left sidebar
4. **Click "Add Environment Variable"**
5. **Add these three variables one by one**:

   **Variable 1:**
   ```
   Key:   CLOUDINARY_CLOUD_NAME
   Value: your-cloud-name
   ```

   **Variable 2:**
   ```
   Key:   CLOUDINARY_API_KEY
   Value: 123456789012345
   ```

   **Variable 3:**
   ```
   Key:   CLOUDINARY_API_SECRET
   Value: abcdefghijklmnopqrstuvwxyz123456
   ```

6. **Click "Save Changes"**
7. Render will automatically redeploy your service (takes 1-2 minutes)

#### For Other Platforms:

- **Vercel/Netlify**: Same process, add environment variables in Settings
- **Heroku**: Use `heroku config:set CLOUDINARY_CLOUD_NAME=...`
- **AWS/DigitalOcean**: Add to your `.env` file on the server

---

## Testing the Integration

### Test 1: Local Development

1. **Start both servers**:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd ..
   npm run dev
   ```

2. **Open your app**: http://localhost:5173

3. **Login/Signup** to your account

4. **Go to "Post Item"**

5. **Try uploading an image**:
   - Click the upload area
   - Select an image (JPG or PNG, under 10MB)
   - You should see a loading spinner
   - After a few seconds, the image should appear below the upload area

6. **Check Cloudinary Dashboard**:
   - Go to https://console.cloudinary.com/
   - Click "Media Library" in the top menu
   - You should see your uploaded image in the `khoj-items` folder

### Test 2: Check Image URL

1. After successful upload, **inspect the image**:
   - Right-click on the uploaded image thumbnail
   - Click "Inspect" or "Inspect Element"
   - Look at the `src` attribute

2. The URL should look like:
   ```
   https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/khoj-items/abc123.jpg
   ```

3. If the URL starts with `https://res.cloudinary.com/`, it's working! ✅

### Test 3: Submit a Post with Images

1. Fill out the entire form (title, description, etc.)
2. Upload 1-3 images
3. Click "Post Item"
4. The item should be created successfully
5. Go to "Home" and you should see your item with images

---

## Pricing & Limits

### Free Tier (Perfect for Starting)

| Feature | Limit |
|---------|-------|
| **Storage** | 25 GB |
| **Bandwidth** | 25 GB/month |
| **Transformations** | 25,000/month |
| **Videos** | 0.5 GB |
| **Images** | ~100,000+ per year (with optimization) |

### Capacity Calculation

**With Cloudinary's automatic optimization:**
- Original image: ~3MB (iPhone photo)
- After Cloudinary optimization: ~300KB (90% smaller!)
- 25GB storage = ~83,000 optimized images
- 25GB monthly bandwidth = ~83,000 image views/month

**For 100,000 images/year:**
- Storage used: ~30GB (optimized)
- Bandwidth depends on views (free tier covers ~1,000,000 views/month)
- Recommendation: Start with free tier, upgrade when you reach limits

### Paid Plans (If You Outgrow Free Tier)

| Plan | Price | Storage | Bandwidth |
|------|-------|---------|-----------|
| **Plus** | $89/month | 55 GB | 55 GB/month |
| **Advanced** | $224/month | 150 GB | 150 GB/month |

### Monitoring Usage

1. **Check usage anytime**:
   - Go to Cloudinary Dashboard
   - Look at "Current Month Usage" section
   - Monitor storage and bandwidth

2. **Set up alerts**:
   - Go to Settings > Notifications
   - Enable "Usage Alerts"
   - Get notified at 80% usage

---

## Troubleshooting

### Issue 1: "Upload failed" error

**Possible causes:**
1. Wrong API credentials
2. Network/firewall blocking Cloudinary
3. File too large (>10MB)
4. Invalid file type

**Solutions:**
1. **Verify credentials**:
   ```bash
   # Check your .env file
   cat server/.env | grep CLOUDINARY
   ```
   Make sure cloud name, API key, and API secret are correct

2. **Check backend logs**:
   ```bash
   # Look for error messages
   cd server
   npm run dev
   # Try uploading, check terminal output
   ```

3. **Test Cloudinary directly**:
   ```bash
   # In server directory, create a test file
   node -e "
   const cloudinary = require('cloudinary').v2;
   cloudinary.config({
     cloud_name: 'your-cloud-name',
     api_key: 'your-api-key',
     api_secret: 'your-api-secret'
   });
   cloudinary.api.ping().then(console.log).catch(console.error);
   "
   ```
   Should print: `{ status: 'ok' }`

### Issue 2: Images not appearing after upload

**Check:**
1. Browser console for errors (F12 > Console tab)
2. Network tab (F12 > Network) - look for failed requests
3. Image URL - should start with `https://res.cloudinary.com/`

**Fix:**
1. Clear browser cache
2. Refresh the page
3. Try uploading again

### Issue 3: "Invalid API Key" error

**This means:**
- API Key or API Secret is wrong
- Cloud name doesn't match

**Fix:**
1. Go back to Cloudinary Dashboard
2. Double-check all three credentials
3. Copy them again (don't type manually)
4. Update `.env` file
5. Restart backend server

### Issue 4: Images upload but don't save with item

**Check:**
1. Make sure you're logged in (upload endpoint requires authentication)
2. Check if images appear in Cloudinary Media Library
3. Verify the item creation request includes the image URLs

**Fix:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Submit the form
4. Look for POST request to `/api/items`
5. Check if `images` array is included in the request body

### Issue 5: CORS errors

**Error message:**
```
Access to fetch at 'https://api.cloudinary.com/...' has been blocked by CORS policy
```

**This shouldn't happen** because we upload through our backend, not directly from frontend.

**If it does happen:**
1. Make sure you're using the `UploadAPI.uploadImages()` function
2. Don't try to upload directly to Cloudinary from the frontend
3. All uploads should go through `/api/upload/images` endpoint

---

## Advanced Configuration

### Customize Image Transformations

You can modify image processing in `server/src/config/cloudinary.js`:

```javascript
transformation: [
  {
    width: 1200,        // Max width
    height: 1200,       // Max height
    crop: 'limit',      // Don't upscale small images
    quality: 'auto:good', // Automatic quality (can be 'auto:best' or 'auto:low')
    fetch_format: 'auto', // Auto-select format (WebP when supported)
  },
],
```

### Create Different Folders for Different Item Types

Modify `server/src/config/cloudinary.js`:

```javascript
folder: `khoj-items/${itemType}`, // e.g., khoj-items/lost or khoj-items/found
```

### Add Watermarks (Premium Feature)

If you upgrade to a paid plan, you can add watermarks:

```javascript
transformation: [
  { overlay: 'watermark' },
  { gravity: 'south_east', x: 10, y: 10 }
],
```

---

## Security Best Practices

### 1. Never Expose API Secret

❌ **Don't do this:**
```javascript
// WRONG - In frontend code
const cloudinary_secret = "abc123..."; // NEVER!
```

✅ **Do this instead:**
- Keep API Secret in backend `.env` only
- Never send it to the frontend
- Use our backend upload endpoint

### 2. Use Signed Uploads in Production (Optional)

For extra security, you can require signed uploads. This prevents unauthorized users from uploading.

Our current implementation already handles this - uploads require authentication (JWT token).

### 3. Rotate API Keys Regularly

For production, rotate your Cloudinary API keys every 6-12 months:

1. Go to Cloudinary Settings > Access Keys
2. Click "Generate New Primary Key Pair"
3. Update your environment variables
4. Delete old key pair after deployment

---

## Next Steps

After successful Cloudinary integration:

1. ✅ Test image uploads thoroughly
2. ✅ Monitor Cloudinary usage dashboard
3. ✅ Deploy to production (don't forget to add env vars on Render!)
4. ✅ Set up usage alerts in Cloudinary
5. Consider upgrading if you exceed free tier limits

---

## Support Resources

**Cloudinary:**
- Documentation: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com/
- Community: https://community.cloudinary.com/

**Your Application:**
- For issues specific to Khoj app, check the main README.md
- Backend code: `server/src/config/cloudinary.js`
- Frontend code: `src/pages/dashboard/PostItem.jsx`

---

## Summary Checklist

Before marking this as complete, ensure:

- [ ] Cloudinary account created (free tier)
- [ ] API credentials copied (cloud_name, api_key, api_secret)
- [ ] `server/.env` updated with Cloudinary credentials
- [ ] Backend server restarted
- [ ] Test upload successful locally
- [ ] Image appears in Cloudinary Media Library
- [ ] Image displays correctly in the app
- [ ] (For production) Environment variables added to Render
- [ ] (For production) Test upload on production URL

---

**Congratulations!** 🎉 Your Khoj Lost & Found app now has professional image upload capabilities with Cloudinary!
