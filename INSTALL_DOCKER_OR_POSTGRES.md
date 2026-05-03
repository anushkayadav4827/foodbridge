# PostgreSQL Setup - Choose Your Method

Docker is not currently installed on your system. You have two options:

---

## Option A: Install Docker Desktop (Recommended) ⭐

### Why Docker?
- ✅ Easiest setup (one command)
- ✅ Isolated environment
- ✅ Easy to start/stop/reset
- ✅ Same setup for all developers
- ✅ No conflicts with other software

### Installation Steps:

1. **Download Docker Desktop for Windows**:
   - Go to: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - File size: ~500MB

2. **Install Docker Desktop**:
   - Run the installer
   - Enable WSL 2 if prompted (recommended)
   - Restart your computer if required

3. **Start Docker Desktop**:
   - Open Docker Desktop from Start Menu
   - Wait for it to start (green icon in system tray)

4. **Run PostgreSQL Setup**:
   ```bash
   # Double-click this file:
   start-postgres-docker.bat
   
   # Or run manually:
   docker run --name foodbridge-postgres ^
     -e POSTGRES_DB=foodbridge ^
     -e POSTGRES_USER=postgres ^
     -e POSTGRES_PASSWORD=password ^
     -p 5432:5432 ^
     -v foodbridge-data:/var/lib/postgresql/data ^
     -d postgis/postgis:15-3.3
   ```

5. **Apply Migrations**:
   ```bash
   cd backend
   node test-migration.js
   ```

**Time Required**: ~15 minutes (including download)

---

## Option B: Install PostgreSQL Directly (Alternative)

### Why Direct Installation?
- ✅ No Docker required
- ✅ Native Windows service
- ✅ Familiar database management tools (pgAdmin)
- ✅ Lighter on system resources

### Installation Steps:

1. **Download PostgreSQL 15**:
   - Go to: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Select PostgreSQL 15.x for Windows x86-64
   - File size: ~250MB

2. **Run the Installer**:
   - Double-click the downloaded .exe file
   - Click "Next" through the welcome screens
   
3. **Installation Options**:
   - **Installation Directory**: Default (C:\Program Files\PostgreSQL\15)
   - **Components**: Select all (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
   - **Data Directory**: Default
   - **Password**: Enter a password (e.g., `password`) - **REMEMBER THIS!**
   - **Port**: 5432 (default)
   - **Locale**: Default

4. **Install PostGIS Extension**:
   - At the end of installation, Stack Builder will launch
   - Select "PostgreSQL 15 on port 5432"
   - Expand "Spatial Extensions"
   - Select "PostGIS 3.3 for PostgreSQL 15"
   - Click "Next" and install

5. **Create FoodBridge Database**:
   
   **Method 1: Using pgAdmin (GUI)**:
   - Open pgAdmin 4 from Start Menu
   - Enter your master password (if prompted)
   - Expand "Servers" → "PostgreSQL 15"
   - Right-click "Databases" → "Create" → "Database"
   - Name: `foodbridge`
   - Owner: `postgres`
   - Click "Save"
   
   **Method 2: Using Command Line**:
   ```bash
   # Open PowerShell as Administrator
   cd "C:\Program Files\PostgreSQL\15\bin"
   
   # Create database
   .\createdb.exe -U postgres foodbridge
   
   # Connect and enable PostGIS
   .\psql.exe -U postgres -d foodbridge
   ```
   
   Then in the psql prompt:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   \q
   ```

6. **Update .env File**:
   Open `backend/.env` and update:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=foodbridge
   DB_USER=postgres
   DB_PASSWORD=your_password_here  # Use the password you set during installation
   ```

7. **Apply Migrations**:
   ```bash
   cd backend
   node test-migration.js
   ```

**Time Required**: ~20 minutes (including download)

---

## Quick Comparison

| Feature | Docker | Direct Install |
|---------|--------|----------------|
| Setup Time | 15 min | 20 min |
| Disk Space | ~2GB | ~500MB |
| Ease of Use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Start/Stop | One command | Windows Service |
| Reset Database | Easy (delete container) | Manual |
| GUI Tools | Need separate install | Included (pgAdmin) |
| Production-like | Yes | Yes |

---

## My Recommendation

**For Development**: Use **Docker** (Option A)
- Easier to manage
- Can easily reset/recreate
- Same setup as production
- No conflicts with other projects

**If Docker Issues**: Use **Direct Install** (Option B)
- More traditional approach
- Includes pgAdmin for visual management
- Runs as Windows service

---

## After Installation

Once PostgreSQL is running (either method), run these commands:

```bash
# Test connection
cd backend
node test-migration.js

# Expected output:
# ✅ Database connected
# ✅ Migration executed successfully
# ✅ donor_stats table columns: 11
# ✅ listing_drafts table columns: 6
# ...
```

---

## Troubleshooting

### Issue: "Port 5432 already in use"

**Solution**:
```bash
# Check what's using port 5432
netstat -ano | findstr :5432

# If PostgreSQL is already running, you can use it!
# Just run the migration:
cd backend
node test-migration.js
```

### Issue: "Password authentication failed"

**Solution**:
- Check your `.env` file has the correct password
- For Docker: default password is `password`
- For Direct Install: use the password you set during installation

### Issue: "PostGIS extension not found"

**Solution**:
```bash
# Connect to database
psql -U postgres -d foodbridge

# Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

---

## Next Steps

After PostgreSQL is set up:

1. ✅ Run migrations: `cd backend && node test-migration.js`
2. ✅ Verify tables: Check that donor_stats and listing_drafts exist
3. ✅ Continue implementation: Move to Task 4 (Listing Service)

---

## Need Help?

**Docker Installation Issues**:
- Check system requirements: Windows 10/11 64-bit
- Enable virtualization in BIOS
- Install WSL 2: `wsl --install`

**PostgreSQL Installation Issues**:
- Run installer as Administrator
- Disable antivirus temporarily
- Check Windows Firewall settings

**Migration Issues**:
- Ensure PostgreSQL is running
- Check .env file credentials
- Verify port 5432 is accessible

---

**Choose your method and let me know when you're ready to proceed!**
