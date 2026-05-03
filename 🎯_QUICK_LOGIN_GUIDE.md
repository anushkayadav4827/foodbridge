# 🎯 Quick Login Guide

## ✅ Everything is Running!

- **Frontend**: http://localhost:3001/
- **Backend**: http://localhost:3000/

---

## 🚀 How to Login (Step by Step)

### Step 1: Open the App
Go to: **http://localhost:3001/**

### Step 2: Click "Get Started"
Click the green "Get Started" or "Start Donating" button

### Step 3: Enter Phone Number
Enter any 10-digit number, for example:
- `9876543210`
- `1234567890`
- `9999999999`

(Any number works - this is demo mode!)

### Step 4: Click "Send OTP"
The app will send a mock OTP

### Step 5: Enter OTP
**Always use: `123456`**

This is the demo OTP code that always works!

### Step 6: Click "Verify & Continue"
You're now logged in! 🎉

---

## 💡 Important Notes

### Demo OTP Code
**Always use: `123456`**

This is hardcoded in the mock server for easy testing.

### Phone Numbers
Any 10-digit number works! The system will:
- Create a new user if the number is new
- Log you in if the number was used before

### Data Persistence
Data is stored in memory only. If you restart the backend server, all users and sessions will be cleared.

---

## 🎊 What You Can Do After Login

1. **View Dashboard** - See your stats and activity
2. **Create Listings** - Post food donations
3. **Discover Food** - Find available food
4. **View Impact** - See your contribution
5. **Manage Profile** - Update your information

---

## 🔧 Troubleshooting

### "Failed to send OTP" Error
- Make sure the backend server is running on port 3000
- Check the terminal for backend server logs
- Restart the backend if needed: `npm run dev:mock` in the backend folder

### Frontend Not Loading
- Make sure the frontend server is running on port 3001
- Check the terminal for frontend server logs
- Restart the frontend if needed: `npm run dev` in the web folder

---

## 🎉 Enjoy!

Your FoodBridge app is ready to use. No database setup, no complex configuration - just login and explore!

**Demo OTP: `123456`** 🔑
