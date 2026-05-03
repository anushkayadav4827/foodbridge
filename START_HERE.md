# 🚀 START HERE - Docker & PostgreSQL Setup

**Welcome!** Follow these simple steps to get your database running.

---

## ⚡ Quick Start (3 Steps)

### Step 1: Download Docker Desktop

**Click this link**: [Download Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)

Or copy and paste this URL into your browser:
```
https://www.docker.com/products/docker-desktop/
```

**What to do**:
1. Click the "Download for Windows" button
2. Wait for `Docker Desktop Installer.exe` to download (~500MB)
3. Come back here when download is complete

---

### Step 2: Install Docker Desktop

**What to do**:
1. Find the downloaded file: `Docker Desktop Installer.exe`
2. Double-click to run it
3. Click "Yes" when Windows asks for permission
4. Check these boxes:
   - ✅ Use WSL 2 instead of Hyper-V
   - ✅ Add shortcut to desktop
5. Click "OK" and wait (takes 3-5 minutes)
6. Restart computer if prompted
7. Start Docker Desktop from Start Menu
8. Wait for the whale icon in system tray to stop animating

---

### Step 3: Run Setup Scripts

**What to do**:
1. Open PowerShell in this project folder
2. Run these commands one by one:

```powershell
# Verify Docker is installed
docker --version

# Start PostgreSQL (this will download the image first time)
.\start-postgres-docker.bat

# Apply database migrations
cd backend
node test-migration.js
```

**Expected result**:
```
✅ Database connected
✅ Migration executed successfully
✅ donor_stats table columns: 11
✅ listing_drafts table columns: 6
✅ Functions created: 4
✅ Views created: 2
✅ Triggers created: 4
✅ Migration test completed successfully!
```

---

## ✅ That's It!

If you see the success messages above, you're done! Your database is ready.

---

## 📚 Detailed Guides (If You Need Help)

If you encounter any issues, check these detailed guides:

1. **DOCKER_INSTALLATION_STEPS.md** - Step-by-step Docker installation
2. **INSTALLATION_CHECKLIST.md** - Track your progress with checkboxes
3. **INSTALL_DOCKER_OR_POSTGRES.md** - Alternative installation methods
4. **SETUP_POSTGRESQL.md** - PostgreSQL setup details

---

## 🆘 Quick Troubleshooting

### "Docker command not found"
- Docker Desktop is not installed or not running
- Start Docker Desktop from Start Menu
- Wait for whale icon to appear in system tray

### "Port 5432 already in use"
- Another PostgreSQL is already running
- Run: `netstat -ano | findstr :5432` to find it
- Stop that service or use a different port

### "WSL 2 installation incomplete"
- Open PowerShell as Administrator
- Run: `wsl --install`
- Restart computer
- Start Docker Desktop again

### "Migration fails"
- Make sure Docker Desktop is running
- Make sure PostgreSQL container is running: `docker ps`
- Check .env file has correct password
- Try again: `cd backend && node test-migration.js`

---

## 🎯 What Happens Next?

After successful setup:

1. ✅ PostgreSQL is running in Docker
2. ✅ Database `foodbridge` is created
3. ✅ All tables, functions, views, and triggers are created
4. ✅ You can continue with Task 4: Listing Service

---

## 📞 Need More Help?

If you're stuck:
1. Check the detailed guides listed above
2. Look at the error message carefully
3. Search for the error online
4. Ask for help with the specific error message

---

## ⏱️ Time Estimate

- **Download**: 2-5 minutes (depends on internet speed)
- **Install**: 5 minutes
- **Setup**: 2 minutes
- **Total**: ~15 minutes

---

**Ready? Start with Step 1 above! 🚀**

---

## 🔗 Quick Links

- Docker Desktop: https://www.docker.com/products/docker-desktop/
- Docker Documentation: https://docs.docker.com/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- PostGIS Documentation: https://postgis.net/documentation/

---

**Good luck! You've got this! 💪**
