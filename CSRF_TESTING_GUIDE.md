# How to Test CSRF Protection in Your Browser

## 🔍 Quick Test Steps

### 1. **Open Your App and Check CSRF Token**

1. **Start your app** (frontend and backend)
2. **Open browser DevTools** (F12)
3. **Go to Console tab** - You should see:
   ```
   CSRF token initialized
   ```
4. **Go to Application tab** → **Cookies** → Select your domain
5. **Look for `csrf-token` cookie** - You should see a value like:
   ```
   csrf-token: abc123xyz...
   ```

### 2. **Verify CSRF Token is Sent with Requests**

1. **Open DevTools** → **Network tab**
2. **Make a POST/PUT/DELETE request** (e.g., submit a form, create an item)
3. **Click on the request** in Network tab
4. **Go to Headers section**
5. **Look for `x-csrf-token` header** - It should match your cookie value

### 3. **Test CSRF Protection Failure**

Open browser console (F12 → Console) and run:

```javascript
// Get your current CSRF token
const csrfToken = document.cookie.split("csrf-token=")[1]?.split(";")[0];
console.log("Current CSRF token:", csrfToken);

// Make a request with WRONG CSRF token
fetch("https://localhost:8000/api/users/", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "x-csrf-token": "wrong-token-value", // Wrong token!
  },
  body: JSON.stringify({ email: "test@example.com" }),
})
  .then((r) => r.json())
  .then((data) => console.log("Response:", data))
  .catch((err) => console.error("Error:", err));
```

**Expected Result:** You should get a **403 Forbidden** error with message: `"CSRF check failed"`

### 4. **Test CSRF Protection Success**

```javascript
// Get your current CSRF token
const csrfToken = document.cookie.split("csrf-token=")[1]?.split(";")[0];
console.log("Using CSRF token:", csrfToken);

// Make a request with CORRECT CSRF token
fetch("https://localhost:8000/api/users/", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "x-csrf-token": csrfToken, // Correct token from cookie
  },
  body: JSON.stringify({ email: "test@example.com" }),
})
  .then((r) => r.json())
  .then((data) => console.log("Success:", data))
  .catch((err) => console.error("Error:", err));
```

**Expected Result:** Request should succeed (200/201) or fail with 409 if user exists (not CSRF error)

### 5. **Test Without CSRF Token**

```javascript
// Make a request WITHOUT CSRF token header
fetch("https://localhost:8000/api/users/", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    // No x-csrf-token header!
  },
  body: JSON.stringify({ email: "test@example.com" }),
})
  .then((r) => r.json())
  .then((data) => console.log("Response:", data))
  .catch((err) => console.error("Error:", err));
```

**Expected Result:** Should get **403 Forbidden** error

### 6. **Verify GET Requests Don't Need CSRF**

```javascript
// GET requests should work without CSRF token
fetch("https://localhost:8000/api/users/", {
  method: "GET",
  credentials: "include",
})
  .then((r) => r.json())
  .then((data) => console.log("GET Success:", data))
  .catch((err) => console.error("Error:", err));
```

**Expected Result:** Should succeed (200) - GET is a "safe" method

## 📊 What to Look For in Network Tab

### **Successful Request (with CSRF):**

```
Request Headers:
  x-csrf-token: abc123xyz...
  Cookie: csrf-token=abc123xyz...; __Host-access_token=...

Response:
  Status: 200 OK
```

### **Failed Request (without/mismatched CSRF):**

```
Request Headers:
  Cookie: csrf-token=abc123xyz...
  (Missing x-csrf-token header OR wrong value)

Response:
  Status: 403 Forbidden
  Body: {"detail": "CSRF check failed"}
```

## 🧪 Interactive Testing Checklist

### ✅ CSRF Token Initialization

- [ ] Console shows "CSRF token initialized"
- [ ] Cookie `csrf-token` exists in Application → Cookies
- [ ] Cookie value is a long random string

### ✅ Automatic CSRF Injection

- [ ] POST/PUT/DELETE requests include `x-csrf-token` header
- [ ] Header value matches cookie value
- [ ] Requests succeed when token matches

### ✅ CSRF Protection

- [ ] Request fails (403) with wrong CSRF token
- [ ] Request fails (403) without CSRF token header
- [ ] GET requests work without CSRF token

### ✅ Cookie Management

- [ ] CSRF token cookie is readable (not HttpOnly)
- [ ] Access token cookie is HttpOnly (can't see in console)
- [ ] Cookies are sent with `credentials: 'include'`

## 🔧 Debugging Commands

### Check CSRF Token in Console:

```javascript
// Get CSRF token
document.cookie.split("csrf-token=")[1]?.split(";")[0];

// Get all cookies
document.cookie;

// Check if token exists
document.cookie.includes("csrf-token");
```

### Monitor Network Requests:

```javascript
// In DevTools Console, you can also filter:
// Network tab → Filter → Type "x-csrf-token" in search
```

### Test Interceptor:

1. Make a POST request through your app UI
2. Check Network tab → Request Headers
3. Verify `x-csrf-token` is automatically added
4. Verify it matches the cookie value

## 🐛 Common Issues

### Issue: CSRF token not in headers

**Check:**

- Is the interceptor registered in `app.module.ts`?
- Is the request method POST/PUT/DELETE? (GET doesn't need it)
- Check browser console for errors

### Issue: 403 errors even with correct token

**Check:**

- Cookie and header values match exactly
- Cookie is set for the correct domain/path
- Backend CORS allows the header

### Issue: Cookie not readable

**Check:**

- Cookie should NOT be HttpOnly (CSRF token needs to be readable)
- Cookie should be set with `httponly=False` in backend

## 📝 Example: Full Test Flow

1. **Open app** → Check console for "CSRF token initialized"
2. **Check cookies** → Verify `csrf-token` exists
3. **Make a POST request** (e.g., create user, submit form)
4. **Check Network tab**:
   - Request has `x-csrf-token` header
   - Header value matches cookie value
   - Request succeeds (200/201)
5. **Test failure** → Try request with wrong token → Should get 403
6. **Test GET** → Should work without CSRF token

## 🎯 Quick Test Script

Copy-paste this into your browser console after loading the app:

```javascript
(async function testCSRF() {
  console.log("🧪 Testing CSRF Protection...\n");

  // 1. Check CSRF token exists
  const csrfToken = document.cookie.split("csrf-token=")[1]?.split(";")[0];
  if (csrfToken) {
    console.log("✅ CSRF token found:", csrfToken.substring(0, 20) + "...");
  } else {
    console.log("❌ CSRF token not found");
    return;
  }

  // 2. Test GET (should work without CSRF)
  console.log("\n📡 Testing GET (no CSRF needed)...");
  try {
    const getRes = await fetch("https://localhost:8000/api/users/", {
      method: "GET",
      credentials: "include",
    });
    console.log("GET Status:", getRes.status, getRes.ok ? "✅" : "❌");
  } catch (e) {
    console.log("GET Error:", e.message);
  }

  // 3. Test POST without CSRF (should fail)
  console.log("\n📡 Testing POST without CSRF token...");
  try {
    const postNoCsrf = await fetch("https://localhost:8000/api/users/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });
    const data = await postNoCsrf.json();
    console.log("POST Status:", postNoCsrf.status, postNoCsrf.status === 403 ? "✅ (Expected 403)" : "❌");
    console.log("Response:", data);
  } catch (e) {
    console.log("POST Error:", e.message);
  }

  // 4. Test POST with wrong CSRF (should fail)
  console.log("\n📡 Testing POST with wrong CSRF token...");
  try {
    const postWrongCsrf = await fetch("https://localhost:8000/api/users/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": "wrong-token",
      },
      body: JSON.stringify({ email: "test@example.com" }),
    });
    const data = await postWrongCsrf.json();
    console.log("POST Status:", postWrongCsrf.status, postWrongCsrf.status === 403 ? "✅ (Expected 403)" : "❌");
    console.log("Response:", data);
  } catch (e) {
    console.log("POST Error:", e.message);
  }

  // 5. Test POST with correct CSRF (should succeed or 409 if user exists)
  console.log("\n📡 Testing POST with correct CSRF token...");
  try {
    const postCorrectCsrf = await fetch("https://localhost:8000/api/users/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({ email: "test@example.com" }),
    });
    const data = await postCorrectCsrf.json();
    console.log("POST Status:", postCorrectCsrf.status);
    console.log("Response:", data);
    if (postCorrectCsrf.status === 403) {
      console.log("❌ Got 403 with correct token - CSRF check may be failing");
    } else {
      console.log("✅ CSRF protection working (not 403)");
    }
  } catch (e) {
    console.log("POST Error:", e.message);
  }

  console.log("\n✅ CSRF testing complete!");
})();
```

This script will test all CSRF scenarios and show you exactly what's happening!
