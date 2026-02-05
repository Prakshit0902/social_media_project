# Deployment Fixes and Issues Resolved

## Overview
This document outlines all the deployment issues found and fixed for the social media project deployed on:
- **Frontend**: https://synapse-net.netlify.app/
- **Backend**: https://socialmediaproject-production.up.railway.app

---

## Critical Issues Fixed

### 1. ❌ Incorrect Backend URL in Frontend Production
**Problem**: Frontend was pointing to a non-existent backend URL

**Location**: `frontend/.env.production`

**Before**:
```env
VITE_API_URL=https://social-media-project-ozcf.onrender.com
```

**After**:
```env
VITE_API_URL=https://socialmediaproject-production.up.railway.app
```

**Impact**: All API calls were failing because the frontend was trying to reach the wrong backend server.

---

### 2. ❌ Backend NODE_ENV Set to Development
**Problem**: Backend environment was set to development mode in production

**Location**: `backend/.env`

**Before**:
```env
NODE_ENV=development
```

**After**:
```env
NODE_ENV=production
```

**Impact**: 
- Cookie `sameSite` policy was set to 'lax' instead of 'none' (required for cross-origin)
- CORS configuration was not properly filtering allowed origins
- Security settings were not production-ready

---

### 3. ❌ Routing Loop Issue - Always Redirecting to /complete-profile
**Problem**: After completing profile registration, users were stuck in a redirect loop back to `/complete-profile`

**Location**: `frontend/src/store/slices/authSlice.js`

**Root Cause**: The `isTransitioning` flag was not being cleared when profile registration completed successfully, causing the app to continuously show the loading screen and redirect.

**Before**:
```javascript
.addCase(registerBasicUserDetails.fulfilled, (state, action) => {
  state.loading = false;
  state.error = null;
  state.user = action.payload.data;
  // Missing: state.isTransitioning = false;
})
```

**After**:
```javascript
.addCase(registerBasicUserDetails.fulfilled, (state, action) => {
  state.loading = false;
  state.error = null;
  state.user = action.payload.data;
  state.isTransitioning = false;  // ✅ Fixed
})
```

**Impact**: Users could not access the dashboard after completing their profile.

---

### 4. ❌ Incorrect Socket.IO URL Configuration
**Problem**: Socket connection URL was incorrectly trying to strip '/api' from a URL that didn't contain it

**Location**: `frontend/src/socket/socket.js`

**Before**:
```javascript
const SOCKET_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:3000';
```

**After**:
```javascript
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

**Impact**: Real-time features (chat, notifications) might have connection issues.

---

### 5. ⚠️ Security: .env Files Not in .gitignore
**Problem**: Frontend `.gitignore` was missing .env file patterns

**Location**: `frontend/.gitignore`

**Added**:
```gitignore
# Environment files
.env
.env.local
.env.*.local
```

**Impact**: Prevents accidentally committing sensitive environment variables to version control.

---

## Configuration Summary

### Backend Configuration (Railway)
Ensure these environment variables are set in Railway dashboard:
```env
MONGODB_URI=<your-mongodb-connection-string>
PORT=3000
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
ACCESS_TOKEN_SECRET=<your-access-token-secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
REFRESH_TOKEN_EXPIRY=10d
ENCRYPTION_KEY=<your-encryption-key>
GEMINI_API_KEY=<your-gemini-api-key>
FRONTEND_URL=https://synapse-net.netlify.app
NODE_ENV=production
```

### Frontend Configuration (Netlify)
Build settings in Netlify dashboard:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

Environment variables in Netlify:
```env
VITE_API_URL=https://socialmediaproject-production.up.railway.app
```

---

## How Backend Authentication Works in Production

### Cookie Configuration
With `NODE_ENV=production`, cookies are configured as:
```javascript
{
  httpOnly: true,
  secure: true,           // HTTPS required
  sameSite: 'none',       // Allows cross-origin cookies
  path: '/',
  maxAge: 24 * 60 * 60 * 1000  // 1 day
}
```

### CORS Configuration
Backend allows requests from:
- `https://synapse-net.netlify.app` (production frontend)
- Any additional URL in `FRONTEND_URL` environment variable

```javascript
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}))
```

---

## Testing Deployment

### 1. Test Authentication Flow
1. Visit https://synapse-net.netlify.app/
2. Register a new account
3. Complete profile setup
4. Verify redirect to `/dashboard` (should NOT redirect back to `/complete-profile`)
5. Test logout and login again

### 2. Test API Connectivity
Open browser console on https://synapse-net.netlify.app/ and check:
- Network tab shows requests to `https://socialmediaproject-production.up.railway.app`
- No CORS errors
- Cookies are being set and sent

### 3. Test Socket.IO Connection
1. Login to the application
2. Navigate to messages/chat
3. Check browser console for: `"Socket connected: <socket-id>"`
4. Test real-time messaging

---

## Common Deployment Issues

### Issue: CORS Errors
**Symptoms**: 
- Requests fail with CORS error in browser console
- `Access-Control-Allow-Origin` error

**Solution**: 
- Verify `NODE_ENV=production` in Railway
- Verify `FRONTEND_URL` matches Netlify URL in Railway
- Check backend logs for "Blocked origin"

### Issue: Cookies Not Being Sent
**Symptoms**:
- Authentication fails
- User appears logged out immediately
- "Unauthorized request" errors

**Solution**:
- Ensure both frontend and backend use HTTPS
- Verify `withCredentials: true` in axios
- Verify cookies have `sameSite: 'none'` and `secure: true` in production

### Issue: Socket.IO Connection Failed
**Symptoms**:
- "Socket connection error" in console
- Real-time features don't work

**Solution**:
- Verify `VITE_API_URL` is correct in frontend env
- Check Railway logs for WebSocket upgrade errors
- Ensure Railway allows WebSocket connections

---

## Deployment Checklist

### Before Deploying:
- [ ] Update backend URL in `frontend/.env.production`
- [ ] Set `NODE_ENV=production` in Railway dashboard
- [ ] Verify all environment variables in Railway
- [ ] Verify FRONTEND_URL in Railway matches Netlify URL
- [ ] Build and test locally with production env

### After Deploying:
- [ ] Test user registration and profile completion
- [ ] Test login/logout flow
- [ ] Check browser console for errors
- [ ] Test real-time features (chat, notifications)
- [ ] Verify no CORS errors
- [ ] Test on multiple browsers

---

## Files Modified

1. `frontend/.env.production` - Updated backend URL
2. `backend/.env` - Changed NODE_ENV to production
3. `frontend/src/store/slices/authSlice.js` - Fixed routing loop
4. `frontend/src/socket/socket.js` - Fixed Socket.IO URL
5. `frontend/.gitignore` - Added .env file patterns

---

## Support

If issues persist after these fixes:
1. Check Railway logs: `railway logs`
2. Check Netlify build logs in dashboard
3. Check browser console for detailed error messages
4. Verify all environment variables are correctly set
