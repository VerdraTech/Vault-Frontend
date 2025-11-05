# Practical Testing Guide for Authentication & Security

## 🧪 Testing Checklist

### Prerequisites
1. **Backend running** on `https://localhost:8000` (or your configured URL)
2. **Frontend running** on `http://localhost:4200` (or `http://localhost:8100`)
3. **Browser DevTools open** (F12 → Network tab)
4. **Console open** (F12 → Console tab)

---

## 1. ✅ Test CSRF Token Initialization

### Steps:
1. Open your frontend app in browser
2. Open DevTools → **Console** tab
3. Look for: `"CSRF token initialized"` message
4. Open DevTools → **Application** → **Cookies**
5. Check for `csrf-token` cookie

### Expected Result:
- ✅ Console shows "CSRF token initialized"
- ✅ Cookie `csrf-token` exists with a value
- ✅ Network tab shows GET request to `/auth/csrf-token` (200 OK)

### If it fails:
- Check backend is running
- Check CORS settings allow your frontend origin
- Check browser console for errors

---

## 2. ✅ Test Authentication Flow

### Steps:
1. Navigate to `/login` page
2. Click "Sign in with OAuth" button
3. **Observe the redirect**:
   - Should redirect to Cognito login page
   - URL should be: `https://cognito-idp.us-east-2.amazonaws.com/...`
4. **Login with test credentials**
5. **After login**:
   - Should redirect back to your app
   - Should navigate to `/folder/inbox` (or your configured route)

### Expected Result:
- ✅ Redirects to Cognito
- ✅ After login, redirects back to frontend
- ✅ Cookies set:
   - `__Host-access_token` (HttpOnly, Secure)
   - `__Host-refresh_token` (HttpOnly, Secure)
   - `csrf-token` (readable)
- ✅ User is authenticated (check console for auth state)

### Check in DevTools:
```javascript
// In Console tab, run:
document.cookie
// Should see: csrf-token=...
// (access_token won't show because it's HttpOnly)
```

---

## 3. ✅ Test API Calls with CSRF Protection

### Steps:
1. **After logging in**, make an API call (e.g., navigate to `/inventory`)
2. Open DevTools → **Network** tab
3. Look for POST/PUT/DELETE requests
4. **Check request headers**:
   - Click on the request
   - Go to "Headers" section
   - Look for `x-csrf-token` header

### Expected Result:
- ✅ POST/PUT/DELETE requests include `x-csrf-token` header
- ✅ Header value matches `csrf-token` cookie value
- ✅ Requests succeed (200 OK)

### Test in Console:
```javascript
// Make a test API call
fetch('https://your-api-url.com/api/endpoint', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': document.cookie.split('csrf-token=')[1]?.split(';')[0]
  },
  body: JSON.stringify({ test: 'data' })
})
.then(r => r.json())
.then(console.log)
```

---

## 4. ✅ Test CSRF Protection Failure

### Steps:
1. **Get a valid CSRF token** from cookie
2. **Make a request with wrong CSRF token**:
   ```javascript
   fetch('https://your-api-url.com/api/endpoint', {
     method: 'POST',
     credentials: 'include',
     headers: {
       'Content-Type': 'application/json',
       'x-csrf-token': 'wrong-token-value'
     },
     body: JSON.stringify({ test: 'data' })
   })
   ```
3. Check response

### Expected Result:
- ✅ Request fails with **403 Forbidden**
- ✅ Error message: `"CSRF check failed"`
- ✅ Console shows CSRF error

---

## 5. ✅ Test Token Refresh

### Method 1: Wait for Automatic Refresh
1. **After logging in**, open DevTools → **Network** tab
2. **Wait 15 minutes** (or change interval in code for testing)
3. Look for POST request to `/auth/refresh`
4. Check response

### Method 2: Manual Refresh Test
```javascript
// In browser console, after login:
fetch('https://your-api-url.com/auth/refresh', {
  method: 'POST',
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
```

### Method 3: Force Expiry (Advanced)
1. **Manually expire token** (modify cookie expiry)
2. **Make an API call**
3. **Observe**: Interceptor should auto-refresh and retry

### Expected Result:
- ✅ POST to `/auth/refresh` succeeds (200 OK)
- ✅ New access token cookie is set
- ✅ Request retries successfully after refresh
- ✅ Console shows "Token refreshed successfully"

---

## 6. ✅ Test 401 Handling & Auto-Refresh

### Steps:
1. **After logging in**, manually delete `__Host-access_token` cookie:
   ```javascript
   // In console:
   document.cookie = '__Host-access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;';
   ```
2. **Make an API call** (e.g., navigate to `/inventory`)
3. **Observe network tab**:
   - First request fails with 401
   - Interceptor calls `/auth/refresh`
   - Original request is retried
   - Request succeeds

### Expected Result:
- ✅ First request fails (401 Unauthorized)
- ✅ Interceptor automatically calls `/auth/refresh`
- ✅ Original request is retried
- ✅ Request succeeds after refresh

---

## 7. ✅ Test Token Refresh Failure

### Steps:
1. **Delete both tokens**:
   ```javascript
   document.cookie = '__Host-access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;';
   document.cookie = '__Host-refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;';
   ```
2. **Make an API call**
3. **Observe behavior**

### Expected Result:
- ✅ Refresh fails (401 Unauthorized)
- ✅ User is redirected to `/login`
- ✅ Auth state is cleared (`isAuthenticated = false`)

---

## 8. ✅ Test Logout

### Steps:
1. **After logging in**, call logout:
   ```javascript
   // In component or console:
   this.authService.logout()
   // Or in console (if you have access):
   // Navigate to page with logout button and click it
   ```
2. **Check cookies**
3. **Check auth state**

### Expected Result:
- ✅ POST to `/auth/logout` succeeds
- ✅ All auth cookies are deleted
- ✅ User redirected to `/` (home)
- ✅ `isAuthenticated = false`

---

## 9. ✅ Test Protected Routes

### Steps:
1. **Without logging in**, try to navigate to `/inventory`
2. **Observe behavior**

### Expected Result:
- ✅ GET to `/auth/me` fails (401)
- ✅ User redirected to `/login`
- ✅ Auth state is `false`

---

## 10. ✅ Test with Browser DevTools

### Monitor Network Requests:
1. **Open DevTools** → **Network** tab
2. **Filter by "Fetch/XHR"**
3. **Watch for**:
   - CSRF token in headers (POST/PUT/DELETE)
   - Cookie headers being sent
   - 401 errors triggering refresh
   - Token refresh requests

### Monitor Cookies:
1. **DevTools** → **Application** → **Cookies**
2. **Check**:
   - `csrf-token` exists and readable
   - `__Host-access_token` exists (HttpOnly, Secure)
   - `__Host-refresh_token` exists (HttpOnly, Secure)

### Console Commands for Testing:
```javascript
// Check CSRF token
document.cookie.split('csrf-token=')[1]?.split(';')[0]

// Check if authenticated (via service)
// You'll need to expose this in your component or use Angular DevTools

// Delete access token (to test refresh)
document.cookie = '__Host-access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;';

// Check all cookies
document.cookie
```

---

## 🐛 Common Issues & Solutions

### Issue: CSRF token not being sent
**Solution**: Check interceptor is registered in `app.module.ts`

### Issue: 401 errors not triggering refresh
**Solution**: Check interceptor is handling 401s correctly

### Issue: Cookies not being sent
**Solution**: 
- Check `withCredentials: true` is set
- Check CORS allows credentials
- Check cookie domain/path settings

### Issue: CORS errors
**Solution**: 
- Verify backend CORS includes your frontend origin
- Check `allow_credentials=True` in backend
- Check headers are allowed in CORS

---

## 📊 Quick Test Script

Run this in browser console after login:

```javascript
// Test 1: Check CSRF token exists
const csrfToken = document.cookie.split('csrf-token=')[1]?.split(';')[0];
console.log('CSRF Token:', csrfToken ? '✅ Found' : '❌ Missing');

// Test 2: Make API call with CSRF
fetch('YOUR_API_URL/api/endpoint', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken
  },
  body: JSON.stringify({ test: true })
})
.then(r => {
  console.log('API Call Status:', r.status);
  return r.json();
})
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));

// Test 3: Test refresh endpoint
fetch('YOUR_API_URL/auth/refresh', {
  method: 'POST',
  credentials: 'include'
})
.then(r => {
  console.log('Refresh Status:', r.status);
  return r.json();
})
.then(data => console.log('Refresh Response:', data))
.catch(err => console.error('Refresh Error:', err));
```

---

## ✅ Success Criteria

Your implementation is working correctly if:
- ✅ CSRF token is fetched on app start
- ✅ CSRF token is sent with all POST/PUT/DELETE requests
- ✅ Login flow works (redirects to Cognito and back)
- ✅ Cookies are set correctly after login
- ✅ API calls succeed when authenticated
- ✅ API calls fail with 403 when CSRF token is wrong
- ✅ Token refresh happens automatically on 401
- ✅ Failed refresh redirects to login
- ✅ Logout clears all cookies and redirects
