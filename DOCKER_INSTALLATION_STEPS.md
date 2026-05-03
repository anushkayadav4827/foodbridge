# Docker Desktop Installation Guide

## Step-by-Step Instructions

### Step 1: Download Docker Desktop (2 minutes)

1. **Open your web browser**
2. **Go to**: https://www.docker.com/products/docker-desktop/
3. **Click**: "Download for Windows" button
4. **File will download**: `Docker Desktop Installer.exe` (~500MB)
5. **Wait for download to complete**

---

### Step 2: Install Docker Desktop (5 minutes)

1. **Locate the downloaded file**: `Docker Desktop Installer.exe`
2. **Double-click** to run the installer
3. **User Account Control**: Click "Yes" to allow changes

4. **Installation Options**:
   - ✅ **Check**: "Use WSL 2 instead of Hyper-V" (recommended)
   - ✅ **Check**: "Add shortcut to desktop"
   - Click "OK"

5. **Installation Progress**:
   - Wait for files to be extracted and installed
   - This takes about 3-5 minutes

6. **Installation Complete**:
   - Click "Close and restart" (or "Close" if restart not required)
   - **Important**: If prompted to restart, do it now

---

### Step 3: Start Docker Desktop (2 minutes)

1. **After restart**, Docker Desktop should start automatically
   - If not, find "Docker Desktop" in Start Menu and open it

2. **First Launch**:
   - Docker Desktop will initialize (takes 1-2 minutes)
   - You'll see a whale icon in the system tray (bottom-right)
   - Wait until the icon stops animating and shows "Docker Desktop is running"

3. **Accept Terms** (if prompted):
   - Read and accept the Docker Subscription Service Agreement
   - Click "Accept"

4. **Skip Tutorial** (optional):
   - You can skip the tutorial or complete it
   - Click "Skip tutorial" to proceed faster

5. **Verify Docker is Running**:
   - Look for the whale icon in system tray
   - Icon should be steady (not animating)
   - Hover over it - should say "Docker Desktop is running"

---

### Step 4: Verify Docker Installation (1 minute)

1. **Open PowerShell**:
   - Press `Windows + X`
   - Select "Windows PowerShell" or "Terminal"

2. **Run this command**:
   ```powershell
   docker --version
   ```

3. **Expected Output**:
   ```
   Docker version 24.x.x, build xxxxxxx
   ```

4. **Test Docker**:
   ```powershell
   docker run hello-world
   ```

5. **Expected Output**:
   ```
   Hello from Docker!
   This message shows that your installation appears to be working correctly.
   ...
   ```

✅ **If you see this, Docker is installed correctly!**

---

### Step 5: Set Up PostgreSQL with Docker (2 minutes)

Now that Docker is installed, let's set up PostgreSQL:

**Option A: Using the Batch Script** (Easiest):
1. **Navigate to your project folder** in File Explorer
2. **Double-click**: `start-postgres-docker.bat`
3. **Wait** for the script to complete (about 15 seconds)
4. **Done!** PostgreSQL is now running

**Option B: Using PowerShell** (Manual):
1. **Open PowerShell** in your project directory
2. **Run this command**:
   ```powershell
   docker run --name foodbridge-postgres `
     -e POSTGRES_DB=foodbridge `
     -e POSTGRES_USER=postgres `
     -e POSTGRES_PASSWORD=password `
     -p 5432:5432 `
     -v foodbridge-data:/var/lib/postgresql/data `
     -d postgis/postgis:15-3.3
   ```
3. **Wait** for the image to download (first time only, ~200MB)
4. **Verify** it's running:
   ```powershell
   docker ps
   ```

---

### Step 6: Apply Database Migrations (1 minute)

1. **Open PowerShell** in your project directory
2. **Navigate to backend**:
   ```powershell
   cd backend
   ```
3. **Run migration test**:
   ```powershell
   node test-migration.js
   ```

4. **Expected Output**:
   ```
   🔍 Testing database connection...
   ✅ Database connected: 2026-05-01...
   ✅ Initial schema exists: users, food_listings, claims
   🚀 Running donor dashboard listing system migration...
   ✅ Migration executed successfully
   ✅ donor_stats table columns: 11
   ✅ listing_drafts table columns: 6
   ✅ Functions created: 4
   ✅ Views created: 2
   ✅ Triggers created: 4
   ✅ Migration test completed successfully!
   ```

✅ **If you see this, your database is set up correctly!**

---

## Troubleshooting

### Issue: "Docker Desktop requires Windows 10/11"

**Solution**: 
- Check your Windows version: Press `Windows + R`, type `winver`, press Enter
- You need Windows 10 version 1903 or higher, or Windows 11
- If older, consider Option B (Direct PostgreSQL installation)

### Issue: "WSL 2 installation is incomplete"

**Solution**:
1. Open PowerShell as Administrator
2. Run: `wsl --install`
3. Restart your computer
4. Start Docker Desktop again

### Issue: "Virtualization is not enabled"

**Solution**:
1. Restart computer and enter BIOS (usually F2, F10, or Del key during startup)
2. Find "Virtualization Technology" or "Intel VT-x" or "AMD-V"
3. Enable it
4. Save and exit BIOS
5. Start Docker Desktop again

### Issue: "Docker Desktop won't start"

**Solution**:
1. Open Task Manager (Ctrl + Shift + Esc)
2. End any "Docker" processes
3. Restart Docker Desktop
4. If still fails, restart your computer

### Issue: "Port 5432 already in use"

**Solution**:
```powershell
# Check what's using port 5432
netstat -ano | findstr :5432

# If you see a process, you can either:
# 1. Stop that process
# 2. Or use a different port for PostgreSQL
```

---

## Quick Commands Reference

### Docker Commands:
```powershell
# Check Docker version
docker --version

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Start PostgreSQL container
docker start foodbridge-postgres

# Stop PostgreSQL container
docker stop foodbridge-postgres

# View PostgreSQL logs
docker logs foodbridge-postgres

# Access PostgreSQL shell
docker exec -it foodbridge-postgres psql -U postgres -d foodbridge

# Remove container (to start fresh)
docker stop foodbridge-postgres
docker rm foodbridge-postgres
docker volume rm foodbridge-data
```

### PostgreSQL Commands (inside container):
```sql
-- List all tables
\dt

-- List all functions
\df

-- List all views
\dv

-- Check donor_stats table
SELECT * FROM donor_stats LIMIT 5;

-- Check listing_drafts table
SELECT * FROM listing_drafts LIMIT 5;

-- Exit
\q
```

---

## What's Next?

After successful installation:

1. ✅ Docker Desktop installed and running
2. ✅ PostgreSQL container created and running
3. ✅ Database migrations applied
4. ✅ Tables, functions, views, and triggers created

**You're now ready to**:
- Continue with Task 4: Listing Service implementation
- Test the full system with real database
- Build out the remaining 17 tasks

---

## Need Help?

If you encounter any issues:
1. Check the Troubleshooting section above
2. Check Docker Desktop logs (Settings → Troubleshoot → View logs)
3. Restart Docker Desktop
4. Restart your computer
5. Ask for help with specific error messages

---

**Estimated Total Time**: 15 minutes
- Download: 2 min
- Install: 5 min
- Start: 2 min
- Verify: 1 min
- Setup PostgreSQL: 2 min
- Apply Migrations: 1 min
- Buffer: 2 min

**Let's get started! Follow Step 1 above.**
