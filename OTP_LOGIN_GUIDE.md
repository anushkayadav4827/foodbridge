# 🔐 OTP Login Guide - FoodBridge

## ✅ Mock OTP Fixed!

The OTP system is now configured to use a **fixed OTP code in development mode** for easy testing.

---

## 🎯 How to Login

### **Step 1: Enter Phone Number**
1. Go to: **http://localhost:3001/login**
2. Enter any phone number (e.g., `9876543210`)
3. Select country code (default: `+91`)
4. Click **"Send OTP"**

### **Step 2: Enter OTP Code**
**Use this OTP code**: `123456`

The OTP is **always `123456`** in development mode for easy testing!

### **Step 3: Complete Onboarding** (if new user)
If this is your first time logging in:
1. Enter your full name
2. Select your role (Donor, Receiver, or Volunteer)
3. Complete role-specific information
4. Click **"Complete Onboarding"**

### **Step 4: Access Dashboard**
After successful login, you'll be redirected to the dashboard!

---

## 🔍 How It Works

### **Development Mode (Current)**
- **Fixed OTP**: Always `123456`
- **No SMS sent**: OTP is logged in backend console
- **Easy testing**: No need for real phone numbers or SMS service

### **Production Mode**
- **Random OTP**: 6-digit random code
- **SMS sent**: Via Twilio to real phone numbers
- **Secure**: OTP expires after 10 minutes

---

## 📋 OTP Configuration

### **Environment Variables** (`backend/.env`)

```env
# OTP Settings
OTP_EXPIRY_MINUTES=10          # OTP expires after 10 minutes
OTP_MAX_ATTEMPTS=3             # Maximum 3 attempts per OTP
OTP_LOCKOUT_MINUTES=10         # Lockout for 10 minutes after max attempts

# Twilio (Optional in development)
TWILIO_ACCOUNT_SID=            # Leave empty for dev mode
TWILIO_AUTH_TOKEN=             # Leave empty for dev mode
TWILIO_PHONE_NUMBER=           # Leave empty for dev mode
```

### **How OTP is Generated**

**Development Mode** (`NODE_ENV=development`):
```typescript
const otpCode = '123456'; // Fixed OTP for testing
```

**Production Mode** (`NODE_ENV=production`):
```typescript
const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Random 6-digit OTP
```

---

## 🧪 Testing Different Scenarios

### **Test 1: Successful Login**
1. Phone: `9876543210`
2. OTP: `123456`
3. Result: ✅ Login successful

### **Test 2: Wrong OTP**
1. Phone: `9876543210`
2. OTP: `111111` (wrong)
3. Result: ❌ "Invalid OTP. 2 attempts remaining."

### **Test 3: Expired OTP**
1. Request OTP
2. Wait 10 minutes
3. Try to verify
4. Result: ❌ "OTP has expired. Please request a new one."

### **Test 4: Max Attempts**
1. Enter wrong OTP 3 times
2. Result: ❌ "Maximum OTP attempts exceeded. Please try again later."
3. Lockout: 10 minutes

### **Test 5: New User**
1. Phone: `9999999999` (new number)
2. OTP: `123456`
3. Result: ✅ "Account created successfully. Please complete onboarding."

### **Test 6: Existing User**
1. Phone: `9876543210` (existing number)
2. OTP: `123456`
3. Result: ✅ "Login successful" → Dashboard

---

## 🔧 Backend Console Output

When you request an OTP, you'll see this in the backend console:

```
[2024-01-01 12:00:00] INFO: OTP sent to +919876543210: 123456
[2024-01-01 12:00:00] INFO: [DEV MODE] OTP for +919876543210: 123456
```

---

## 🐛 Troubleshooting

### **Problem: "OTP expired or not found"**

**Cause**: Redis cache is not running or OTP was not stored

**Solution 1**: Check if Redis is running
```bash
# Windows
redis-server

# Or check if Redis is in Docker
docker ps | grep redis
```

**Solution 2**: Restart backend server
```bash
cd backend
npm run dev
```

**Solution 3**: Request a new OTP
- Click "Resend OTP" button
- Wait for confirmation message
- Use OTP: `123456`

### **Problem: "Invalid OTP"**

**Cause**: Entered wrong OTP code

**Solution**: Use the correct OTP code: `123456`

### **Problem: "Maximum OTP attempts exceeded"**

**Cause**: Entered wrong OTP 3 times

**Solution**: Wait 10 minutes or restart backend to clear lockout

### **Problem: Backend not logging OTP**

**Cause**: Backend server not running or logs not visible

**Solution**: Check backend terminal window for logs

---

## 📱 Frontend OTP Input

The frontend expects a **6-digit OTP code**:

```typescript
// LoginPage.tsx
const handleVerifyOTP = async () => {
  const response = await api.post('/auth/verify-otp', {
    phoneNumber: phone,
    otpCode: otp, // Must be "123456" in dev mode
    countryCode: '+91'
  });
};
```

---

## 🔒 Security Features

### **Rate Limiting**
- Max 3 OTP attempts per phone number
- 10-minute lockout after max attempts
- Prevents brute force attacks

### **OTP Expiry**
- OTP expires after 10 minutes
- Must request new OTP after expiry
- Prevents replay attacks

### **Phone Verification**
- Phone number verified on successful OTP
- `is_phone_verified` flag set to `true`
- Required for accessing protected features

### **JWT Tokens**
- Access token: 7 days expiry
- Refresh token: 30 days expiry
- Secure token-based authentication

---

## 🚀 Quick Start

### **1. Start Backend**
```bash
cd backend
npm run dev
```

### **2. Start Frontend**
```bash
cd web
npm run dev
```

### **3. Login**
1. Go to: http://localhost:3001/login
2. Phone: `9876543210`
3. Click "Send OTP"
4. Enter OTP: `123456`
5. Click "Verify & Continue"

### **4. Success!**
You should now be logged in and redirected to the dashboard! 🎉

---

## 📊 OTP Flow Diagram

```
User enters phone number
        ↓
Frontend calls POST /api/v1/auth/login
        ↓
Backend generates OTP (123456 in dev)
        ↓
Backend stores OTP in Redis + Database
        ↓
Backend logs OTP in console
        ↓
User enters OTP (123456)
        ↓
Frontend calls POST /api/v1/auth/verify-otp
        ↓
Backend verifies OTP from Redis
        ↓
Backend creates/updates user
        ↓
Backend generates JWT tokens
        ↓
Frontend stores tokens in localStorage
        ↓
User redirected to dashboard
```

---

## 🎯 Summary

✅ **Fixed OTP**: Always `123456` in development mode  
✅ **Easy Testing**: No need for real SMS service  
✅ **Backend Logging**: OTP logged in console  
✅ **Redis Caching**: Fast OTP verification  
✅ **Security**: Rate limiting, expiry, lockout  
✅ **JWT Tokens**: Secure authentication  

**You can now login with any phone number using OTP: `123456`** 🚀

---

## 📞 Support

If you still have issues:

1. Check backend console for OTP logs
2. Verify Redis is running
3. Restart both backend and frontend
4. Clear browser localStorage
5. Try with a different phone number

**Happy testing! 🎉**
