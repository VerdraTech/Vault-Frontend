# Security Setup Guide

This document explains the security features implemented for authentication, CSRF protection, and token refresh.

## 🔐 Security Features Implemented

### 1. **OAuth Authentication**
- **Backend**: AWS Cognito OAuth integration
- **Frontend**: Redirects to backend OAuth flow
- **Cookies**: HttpOnly, Secure, SameSite cookies for tokens
- **Tokens**: Access tokens stored in `__Host-access_token` cookie
- **Refresh Tokens**: Stored in `__Host-refresh_token` cookie

### 2. **CSRF Protection**
- **Token Generation**: Backend generates CSRF tokens via `/auth/csrf-token`
- **Token Storage**: Stored in cookie (readable by JavaScript)
- **Token Validation**: Backend validates cookie matches header for non-safe methods
- **Auto-Injection**: HTTP interceptor automatically adds CSRF token to requests
- **Safe Methods**: GET, HEAD, OPTIONS don't require CSRF token

### 3. **Automatic Token Refresh**
- **Interval**: Tokens refreshed every 15 minutes automatically
- **On 401**: Interceptor automatically refreshes token and retries request
- **Error Handling**: Failed refresh redirects to login

### 4. **HTTP Interceptor**
- **CSRF Token**: Automatically adds `X-CSRF-Token` header to non-safe requests
- **Credentials**: Ensures cookies are sent with all requests
- **401 Handling**: Automatically refreshes token and retries
- **403 Handling**: Detects CSRF failures and redirects to login

## 📋 How It Works

### Authentication Flow

1. **User clicks "Sign in"** → Redirects to `/auth/login`
2. **Backend redirects to Cognito** → OAuth authorization
3. **User authenticates with Cognito** → Redirects back to `/auth/authorize`
4. **Backend validates and creates session** → Sets cookies:
   - `__Host-access_token` (HttpOnly, Secure)
   - `__Host-refresh_token` (HttpOnly, Secure)
   - `csrf-token` (readable by JS)
5. **Redirects to frontend** → User is authenticated

### CSRF Protection Flow

1. **App Initialization** → Fetches CSRF token from `/auth/csrf-token`
2. **Token Stored** → Saved in cookie (readable by JavaScript)
3. **On Non-Safe Requests** → Interceptor reads token from cookie
4. **Adds Header** → Sets `X-CSRF-Token` header
5. **Backend Validates** → Compares cookie value with header value

### Token Refresh Flow

1. **Automatic Refresh** → Every 15 minutes if authenticated
2. **On 401 Error** → Interceptor catches error
3. **Attempts Refresh** → Calls `/auth/refresh` endpoint
4. **Retries Request** → Original request retried with new token
5. **On Failure** → Redirects to login

## 🔧 Usage

### In Your Components

```typescript
import { AuthService } from './core/auth/auth.service';

constructor(private authService: AuthService) {}

// Check if authenticated
this.authService.isAuthenticated$.subscribe(isAuth => {
  if (isAuth) {
    // User is authenticated
  }
});

// Get current user
this.authService.currentUser$.subscribe(user => {
  console.log(user);
});

// Login (redirects to OAuth)
this.authService.login();

// Logout
this.authService.logout();
```

### Making API Calls

```typescript
// All HTTP requests automatically include:
// - CSRF token (for non-safe methods)
// - Cookies (credentials)
// - Auto-refresh on 401

this.http.post('/api/endpoint', data).subscribe({
  next: (response) => {
    // Success
  },
  error: (error) => {
    // Error handling (401 auto-refreshes)
  }
});
```

## 🔒 Security Best Practices Implemented

1. ✅ **HttpOnly Cookies**: Tokens in HttpOnly cookies (not accessible to JavaScript)
2. ✅ **Secure Cookies**: Only sent over HTTPS
3. ✅ **SameSite Cookies**: Prevents CSRF attacks
4. ✅ **CSRF Tokens**: Double-submit cookie pattern
5. ✅ **Token Refresh**: Automatic refresh before expiry
6. ✅ **Automatic Retry**: Failed requests retried after refresh
7. ✅ **State Validation**: OAuth state parameter validated
8. ✅ **Environment Awareness**: Different configs for dev/prod

## ⚠️ Important Notes

1. **CORS**: Ensure your backend CORS settings allow your frontend origin
2. **Cookies**: Cookies must be sent with `withCredentials: true`
3. **HTTPS**: In production, all cookies require HTTPS
4. **Token Expiry**: Access tokens expire; refresh happens automatically
5. **CSRF Token**: Must match between cookie and header

## 🐛 Troubleshooting

### CSRF Token Mismatch
- **Check**: Cookie is set and readable
- **Check**: Header is being sent
- **Fix**: Refresh page to get new CSRF token

### 401 Unauthorized
- **Check**: Token hasn't expired
- **Check**: Cookies are being sent
- **Fix**: Interceptor should auto-refresh

### Cookies Not Sent
- **Check**: CORS allows credentials
- **Check**: `withCredentials: true` is set
- **Check**: Same-origin or correct CORS settings
