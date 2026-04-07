# Quick Firebase Admin Setup

## Step 1: Download Service Account Key

1. Go to https://console.firebase.google.com/
2. Select your project: `khoj-1762c`
3. Click ⚙️ > Project settings > Service accounts
4. Click "Generate new private key" button
5. Save the downloaded JSON file (DO NOT commit to git!)

## Step 2: Add to server/.env

Open the downloaded JSON file and copy these values to `server/.env`:

```env
# From the JSON file:
FIREBASE_PROJECT_ID=<copy "project_id" value>
FIREBASE_CLIENT_EMAIL=<copy "client_email" value>
FIREBASE_PRIVATE_KEY="<copy entire "private_key" value including quotes and \n>"
```

### Example:

If your JSON has:
```json
{
  "project_id": "khoj-1762c",
  "private_key": "-----BEGIN PRIVATE KEY-----\nABC123...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc@khoj-1762c.iam.gserviceaccount.com"
}
```

Your `.env` should have:
```env
FIREBASE_PROJECT_ID=khoj-1762c
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc@khoj-1762c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC123...\n-----END PRIVATE KEY-----\n"
```

## Step 3: Test

```bash
cd server
npm run dev
```

Look for: `✅ Firebase Admin initialized successfully`

## Step 4: Test Google Sign-In

1. Start frontend: `npm run dev` (in root directory)
2. Click "Continue with Google"
3. Check backend logs for: `✅ Firebase token verified successfully`

## Common Issues

❌ **"Missing Firebase Admin environment variables"**
→ Check that all 3 variables are in `server/.env`

❌ **"Invalid Firebase token"**
→ Make sure `FIREBASE_PROJECT_ID` matches your Firebase project

❌ **"Firebase Admin initialization failed"**
→ Check that `FIREBASE_PRIVATE_KEY` has quotes and `\n` characters

## Production Deployment

For Render/Vercel, add the same 3 environment variables in the dashboard.

**Important:** Keep the `\n` characters in `FIREBASE_PRIVATE_KEY` - they are needed!
