# 🔥 Complete FoodBridge Test Guide

## 🌐 MAIN URL: http://localhost:3001/

---

## ✅ SERVERS STATUS

- **Frontend**: http://localhost:3001/ ✅ Running
- **Backend**: http://localhost:3005/ ✅ Running

---

## 🎯 COMPLETE TEST FLOW (5 minutes)

### Step 1: Landing Page
1. Open: **http://localhost:3001/**
2. You'll see:
   - Beautiful green gradient hero
   - Animated stats counter (scroll to see animation)
   - Feature cards
   - "How It Works" section
3. Click **"Get Started"** button

### Step 2: Login
1. You'll be on: http://localhost:3001/login
2. Enter phone: `9876543210`
3. Click **"Send OTP"**
4. Enter OTP: `123456`
5. Click **"Verify & Continue"**
6. ✅ You're now logged in!

### Step 3: Role Selection
1. You'll see 3 role cards:
   - 🍽️ Donor
   - ❤️ Receiver
   - 🚚 Volunteer
2. Click on **"Donor"** card
3. Click **"Continue"**

### Step 4: Onboarding
1. Enter your name: `John Doe` (or any name)
2. Email is optional
3. Click **"Complete Setup"**
4. ✅ Profile created!

### Step 5: Dashboard
1. You'll see your dashboard with:
   - Welcome message with your name
   - 4 stat cards (Donations, Meals, CO₂, Score)
   - Recent Activity section
   - Quick Actions sidebar
   - Your Badges
2. Click **"Create Your First Listing"**

### Step 6: Create Listing
1. Fill in the form:
   - **Food Title**: `Delicious Biryani`
   - **Quantity**: `20`
   - **Pickup Address**: `123 Main Street, Bangalore`
   - **Ready From**: Select today's date and time (e.g., 6:00 PM)
   - **Pickup By**: Select today's date and later time (e.g., 8:00 PM)
2. Click **"Post Listing"**
3. ✅ Success! You'll see a success message
4. You'll be redirected to dashboard

---

## 🎨 WHAT YOU'LL SEE

### Design Features:
- ✅ Beautiful green (#2E7D32) and orange (#FF6F00) color scheme
- ✅ Smooth animations and transitions
- ✅ Professional Material-UI components
- ✅ Responsive layout
- ✅ Clear typography
- ✅ Intuitive navigation

### Working Features:
- ✅ Landing page with scroll animations
- ✅ Phone + OTP authentication
- ✅ Role selection with 3 options
- ✅ Simplified onboarding
- ✅ Dashboard with stats
- ✅ Listing creation form
- ✅ Form validation
- ✅ Success/error notifications
- ✅ Navigation sidebar

---

## 🔑 DEMO CREDENTIALS

**Phone Number**: Any 10 digits (e.g., `9876543210`, `1234567890`, etc.)
**OTP Code**: `123456` (always works in demo mode)

---

## 📱 ALL AVAILABLE PAGES

### Public Pages:
- `/` - Landing page ✅
- `/login` - Login with OTP ✅
- `/about` - About FoodBridge ✅
- `/how-it-works` - How it works guide ✅

### After Login:
- `/role-selection` - Choose your role ✅
- `/onboarding/:role` - Complete profile ✅
- `/dashboard` - Your dashboard ✅
- `/create-listing` - Create food listing ✅
- `/discover` - Find food (coming soon)
- `/profile` - Your profile (coming soon)
- `/impact` - Impact dashboard (coming soon)

---

## 🐛 TROUBLESHOOTING

### If listing creation fails:
1. **Make sure you're logged in**: Go through the complete login flow
2. **Check browser console**: Press F12 and look for errors
3. **Try logging in again**: Sometimes the session expires
4. **Refresh the page**: Press Ctrl+Shift+R

### If page doesn't load:
1. **Check URL**: Make sure it's http://localhost:3001/ (not 3000 or 3002)
2. **Clear cache**: Press Ctrl+Shift+R
3. **Wait a moment**: First load might take a few seconds
4. **Check servers**: Both frontend and backend should be running

### If you see "Unauthorized" error:
1. **Login again**: Go to http://localhost:3001/login
2. **Complete onboarding**: Make sure you completed the profile setup
3. **Check token**: The session might have expired

---

## 💡 TIPS & TRICKS

### Navigation:
- After login, use the sidebar to navigate
- Click on "FoodBridge" logo to go to dashboard
- Use browser back button to go back

### Forms:
- All required fields are marked with *
- Form validates before submission
- Error messages appear as red toasts
- Success messages appear as green toasts

### Animations:
- Stats counter animates when you scroll to it
- Cards have hover effects
- Smooth page transitions
- Loading states on buttons

---

## 🎯 WHAT'S WORKING VS COMING SOON

### ✅ Fully Working:
- Landing page with animations
- Login/OTP authentication
- Role selection
- Onboarding flow
- Dashboard view
- Listing creation
- Navigation
- Form validation
- Notifications

### 🚧 Coming Soon:
- Photo upload for listings
- Multi-step listing wizard
- Discovery page with map
- Claim functionality
- Real-time tracking
- Ratings & reviews
- Impact dashboard
- Admin panel

---

## 📊 BACKEND API ENDPOINTS

All endpoints are at: http://localhost:3005/api/v1

### Authentication:
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP & login
- `POST /auth/complete-onboarding` - Complete profile
- `GET /auth/me` - Get current user

### Listings:
- `GET /listings` - Get all listings
- `POST /listings` - Create listing (requires auth)

### Health:
- `GET /health` - Server health check

---

## 🔍 TESTING CHECKLIST

Use this checklist to test all features:

- [ ] Landing page loads
- [ ] Stats counter animates on scroll
- [ ] "Get Started" button works
- [ ] Login page loads
- [ ] Can enter phone number
- [ ] OTP is sent (always 123456)
- [ ] OTP verification works
- [ ] Role selection page shows
- [ ] Can select a role
- [ ] Onboarding page loads
- [ ] Can enter name
- [ ] Profile is created
- [ ] Dashboard loads with stats
- [ ] Sidebar navigation works
- [ ] Create listing page loads
- [ ] Can fill listing form
- [ ] Form validation works
- [ ] Listing is created successfully
- [ ] Success message appears
- [ ] Redirected to dashboard

---

## 🎉 SUCCESS CRITERIA

You've successfully tested FoodBridge when:

1. ✅ You can see the landing page
2. ✅ You can login with OTP
3. ✅ You can select a role
4. ✅ You can complete onboarding
5. ✅ You can see your dashboard
6. ✅ You can create a listing
7. ✅ You see success notifications

---

## 📝 NOTES

- **Mock Server**: All data is in memory and resets on server restart
- **Demo Mode**: OTP is always "123456" for easy testing
- **No Database**: Using mock server, no PostgreSQL needed
- **No Redis**: Session stored in memory
- **Simplified**: Some features are simplified for demo

---

## 🚀 NEXT DEVELOPMENT STEPS

To continue building:

1. **Enhance Listing Creation**:
   - Add photo upload
   - Multi-step wizard
   - AI prediction display

2. **Build Discovery Page**:
   - Map view with pins
   - List view with filters
   - Search functionality

3. **Add Claim Flow**:
   - Claim button
   - Claim management
   - Pickup coordination

4. **Implement Real-time**:
   - Socket.IO integration
   - Live updates
   - Notifications

---

**Happy Testing!** 🎊

**Main URL**: http://localhost:3001/

Start with the landing page and follow the complete flow above!
