# Auth Middleware Fix - Summary

## 🎯 Problem

Protected routes (`/api/auth/me`, `/api/auth/profile`) were returning 401 even though token was being sent from frontend.

## 🔍 Investigation

The auth middleware was already correctly implemented:
- ✅ Correctly extracts Bearer token from Authorization header
- ✅ Correctly verifies JWT token
- ✅ Correctly fetches user from database
- ✅ Correctly checks token version

## ✅ Solution: Enhanced Debug Logging

Added comprehensive debug logging to identify where authentication fails:

### Before:
```javascript
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+tokenVersion');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (decoded.tv !== user.tokenVersion) {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.name);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

### After:
```javascript
const authMiddleware = async (req, res, next) => {
  console.log('🔐 Auth middleware - Path:', req.path);
  console.log('🔐 Auth header:', req.headers.authorization ? 'present' : 'missing');
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Auth failed: No Bearer token in header');
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔑 Extracted token:', token ? `${token.substring(0, 20)}...` : 'missing');
  
  if (!token) {
    console.log('❌ Auth failed: Token is empty after split');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    if (!process.env.JWT_SECRET) {
      console.error('❌ CRITICAL: JWT_SECRET is not set!');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified, user ID:', decoded.id);

    const user = await User.findById(decoded.id).select('+tokenVersion');
    if (!user) {
      console.log('❌ User not found in database:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }

    if (decoded.tv !== user.tokenVersion) {
      console.log('❌ Token version mismatch - decoded:', decoded.tv, 'user:', user.tokenVersion);
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    console.log('✅ Auth successful for user:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.name, error.message);
    if (error.name === 'JsonWebTokenError') {
      console.error('   Token is malformed or invalid');
    } else if (error.name === 'TokenExpiredError') {
      console.error('   Token has expired');
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

## 📋 Debug Logs Added

### Success Flow:
```
🔐 Auth middleware - Path: /me
🔐 Auth header: present
🔑 Extracted token: eyJhbGciOiJIUzI1NiIs...
✅ Token verified, user ID: 507f1f77bcf86cd799439011
✅ Auth successful for user: user@example.com
```

### Failure Scenarios:

**No Authorization header:**
```
🔐 Auth middleware - Path: /me
🔐 Auth header: missing
❌ Auth failed: No Bearer token in header
```

**Invalid token format:**
```
🔐 Auth middleware - Path: /me
🔐 Auth header: present
🔑 Extracted token: missing
❌ Auth failed: Token is empty after split
```

**JWT verification failed:**
```
🔐 Auth middleware - Path: /me
🔐 Auth header: present
🔑 Extracted token: eyJhbGciOiJIUzI1NiIs...
❌ Auth error: JsonWebTokenError invalid signature
   Token is malformed or invalid
```

**User not found:**
```
🔐 Auth middleware - Path: /me
🔐 Auth header: present
🔑 Extracted token: eyJhbGciOiJIUzI1NiIs...
✅ Token verified, user ID: 507f1f77bcf86cd799439011
❌ User not found in database: 507f1f77bcf86cd799439011
```

**Token version mismatch:**
```
🔐 Auth middleware - Path: /me
🔐 Auth header: present
🔑 Extracted token: eyJhbGciOiJIUzI1NiIs...
✅ Token verified, user ID: 507f1f77bcf86cd799439011
❌ Token version mismatch - decoded: 0 user: 1
```

## 🔍 How to Debug

After deployment, check backend logs when accessing protected routes:

1. **Check if token is being sent:**
   - Look for: `🔐 Auth header: present`
   - If missing, frontend is not sending token

2. **Check if token is extracted:**
   - Look for: `🔑 Extracted token: eyJ...`
   - If missing, token format is wrong

3. **Check if token is valid:**
   - Look for: `✅ Token verified, user ID: ...`
   - If error, token is invalid or expired

4. **Check if user exists:**
   - Look for: `✅ Auth successful for user: ...`
   - If error, user was deleted or token version changed

## ✅ Verification

The middleware is correctly applied to:
- ✅ `GET /api/auth/me` - Uses authMiddleware
- ✅ `PATCH /api/auth/profile` - Uses authMiddleware

## 🔧 Token Extraction Logic

The middleware correctly:
1. ✅ Reads `Authorization` header
2. ✅ Checks for `Bearer ` prefix
3. ✅ Splits by space and takes second part
4. ✅ Verifies JWT with `JWT_SECRET`
5. ✅ Fetches user from database
6. ✅ Checks token version
7. ✅ Attaches user to `req.user`

## 📝 Files Changed

- `server/src/middleware/authMiddleware.js` - Added debug logging

## 🎯 Expected Behavior

After this fix, you'll be able to see exactly where authentication fails:

### If frontend is not sending token:
```
❌ Auth failed: No Bearer token in header
```
→ Fix frontend token propagation

### If token is invalid:
```
❌ Auth error: JsonWebTokenError invalid signature
```
→ Token was signed with different secret or corrupted

### If token is expired:
```
❌ Auth error: TokenExpiredError
```
→ User needs to refresh token or login again

### If user doesn't exist:
```
❌ User not found in database
```
→ User was deleted or token has wrong user ID

### If everything works:
```
✅ Auth successful for user: user@example.com
```
→ Request proceeds to route handler

## 🚀 Next Steps

1. Deploy this change
2. Test protected routes
3. Check backend logs for debug output
4. Identify exact failure point
5. Fix based on log messages

## 💡 Common Issues & Solutions

### Issue: "No Bearer token in header"
**Solution:** Frontend is not sending Authorization header
- Check `src/lib/apiClient.js` token propagation
- Verify token exists in localStorage
- Check browser Network tab for Authorization header

### Issue: "Token is malformed or invalid"
**Solution:** Token format is wrong or signed with different secret
- Verify JWT_SECRET is same on frontend and backend
- Check token is not corrupted
- Try logging in again to get fresh token

### Issue: "User not found in database"
**Solution:** User was deleted or token has wrong ID
- Check if user exists in database
- Verify token was created for correct user
- Try logging in again

### Issue: "Token version mismatch"
**Solution:** User logged out or token was invalidated
- User needs to login again
- Token version increments on logout

## 🎉 Result

With enhanced debug logging, you can now pinpoint exactly where authentication fails and fix it accordingly!
