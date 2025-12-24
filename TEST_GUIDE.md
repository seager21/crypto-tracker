# Quick Test Guide - Account Creation & Profile Management

## System Status
- **Dev Server**: http://localhost:3000 ✅
- **Backend API**: http://localhost:4000 ✅
- **Firebase**: Connected and Initialized ✅

## Test Scenarios

### Scenario 1: Register New Account
**Expected Result**: Account created, redirected to dashboard

```
1. Go to http://localhost:3000/register
2. Enter:
   - Display Name: "John Crypto"
   - Email: "john123@example.com"
   - Password: "TestPass123"
   - Confirm: "TestPass123"
3. Click "Create Account"
4. ✅ Should see success message
5. ✅ Should be redirected to /dashboard
6. ✅ Should see welcome message with your name
```

### Scenario 2: Test Registration Validation
**Expected Result**: Error messages display for invalid inputs

```
Test Cases:
a) Empty fields → "field is required" 
b) Email without @ → "valid email address"
c) Password < 6 chars → "at least 6 characters"
d) Passwords don't match → "Passwords do not match"
e) Display name < 2 chars → "at least 2 characters"
```

### Scenario 3: Edit Profile
**Expected Result**: Profile info updates and saves

```
1. Go to Dashboard → Profile tab
2. Click edit icon (pencil)
3. Change:
   - Display Name: "Jane Crypto"
   - Bio: "Blockchain enthusiast"
   - Location: "New York"
   - Website: "crypto.example.com"
4. Click save icon (checkmark)
5. ✅ Should see "Profile updated successfully"
6. ✅ Changes should appear immediately
```

### Scenario 4: Change Settings
**Expected Result**: All settings save to Firestore

```
1. In Profile tab, scroll to "Preferences"

2. Theme:
   - Click Light → should change immediately
   - Click Dark → should change immediately

3. Currency:
   - Select EUR → confirms "Currency changed to EUR"
   - Select GBP → confirms "Currency changed to GBP"

4. Timezone:
   - Select Europe/Lisbon → saves successfully
   - Select Africa/Johannesburg → saves successfully

5. News Region:
   - Select Africa → confirms change
   - Select Asia → confirms change

6. Notifications:
   - Click toggle on → "Notifications enabled"
   - Click toggle off → "Notifications disabled"
```

### Scenario 5: View Dashboard Stats
**Expected Result**: Portfolio statistics display correctly

```
1. Go to Dashboard → Overview tab
2. See cards for:
   - Portfolio Value: $0.00 (initially)
   - Total Invested: $0.00 (initially)
   - Total Gain: $0.00 (initially, green)
   - Gain %: 0.00% (initially)
3. Add crypto to portfolio
4. Stats should update accordingly
```

### Scenario 6: Navigation
**Expected Result**: Smooth navigation between sections

```
1. Dashboard → Overview
2. Dashboard → Watchlist
3. Dashboard → Portfolio
4. Dashboard → Profile
5. Profile → (same page)
6. All transitions should be smooth
```

## Error Scenarios

### Should Handle Errors:
1. **Duplicate Email**: "Email already in use"
2. **Missing Fields**: Per-field validation messages
3. **Network Error**: "Server error" with helpful message
4. **Firebase Error**: Descriptive error message

## Data Verification

### Check Firestore (Console)
```
Path: /users/{uid}

Should contain:
✅ uid
✅ email
✅ displayName
✅ profile { bio, location, website }
✅ settings { theme, currency, timezone, newsRegion, notifications }
✅ stats { totalInvested, currentValue, totalGain, totalGainPercent }
✅ watchlist []
✅ portfolio []
✅ favoriteCoins []
✅ createdAt (timestamp)
✅ updatedAt (timestamp)
```

## Console Checks

### Browser Console (F12)
- No red errors ✅
- Network tab shows successful requests ✅
- Storage shows Firebase auth token ✅

### Backend Logs
```
✅ "Firebase Admin initialized successfully"
✅ POST /api/auth/register → 201
✅ User registered successfully
✅ Profile updates → 200 OK
```

## Performance Notes

- Dev server hot-reloads on file changes ✅
- Frontend rebuild: ~30 seconds
- API responses: < 500ms typically
- No console warnings about unused imports ✅
- TypeScript compilation: 0 errors ✅

## Rollback Instructions (if needed)

The system is using client-side Firebase SDK for auth, which means:
- Register uses: Firebase SDK directly
- Firestore updates use: Firebase SDK with proper rules
- No custom backend auth needed unless you want to add JWT tokens

All changes are forward-compatible with future features:
- Email verification
- 2FA
- OAuth integrations
- Custom claims

---

**Date**: Dec 24, 2025
**Status**: Ready for Testing ✅
