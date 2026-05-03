# Docker & PostgreSQL Installation Checklist

Use this checklist to track your progress through the installation.

---

## 📋 Pre-Installation Checklist

- [ ] Windows 10 (version 1903+) or Windows 11
- [ ] At least 4GB RAM available
- [ ] At least 5GB free disk space
- [ ] Administrator access to your computer
- [ ] Internet connection (for downloads)

---

## 🚀 Installation Steps

### Phase 1: Download Docker Desktop (2 minutes)

- [ ] Open browser
- [ ] Go to: https://www.docker.com/products/docker-desktop/
- [ ] Click "Download for Windows"
- [ ] Wait for `Docker Desktop Installer.exe` to download (~500MB)
- [ ] Download complete

**Status**: ⏳ In Progress / ✅ Complete

---

### Phase 2: Install Docker Desktop (5 minutes)

- [ ] Run `Docker Desktop Installer.exe`
- [ ] Click "Yes" on User Account Control prompt
- [ ] Check "Use WSL 2 instead of Hyper-V"
- [ ] Check "Add shortcut to desktop"
- [ ] Click "OK" to start installation
- [ ] Wait for installation to complete
- [ ] Click "Close and restart" (if prompted)
- [ ] Computer restarted (if required)

**Status**: ⏳ In Progress / ✅ Complete

---

### Phase 3: Start Docker Desktop (2 minutes)

- [ ] Docker Desktop started automatically (or start from Start Menu)
- [ ] Accept Docker Subscription Service Agreement
- [ ] Skip tutorial (or complete it)
- [ ] Whale icon visible in system tray
- [ ] Whale icon steady (not animating)
- [ ] Hover shows "Docker Desktop is running"

**Status**: ⏳ In Progress / ✅ Complete

---

### Phase 4: Verify Docker (1 minute)

- [ ] Open PowerShell
- [ ] Run: `docker --version`
- [ ] See output: `Docker version 24.x.x...`
- [ ] Run: `docker run hello-world`
- [ ] See output: `Hello from Docker!`

**Status**: ⏳ In Progress / ✅ Complete

---

### Phase 5: Set Up PostgreSQL (2 minutes)

**Choose one method**:

**Method A: Batch Script** (Recommended)
- [ ] Navigate to project folder in File Explorer
- [ ] Double-click `start-postgres-docker.bat`
- [ ] Wait for script to complete
- [ ] See "PostgreSQL is running!" message

**Method B: PowerShell Command**
- [ ] Open PowerShell in project directory
- [ ] Copy and run the docker run command
- [ ] Wait for image to download (~200MB, first time only)
- [ ] Run: `docker ps`
- [ ] See `foodbridge-postgres` in the list

**Status**: ⏳ In Progress / ✅ Complete

---

### Phase 6: Apply Migrations (1 minute)

- [ ] Open PowerShell in project directory
- [ ] Run: `cd backend`
- [ ] Run: `node test-migration.js`
- [ ] See: "✅ Database connected"
- [ ] See: "✅ Migration executed successfully"
- [ ] See: "✅ donor_stats table columns: 11"
- [ ] See: "✅ listing_drafts table columns: 6"
- [ ] See: "✅ Functions created: 4"
- [ ] See: "✅ Views created: 2"
- [ ] See: "✅ Triggers created: 4"
- [ ] See: "✅ Migration test completed successfully!"

**Status**: ⏳ In Progress / ✅ Complete

---

### Phase 7: Final Verification (1 minute)

- [ ] Run: `docker ps`
- [ ] See `foodbridge-postgres` with status "Up"
- [ ] Run: `docker exec -it foodbridge-postgres psql -U postgres -d foodbridge -c "\dt"`
- [ ] See list of tables including `donor_stats` and `listing_drafts`

**Status**: ⏳ In Progress / ✅ Complete

---

## ✅ Installation Complete!

If all checkboxes above are checked, congratulations! You have successfully:

- ✅ Installed Docker Desktop
- ✅ Set up PostgreSQL with PostGIS
- ✅ Applied all database migrations
- ✅ Created all tables, functions, views, and triggers
- ✅ Verified everything is working

---

## 🎯 What's Next?

Now that your database is set up, you can:

1. **Continue Implementation**: Move to Task 4 (Listing Service)
2. **Test the System**: Create test listings and claims
3. **Develop Features**: Build out the remaining 17 tasks

---

## 📝 Quick Reference

### Start PostgreSQL:
```powershell
docker start foodbridge-postgres
```

### Stop PostgreSQL:
```powershell
docker stop foodbridge-postgres
```

### View Logs:
```powershell
docker logs foodbridge-postgres
```

### Access Database:
```powershell
docker exec -it foodbridge-postgres psql -U postgres -d foodbridge
```

### Connection Details:
- **Host**: localhost
- **Port**: 5432
- **Database**: foodbridge
- **User**: postgres
- **Password**: password

---

## 🆘 Troubleshooting

If you encounter issues, check:

1. **Docker not starting**: 
   - Restart Docker Desktop
   - Restart computer
   - Check Windows version (need 10 v1903+ or 11)

2. **WSL 2 error**:
   - Run: `wsl --install` in PowerShell (as Admin)
   - Restart computer

3. **Virtualization error**:
   - Enable in BIOS (VT-x for Intel, AMD-V for AMD)

4. **Port 5432 in use**:
   - Check: `netstat -ano | findstr :5432`
   - Stop conflicting service

5. **Migration fails**:
   - Check PostgreSQL is running: `docker ps`
   - Check .env file has correct credentials
   - Try again: `node test-migration.js`

---

## 📊 Time Tracking

| Phase | Estimated | Actual | Status |
|-------|-----------|--------|--------|
| Download | 2 min | ___ min | ⏳ / ✅ |
| Install | 5 min | ___ min | ⏳ / ✅ |
| Start | 2 min | ___ min | ⏳ / ✅ |
| Verify | 1 min | ___ min | ⏳ / ✅ |
| PostgreSQL | 2 min | ___ min | ⏳ / ✅ |
| Migrations | 1 min | ___ min | ⏳ / ✅ |
| Verification | 1 min | ___ min | ⏳ / ✅ |
| **Total** | **15 min** | **___ min** | ⏳ / ✅ |

---

**Start Time**: ___:___  
**End Time**: ___:___  
**Total Duration**: ___ minutes

---

**Good luck with the installation! 🚀**
