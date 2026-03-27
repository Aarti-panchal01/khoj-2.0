# Setup Guide - Khoj Lost & Found

Quick guide to get the application running locally.

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- MongoDB Atlas account (free tier) OR local MongoDB

---

## Step 1: Clone and Install

```bash
# If not already in the project directory
cd /path/to/khoj

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

---

## Step 2: Setup MongoDB

### Option A: MongoDB Atlas (Recommended - Free)

1. Go to https://cloud.mongodb.com/ and create a free account
2. Create a new project
3. Build a cluster (choose M0 Free tier)
4. Under "Database Access":
   - Click "Add New Database User"
   - Create username and password
   - Grant "Read and write to any database" permission
5. Under "Network Access":
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your specific IP for better security
6. Go to "Database" → "Connect" → "Connect your application"
7. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
   ```

### Option B: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Your connection string will be: `mongodb://localhost:27017/khoj`

---

## Step 3: Configure Backend Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your MongoDB credentials:

```env
PORT=4000
NODE_ENV=development

# Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/khoj?retryWrites=true&w=majority

# Generate a random secret (or use the command below)
JWT_SECRET=dev-secret-change-this-in-production

CLIENT_ORIGIN=http://localhost:5173

RATE_LIMIT_MAX=100
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 4: Configure Frontend Environment

```bash
# From project root
cp .env.example .env
```

Your `.env` should contain:
```env
VITE_API_URL=http://localhost:4000/api
```

---

## Step 5: Start the Application

### Terminal 1 - Start Backend

```bash
cd server
npm run dev
```

You should see:
```
API server running on port 4000
MongoDB connected successfully
Colleges seeded successfully
```

### Terminal 2 - Start Frontend

```bash
# From project root (not in server/ directory)
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 6: Test the Application

1. Open http://localhost:5173 in your browser

2. **Test College/Campus Suggestions**:
   - Click "Sign Up"
   - In the "College/University" field, start typing: "PES"
   - You should see "PES University" appear as a suggestion
   - Select it
   - The "Campus" field should now show campus options:
     - Ring Road Campus
     - Electronic City Campus
     - Hanumanth Nagar Campus

3. **Complete Signup**:
   - Fill in all fields
   - Click "Create Account"
   - You should be redirected to the home page

4. **Post an Item**:
   - Click "Post Item"
   - Fill in the form
   - Submit

5. **Test Search**:
   - Use the search bar
   - Try filters

---

## Troubleshooting

### College Suggestions Not Appearing

**Check Backend is Running**:
```bash
curl http://localhost:4000/health
# Should return: {"status":"ok"}
```

**Check Campuses Endpoint**:
```bash
curl http://localhost:4000/api/campuses
# Should return: [{"name":"PES University","campuses":[...]}]
```

**Check Browser Console**:
- Open DevTools (F12)
- Go to Console tab
- Look for errors

**Check Network Tab**:
- Open DevTools (F12)
- Go to Network tab
- Reload the signup page
- Look for request to `/api/campuses`
- Status should be 200
- Response should contain college data

### Backend Won't Start

**MongoDB Connection Error**:
- Verify your `MONGODB_URI` in `server/.env`
- Check username and password are correct
- Ensure MongoDB Atlas allows your IP address
- Try pinging: `ping cluster0.xxxxx.mongodb.net`

**Port Already in Use**:
```bash
# Find what's using port 4000
lsof -i :4000
# Kill the process if needed
kill -9 <PID>
```

### Frontend Won't Start

**Port 5173 Already in Use**:
```bash
# Find what's using port 5173
lsof -i :5173
# Kill the process if needed
kill -9 <PID>
```

**Dependencies Issue**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

If you see CORS errors in browser console:
1. Ensure backend `CLIENT_ORIGIN` in `.env` matches `http://localhost:5173`
2. Restart backend server after changing `.env`
3. Clear browser cache and reload

---

## Default Test Data

The backend seeds these colleges on first start:

1. **PES University**
   - Ring Road Campus
   - Electronic City Campus
   - Hanumanth Nagar Campus

2. **RV University**
   - Mysuru Road Campus

3. **BMS College of Engineering**
   - Bull Temple Road Campus

4. **Christ University**
   - Central Campus
   - Bannerghatta Road Campus

5. **MS Ramaiah Institute of Technology**
   - Mathikere Campus

6. **Dayananda Sagar University**
   - Kudlu Gate Campus
   - Harohalli Campus

7. **Jain University**
   - Jayanagar Campus
   - Knowledge Park Campus

8. **CMR University**
   - Bagalur Campus

9. **REVA University**
   - Kattigenahalli Campus

---

## Quick Commands Reference

```bash
# Backend
cd server
npm run dev          # Start dev server with nodemon
npm start            # Start production server
npm run lint         # Run ESLint

# Frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Both
npm install          # Install dependencies
```

---

## Next Steps

- ✅ Application running locally
- ✅ College/campus suggestions working
- ✅ Can create accounts and post items

Ready to deploy? See **DEPLOYMENT.md**

---

## Need Help?

1. **Check backend logs** in the terminal running the server
2. **Check browser DevTools** console and network tabs
3. **Verify environment variables** in both `.env` files
4. **Check MongoDB connection** in Atlas dashboard
5. **Review error messages** carefully

---

## Project Structure

```
khoj/
├── src/                 # Frontend source
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── context/        # React context
│   └── lib/            # API client
├── server/             # Backend source
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── models/     # MongoDB models
│   │   ├── middleware/ # Express middleware
│   │   ├── utils/      # Utilities
│   │   └── data/       # Seed data
│   └── .env            # Backend environment variables
├── .env                # Frontend environment variables
└── package.json        # Frontend dependencies
```

---

**You're all set! Happy coding! 🚀**
