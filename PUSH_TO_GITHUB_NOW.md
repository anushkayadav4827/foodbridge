# 🚀 Push Code to GitHub - Step by Step

## ⚠️ Git Not Installed

Git is not installed on your system. You need to install it first.

---

## 📥 Step 1: Install Git (5 minutes)

### **Option A: Download and Install (Recommended)**

1. **Download Git**:
   - Go to: **https://git-scm.com/download/win**
   - Click **"64-bit Git for Windows Setup"**
   - Wait for download to complete

2. **Install Git**:
   - Double-click the downloaded file
   - Click **"Next"** through all steps (use default settings)
   - Click **"Install"**
   - Click **"Finish"**

3. **Verify Installation**:
   - Close and reopen your terminal
   - Run: `git --version`
   - You should see: `git version 2.x.x`

### **Option B: Use GitHub Desktop (Easier)**

1. **Download GitHub Desktop**:
   - Go to: **https://desktop.github.com/**
   - Click **"Download for Windows"**
   - Install the application

2. **Sign in**:
   - Open GitHub Desktop
   - Sign in with your GitHub account

3. **Add Repository**:
   - Click **"Add"** → **"Add Existing Repository"**
   - Browse to: `C:\Users\Asus\OneDrive\Desktop\wastenot`
   - Click **"Add Repository"**

4. **Publish to GitHub**:
   - Click **"Publish repository"**
   - Name: `foodbridge`
   - Uncheck **"Keep this code private"** (or keep it checked if you want it private)
   - Click **"Publish repository"**

**✅ Done! Your code is on GitHub!**

---

## 💻 Step 2: Push Code Using Command Line

After installing Git (Option A above), run these commands:

### **2.1: Configure Git (First Time Only)**

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Replace with your actual name and email.

### **2.2: Initialize and Push**

```bash
# Navigate to your project
cd C:\Users\Asus\OneDrive\Desktop\wastenot

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Add remote
git remote add origin https://github.com/anushkayadav5403/foodbridge.git

# Push to GitHub
git push -u origin main
```

**If you get an error about "main" branch**, try:
```bash
git branch -M main
git push -u origin main
```

**If you get authentication error**, you'll need to:
1. Go to: https://github.com/settings/tokens
2. Generate a personal access token
3. Use the token as your password when pushing

---

## 🎯 Step 3: Verify Code is on GitHub

1. Go to: **https://github.com/anushkayadav5403/foodbridge**
2. You should see all your files
3. Check that `backend/` and `web/` folders are there

**✅ Code is on GitHub!**

---

## 🚀 Step 4: Continue with Render Deployment

Now that your code is on GitHub, continue with backend deployment:

1. Go to: **https://render.com/**
2. Sign up with GitHub
3. Follow the steps in `✅_COMPLETE_DEPLOYMENT_GUIDE.md`

---

## 🐛 Troubleshooting

### **Issue: "git: command not found"**

**Solution**: Git is not installed or not in PATH
- Install Git from: https://git-scm.com/download/win
- Close and reopen terminal
- Try again

---

### **Issue: "Permission denied" or "Authentication failed"**

**Solution**: You need to authenticate with GitHub

**Option 1: Use Personal Access Token**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "FoodBridge Deployment"
4. Check: `repo` (all repo permissions)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. When pushing, use the token as your password

**Option 2: Use GitHub Desktop**
- Download from: https://desktop.github.com/
- Sign in with your GitHub account
- Use the GUI to publish your repository

---

### **Issue: "Repository already exists"**

**Solution**: The repository already exists on GitHub

If the repository is empty:
```bash
git remote add origin https://github.com/anushkayadav5403/foodbridge.git
git push -u origin main
```

If the repository has files:
```bash
git remote add origin https://github.com/anushkayadav5403/foodbridge.git
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 📋 Quick Commands Reference

```bash
# Install Git (download from website first)
# https://git-scm.com/download/win

# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Initialize and push
cd C:\Users\Asus\OneDrive\Desktop\wastenot
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/anushkayadav5403/foodbridge.git
git push -u origin main
```

---

## ✅ Summary

**What you need to do**:

1. ✅ Install Git: https://git-scm.com/download/win
   OR use GitHub Desktop: https://desktop.github.com/

2. ✅ Push code to GitHub (use commands above)

3. ✅ Verify code is on GitHub: https://github.com/anushkayadav5403/foodbridge

4. ✅ Continue with Render deployment: See `✅_COMPLETE_DEPLOYMENT_GUIDE.md`

---

**Recommended**: Use **GitHub Desktop** (easier for beginners)

Download: https://desktop.github.com/

---

**Need help? Let me know which option you choose!** 🚀
