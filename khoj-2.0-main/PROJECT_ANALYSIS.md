# Khoj Lost & Found - Complete Project Analysis

## Executive Summary

Khoj is a campus-based lost and found platform built with React (frontend) and Express/MongoDB (backend). The system implements university-level isolation where users can only see items from their own university, with optional campus-level filtering. The platform supports posting lost/found items, claiming items, reputation system, and real-time notifications.

---

## 1. FRONTEND ARCHITECTURE

### 1.1 Tech Stack
- **Framework**: React 19.1.1 with Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **State Management**: React Context API (AuthContext)
- **Date Handling**: date-fns
- **Icons**: Lucide React

### 1.2 Project Structure
```
src/
├── App.jsx                 # Main app with routing
├── main.jsx               # React entry point
├── context/
│   └── AuthContext.jsx    # Authentication state & methods
├── lib/
│   ├── apiClient.js       # API wrapper with auto-refresh
│   └── constants.js       # App constants (categories)
├── pages/
│   ├── auth/
│   │   ├── Login.jsx      # Login with university selection
│   │   └── Signup.jsx     # Signup with university selection
│   └── dashboard/
│       ├── Home.jsx       # Main feed with filters
│       ├── PostItem.jsx   # Create/edit items
│       ├── Profile.jsx    # User profile & posts
│       ├── ClaimsManagement.jsx  # Review claims
│       └── Notifications.jsx     # Notification center
└── components/
    ├── layout/
    │   └── Layout.jsx     # Protected route wrapper with nav
    └── ui/
        ├── Button.jsx
        ├── Card.jsx
        ├── Badge.jsx
        ├── Input.jsx
        ├── Select.jsx
        ├── CustomSelect.jsx  # University/campus dropdown
        ├── Modal.jsx
        └── ItemDetailModal.jsx  # Item details popup
```

### 1.3 Key Features

#### Authentication Flow
1. **Signup**: User provides name, email, phone, university, campus (if multi-campus), password
2. **Login**: User provides same credentials - university is validated server-side
3. **Token Management**: 
   - Access token (1h) stored in localStorage
   - Refresh token (7d) stored in HTTP-only cookie
   - Auto-refresh on 401 with queue mechanism
   - Session expiry event dispatched to AuthContext

#### University/Campus Selection
- **CustomSelect Component**: Dropdown for universities and campuses
- **Data Source**: `/api/universities` endpoint (public, no auth)
- **Auto-selection**: If university has only 1 campus, auto-select it
- **Mobile Fix**: Recently fixed "No options available" bug by setting `auth: false` for UniversityAPI.list()

#### Home Feed
- **Filtering**: Type (found/lost), category, status, campus, search
- **Stats Cards**: Total items, campus items, found count, lost count
- **University Isolation**: Only shows items from user's university
- **Campus Filter**: Optional filter to view specific campus (not a restriction)
- **Search**: Full-text search on title, description, location, category

#### Post Item
- **Types**: Found or Lost
- **Fields**: Title, description, category, location, date, images (max 5)
- **Lost-specific**: Urgent flag, reward offering (gratitude, food, coffee, cash, gift)
- **Contact Preference**: Both, email only, or phone only
- **Image Upload**: Cloudinary integration, max 10MB per image

#### Claims System
- **Claim Creation**: Users can claim items with verification details (where, when, specific details)
- **Owner Review**: Item owners see pending claims in ClaimsManagement page
- **Approve/Reject**: Owner can approve (awards +10 reputation to claimer) or reject
- **Contact Sharing**: After approval, claimer's contact info is shown to owner

#### Notifications
- **Types**: claim_request, claim_approved, claim_rejected, item_resolved
- **Auto-read**: Unread notifications marked as read when viewed
- **Real-time**: Created server-side when claims are processed

### 1.4 API Client Architecture

**Key Features**:
- Automatic token refresh with request queuing
- Public endpoint detection (no auth for `/universities`)
- Session expiry event dispatch
- Credential inclusion for cookies
- Error handling with status codes

**Auto-Refresh Flow**:
1. Request fails with 401
2. Check if already refreshing - if yes, queue request
3. Call `/auth/refresh` with HTTP-only cookie
4. Get new access token, update localStorage
5. Retry original request with new token
6. Process queued requests

---

## 2. BACKEND ARCHITECTURE

### 2.1 Tech Stack
- **Framework**: Express 4.19
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (access + refresh tokens)
- **File Upload**: Cloudinary via multer
- **Security**: Helmet, CORS, rate limiting, mongo-sanitize
- **Validation**: Zod schemas

### 2.2 Project Structure
```
server/src/
├── server.js              # Express app setup
├── config/
│   ├── db.js             # MongoDB connection
│   └── cloudinary.js     # Cloudinary + multer config
├── models/
│   ├── User.js           # User schema
│   ├── Item.js           # Item schema
│   ├── Claim.js          # Claim schema
│   ├── Notification.js   # Notification schema
│   └── University.js     # University schema
├── routes/
│   ├── authRoutes.js     # Auth endpoints
│   ├── itemRoutes.js     # Item CRUD
│   ├── claimRoutes.js    # Claim management
│   ├── notificationRoutes.js  # Notifications
│   ├── universityRoutes.js    # University list
│   └── uploadRoutes.js   # Image upload
├── middleware/
│   └── authMiddleware.js # JWT verification
└── utils/
    ├── validators.js     # Zod schemas
    ├── email.js          # Email sending (OTP)
    ├── seedUniversities.js    # Initial data
    └── updateUniversities.js  # Sync universities
```

### 2.3 Database Schema

#### User Model
```javascript
{
  name: String,
  email: String (unique, indexed),
  passwordHash: String (select: false),
  phone: String,
  
  // University isolation (ObjectIds - source of truth)
  universityId: ObjectId (ref: University, indexed),
  campusId: ObjectId (nullable, indexed),
  
  // Display cache (never used for access control)
  universityName: String,
  campusName: String,
  
  reputation: Number (default: 0),
  
  // Email verification
  isEmailVerified: Boolean,
  emailOtp: String (select: false),
  emailOtpExpiry: Date,
  emailOtpAttempts: Number,
  
  // Token management
  tokenVersion: Number (default: 0),
  refreshTokenHash: String (select: false),
  
  // Account lockout
  loginAttempts: Number,
  lockUntil: Date
}
```

**Indexes**:
- `email` (unique)
- `email + universityId` (compound)
- `universityId + campusId` (compound)

#### Item Model
```javascript
{
  type: Enum['found', 'lost'] (indexed),
  title: String,
  description: String,
  category: String (indexed),
  location: String,
  date: Date,
  images: [String],
  urgent: Boolean,
  reward: Enum['gratitude', 'food_treat', 'coffee', 'cash_reward', 'gift', 'none'],
  contactPreference: Enum['both', 'email', 'phone'],
  status: Enum['active', 'resolved'] (indexed),
  
  // Ownership
  user: ObjectId (ref: User, indexed),
  userName: String,
  
  // University isolation (ObjectIds - used for ALL queries)
  universityId: ObjectId (ref: University, indexed),
  campusId: ObjectId (nullable, indexed),
  
  // Display cache
  universityName: String,
  campusName: String
}
```

**Indexes**:
- `universityId + createdAt` (compound)
- `universityId + type + status` (compound)
- `universityId + category` (compound)
- `universityId + campusId + createdAt` (compound)
- Text index on `title, description, location, category`

#### Claim Model
```javascript
{
  itemId: ObjectId (ref: Item, indexed),
  ownerId: ObjectId (ref: User, indexed),
  claimerId: ObjectId (ref: User, indexed),
  whereList: String,
  whenList: String,
  specificDetails: String,
  status: Enum['pending', 'approved', 'rejected'] (indexed)
}
```

**Indexes**:
- `itemId + status` (compound)
- `ownerId + status` (compound)
- `claimerId + status` (compound)

#### Notification Model
```javascript
{
  userId: ObjectId (ref: User, indexed),
  type: Enum['claim_request', 'claim_approved', 'claim_rejected', 'item_resolved'],
  itemId: ObjectId (ref: Item, nullable),
  claimId: ObjectId (ref: Claim, nullable),
  message: String,
  read: Boolean (indexed)
}
```

**Indexes**:
- `userId + read + createdAt` (compound)

#### University Model
```javascript
{
  name: String (unique),
  slug: String (unique),
  campuses: [{
    _id: ObjectId (auto-generated),
    name: String
  }]
}
```

### 2.4 API Endpoints

#### Auth Routes (`/api/auth`)
- `POST /signup` - Create account with university validation
- `POST /verify-email` - Verify email with OTP (currently disabled, auto-verified)
- `POST /resend-otp` - Resend verification OTP
- `POST /login` - Login with university validation
- `POST /refresh` - Refresh access token using HTTP-only cookie
- `POST /logout` - Invalidate tokens (increment tokenVersion)
- `GET /me` - Get current user profile

#### Item Routes (`/api/items`)
- `GET /` - List items (university-scoped, with filters)
- `GET /mine` - Get user's own items
- `POST /` - Create item (university/campus from auth user)
- `GET /:id` - Get item details (with contact info if applicable)
- `PUT /:id` - Update item (owner only)
- `DELETE /:id` - Delete item (owner only)

#### Claim Routes (`/api/claims`)
- `POST /` - Create claim
- `GET /item/:itemId` - Get claims for item (owner only)
- `GET /mine` - Get claims for user's items
- `PUT /:id/approve` - Approve claim (awards +10 reputation)
- `PUT /:id/reject` - Reject claim

#### Notification Routes (`/api/notifications`)
- `GET /` - List notifications
- `GET /unread` - Get unread count
- `PUT /:id/read` - Mark as read
- `PUT /read-all` - Mark all as read

#### University Routes (`/api/universities`)
- `GET /` - List all universities (public, no auth)
- `POST /update` - Sync universities from code
- `POST /fix-dsi` - One-time DSI fix endpoint

#### Upload Routes (`/api/upload`)
- `POST /images` - Upload images to Cloudinary (max 5, 10MB each)

### 2.5 Security Features

#### University Isolation
- **Core Principle**: Users can ONLY see/interact with items from their own university
- **Implementation**: 
  - `universityId` always taken from `req.user` (never from request body/query)
  - All item queries include `universityId` filter
  - Campus is optional filter, NOT a restriction
- **Validation**: University name resolved to ObjectId server-side during signup/login

#### Authentication
- **Access Token**: 1 hour expiry, stored in localStorage
- **Refresh Token**: 7 days expiry, HTTP-only cookie with SameSite=none (production)
- **Token Versioning**: Increment on logout to invalidate all tokens
- **Refresh Token Rotation**: New refresh token on each refresh
- **Token Reuse Detection**: Hash comparison prevents token replay

#### Rate Limiting
- General API: 100 req/15min
- Auth endpoints: 20 req/15min
- Post endpoints: 30 req/15min
- Search endpoints: 100 req/15min

#### Input Validation
- Zod schemas for all user input
- Mongo-sanitize to prevent NoSQL injection
- Protected fields stripped from updates (user, universityId, campusId, status)

#### Account Security
- Password hashing with bcrypt (10 rounds)
- Login attempt tracking (max 10 attempts)
- Account lockout (30 minutes after max attempts)
- Email verification (currently auto-verified)

#### File Upload Security
- Allowed formats: JPG, JPEG, PNG only
- Max file size: 5MB per image
- Max files: 5 images per item
- MIME type validation (not just extension)
- Cloudinary folder isolation

---

## 3. END-TO-END FLOWS

### 3.1 User Registration Flow
1. User fills signup form with university/campus selection
2. Frontend calls `UniversityAPI.list()` to populate dropdowns (no auth)
3. User submits form → `POST /api/auth/signup`
4. Backend resolves university name to ObjectId
5. Backend validates campus exists for that university
6. Backend creates user with `universityId` and `campusId`
7. Backend generates access + refresh tokens
8. Frontend stores access token in localStorage
9. Frontend receives refresh token in HTTP-only cookie
10. User redirected to home feed

### 3.2 Item Posting Flow
1. User navigates to `/post`
2. User selects type (found/lost)
3. User fills form (title, description, category, location, date)
4. User uploads images → `POST /api/upload/images`
5. Cloudinary returns image URLs
6. User submits form → `POST /api/items`
7. Backend creates item with `universityId` and `campusId` from `req.user`
8. Item appears in university feed

### 3.3 Claim Flow
1. User A posts found item
2. User B (from same university) sees item in feed
3. User B clicks item → opens ItemDetailModal
4. User B fills claim form (where, when, specific details)
5. User B submits → `POST /api/claims`
6. Backend creates claim with status='pending'
7. Backend creates notification for User A (claim_request)
8. User A sees notification, navigates to `/claims`
9. User A reviews claim details
10. User A approves → `PUT /api/claims/:id/approve`
11. Backend updates claim status to 'approved'
12. Backend updates item status to 'resolved'
13. Backend awards +10 reputation to User B
14. Backend creates notification for User B (claim_approved)
15. User A sees User B's contact info in ClaimsManagement page

### 3.4 Contact Info Display Logic
- **LOST items**: Contact info (email/phone) shown publicly in ItemDetailModal so finders can contact owner
- **FOUND items**: Contact info hidden until claim is approved
- **After approval**: Claimer's contact info shown to owner in ClaimsManagement page
- **Contact preference**: Respects user's choice (both, email only, phone only)

---

## 4. DEPLOYMENT ARCHITECTURE

### 4.1 Current Setup
- **Frontend**: Vercel (auto-deploy from GitHub master branch)
- **Backend**: Render (auto-deploy from GitHub master branch)
- **Database**: MongoDB Atlas (cloud-hosted)
- **File Storage**: Cloudinary
- **Email**: SMTP (Gmail or SendGrid)

### 4.2 Environment Variables

**Frontend (.env)**:
```
VITE_API_URL=https://your-backend.onrender.com/api
```

**Backend (.env)**:
```
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_ORIGIN=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM_NAME=Khoj Lost & Found
```

### 4.3 CORS Configuration
- **Production**: `secure: true`, `sameSite: 'none'` (cross-domain cookies)
- **Development**: `secure: false`, `sameSite: 'lax'` (localhost)
- **Allowed Origins**: Comma-separated list in `CLIENT_ORIGIN`

### 4.4 Deployment Workflow
1. Developer creates feature branch
2. Developer makes changes and commits
3. Developer creates pull request to master
4. User reviews and merges PR
5. GitHub triggers auto-deploy to Vercel (frontend) and Render (backend)
6. Changes live in production

---

## 5. CURRENT ISSUES & GAPS

### 5.1 Resolved Issues
✅ Mobile dropdown showing "No options available" - Fixed by setting `auth: false` for UniversityAPI.list()
✅ DSI campus data - Updated to "Dayananda Sagar Institutions" with 3 campuses (DSU, DSCE, DSATM)
✅ Contact info display - LOST items show contact publicly, FOUND items hide until claim approved
✅ Claim button visibility - Changed to bright green gradient with better contrast
✅ Reputation points - Verified +10 points awarded to claimer on approval

### 5.2 Known Gaps

#### Authentication
- **No Google OAuth**: Currently only email/password authentication
- **Email verification disabled**: `isEmailVerified` auto-set to true (OTP system exists but not enforced)
- **No password reset**: Users cannot reset forgotten passwords
- **No 2FA**: No two-factor authentication option

#### University Scoping
- **No Google OAuth + University Scoping**: Cannot restrict Google OAuth to specific university domains
- **Manual university selection**: Users can select any university (no domain validation)
- **No university admin**: No way to manage university data or verify users

#### Features
- **No real-time updates**: Users must refresh to see new items/claims/notifications
- **No image moderation**: Uploaded images not checked for inappropriate content
- **No spam prevention**: No captcha or advanced rate limiting
- **No reporting system**: Users cannot report inappropriate items/users
- **No messaging**: Users cannot message each other directly
- **No item matching**: No automatic matching of lost/found items

#### Mobile
- **No PWA**: Not installable as mobile app
- **No push notifications**: Only in-app notifications
- **Limited offline support**: Requires internet connection

#### Analytics
- **No tracking**: No analytics on user behavior, popular items, etc.
- **No admin dashboard**: No way to view system-wide stats

---

## 6. GOOGLE OAUTH IMPLEMENTATION PLAN

### 6.1 Requirements
1. **University Domain Restriction**: Only allow users from specific university email domains (e.g., @dsu.edu.in)
2. **Automatic University Assignment**: Assign university based on email domain
3. **Seamless Integration**: Work alongside existing email/password auth
4. **Security**: Validate tokens server-side, prevent domain spoofing

### 6.2 Implementation Steps

#### Frontend Changes
1. Add Google OAuth button to Login/Signup pages
2. Install `@react-oauth/google` package
3. Configure Google OAuth provider with client ID
4. Handle OAuth callback and send token to backend
5. Update AuthContext to handle OAuth login

#### Backend Changes
1. Install `google-auth-library` package
2. Add `GOOGLE_CLIENT_ID` to environment variables
3. Create `/api/auth/google` endpoint
4. Verify Google token server-side
5. Extract email domain and map to university
6. Create or update user with university assignment
7. Generate access + refresh tokens
8. Return tokens to frontend

#### Database Changes
1. Add `authProvider` field to User model (enum: 'local', 'google')
2. Make `passwordHash` optional (not required for OAuth users)
3. Add `googleId` field for OAuth user identification

#### Domain Mapping
1. Create `universityDomains.js` config file
2. Map email domains to university ObjectIds
3. Example: `{ 'dsu.edu.in': 'DSU_OBJECT_ID', 'dsce.edu.in': 'DSCE_OBJECT_ID' }`
4. Validate domain during OAuth signup
5. Reject non-university domains

### 6.3 Security Considerations
- Verify Google token server-side (never trust client)
- Validate email domain against whitelist
- Prevent email spoofing by checking `email_verified` claim
- Rate limit OAuth endpoints
- Log OAuth attempts for monitoring

### 6.4 User Experience
- Show "Sign in with Google" button prominently
- Auto-detect university from email domain
- Show university name after OAuth (no manual selection needed)
- Allow linking Google account to existing email/password account
- Provide clear error messages for non-university emails

---

## 7. TECHNICAL DEBT & IMPROVEMENTS

### 7.1 Code Quality
- **No TypeScript**: Entire codebase is JavaScript (prone to runtime errors)
- **Limited error handling**: Many try-catch blocks just log errors
- **No logging service**: Console.log used everywhere (should use Winston/Pino)
- **No API documentation**: No Swagger/OpenAPI docs
- **No code comments**: Minimal inline documentation

### 7.2 Testing
- **No tests**: Zero test coverage (no unit, integration, or e2e tests)
- **No CI/CD pipeline**: No automated testing before deployment
- **No staging environment**: Changes go straight to production

### 7.3 Performance
- **No caching**: Every request hits database
- **No pagination**: Items endpoint returns max 100 items (no cursor pagination)
- **No image optimization**: Images not resized/compressed before upload
- **No CDN**: Static assets served from Vercel (could use dedicated CDN)

### 7.4 Monitoring
- **No error tracking**: No Sentry/Rollbar integration
- **No performance monitoring**: No APM tool
- **No uptime monitoring**: No alerts for downtime
- **No database monitoring**: No slow query detection

---

## 8. RECOMMENDATIONS

### 8.1 Immediate Priorities
1. **Implement Google OAuth** with university domain restriction
2. **Add TypeScript** for type safety
3. **Add basic tests** for critical flows (auth, item creation, claims)
4. **Set up error tracking** (Sentry)
5. **Add API documentation** (Swagger)

### 8.2 Short-term Improvements
1. **Enable email verification** (OTP system already exists)
2. **Add password reset** functionality
3. **Implement real-time updates** (WebSockets or polling)
4. **Add image moderation** (Cloudinary AI or manual review)
5. **Add reporting system** for inappropriate content

### 8.3 Long-term Enhancements
1. **Build admin dashboard** for university admins
2. **Add messaging system** for direct communication
3. **Implement item matching** algorithm
4. **Create mobile app** (React Native or PWA)
5. **Add analytics dashboard** for insights

---

## 9. CONCLUSION

Khoj is a well-architected lost and found platform with strong university isolation and security features. The codebase is clean and follows best practices for authentication, authorization, and data validation. The main gaps are around OAuth integration, testing, and monitoring. With the addition of Google OAuth and university domain restriction, the platform will be ready for production use at scale.

**Key Strengths**:
- Strong university isolation (ObjectId-based access control)
- Secure authentication (JWT with refresh tokens)
- Clean separation of concerns (frontend/backend)
- Mobile-responsive UI
- Reputation system for gamification

**Key Weaknesses**:
- No OAuth integration
- No automated testing
- No error tracking/monitoring
- Limited real-time features
- No admin tools

**Next Steps**:
1. Implement Google OAuth with university domain restriction
2. Add comprehensive testing suite
3. Set up monitoring and error tracking
4. Enable email verification
5. Build admin dashboard
