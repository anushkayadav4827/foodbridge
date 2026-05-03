# PostgreSQL Setup Guide for FoodBridge

This guide will help you set up PostgreSQL with PostGIS for the FoodBridge donor dashboard listing system.

---

## Option 1: Docker (Recommended) ⭐

### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop/))

### Steps

1. **Pull and run PostgreSQL with PostGIS**:
```bash
docker run --name foodbridge-postgres \
  -e POSTGRES_DB=foodbridge \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -v foodbridge-data:/var/lib/postgresql/data \
  -d postgis/postgis:15-3.3
```

2. **Verify it's running**:
```bash
docker ps
```

You should see `foodbridge-postgres` in the list.

3. **Test connection**:
```bash
docker exec -it foodbridge-postgres psql -U postgres -d foodbridge -c "SELECT version();"
```

4. **Apply migrations**:
```bash
cd backend
node test-migration.js
```

### Docker Commands

**Start container**:
```bash
docker start foodbridge-postgres
```

**Stop container**:
```bash
docker stop foodbridge-postgres
```

**View logs**:
```bash
docker logs foodbridge-postgres
```

**Access PostgreSQL shell**:
```bash
docker exec -it foodbridge-postgres psql -U postgres -d foodbridge
```

**Remove container** (if you want to start fresh):
```bash
docker stop foodbridge-postgres
docker rm foodbridge-postgres
docker volume rm foodbridge-data
```

---

## Option 2: Windows Installation

### Prerequisites
- Windows 10/11

### Steps

1. **Download PostgreSQL**:
   - Go to: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15.x installer
   - Run the installer

2. **Installation Options**:
   - Port: `5432` (default)
   - Password: Set a password (e.g., `password`)
   - Locale: Default
   - Components: Select PostgreSQL Server, pgAdmin, Command Line Tools

3. **Install PostGIS**:
   - During installation, select "Stack Builder"
   - Or download from: https://postgis.net/windows_downloads/
   - Install PostGIS 3.3 for PostgreSQL 15

4. **Create Database**:
   Open Command Prompt or PowerShell:
   ```bash
   # Add PostgreSQL to PATH (if not already)
   $env:PATH += ";C:\Program Files\PostgreSQL\15\bin"
   
   # Create database
   createdb -U postgres foodbridge
   
   # Enable PostGIS
   psql -U postgres -d foodbridge -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   ```

5. **Update .env file**:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=foodbridge
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   ```

6. **Apply migrations**:
   ```bash
   cd backend
   node test-migration.js
   ```

---

## Option 3: WSL2 + PostgreSQL (Advanced)

### Prerequisites
- WSL2 installed on Windows
- Ubuntu or Debian distribution

### Steps

1. **Install PostgreSQL in WSL**:
```bash
# Update packages
sudo apt update

# Install PostgreSQL and PostGIS
sudo apt install postgresql postgresql-contrib postgis

# Start PostgreSQL
sudo service postgresql start
```

2. **Configure PostgreSQL**:
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE foodbridge;
CREATE USER foodbridge WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE foodbridge TO foodbridge;

# Enable PostGIS
\c foodbridge
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

3. **Allow connections from Windows**:
```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf
# Change: listen_addresses = '*'

# Edit pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

# Restart PostgreSQL
sudo service postgresql restart
```

4. **Get WSL IP address**:
```bash
ip addr show eth0 | grep inet | awk '{print $2}' | cut -d/ -f1
```

5. **Update .env file** (use WSL IP):
```env
DB_HOST=172.x.x.x  # Your WSL IP
DB_PORT=5432
DB_NAME=foodbridge
DB_USER=foodbridge
DB_PASSWORD=password
```

6. **Apply migrations**:
```bash
cd backend
node test-migration.js
```

---

## Verification Steps

After setup, verify everything works:

### 1. Test Connection
```bash
cd backend
node test-migration.js
```

Expected output:
```
🔍 Testing database connection...
✅ Database connected: 2026-05-01...
✅ Initial schema exists: users, food_listings, claims
🚀 Running donor dashboard listing system migration...
✅ Migration executed successfully
...
✅ Migration test completed successfully!
```

### 2. Check Tables
```bash
# Using Docker
docker exec -it foodbridge-postgres psql -U postgres -d foodbridge

# Or using psql directly
psql -U postgres -d foodbridge
```

Then run:
```sql
-- List all tables
\dt

-- Check donor_stats table
SELECT * FROM donor_stats LIMIT 5;

-- Check listing_drafts table
SELECT * FROM listing_drafts LIMIT 5;

-- Check views
\dv

-- Check functions
\df
```

### 3. Test Photo Upload Directory
```bash
# Create upload directory
mkdir -p backend/uploads/photos

# Test write permissions
touch backend/uploads/photos/test.txt
rm backend/uploads/photos/test.txt
```

---

## Troubleshooting

### Issue: "Connection refused" error

**Solution**:
- Check if PostgreSQL is running: `docker ps` or `sudo service postgresql status`
- Check port 5432 is not in use: `netstat -an | findstr 5432`
- Verify .env file has correct credentials

### Issue: "PostGIS extension not found"

**Solution**:
```sql
-- Connect to database
psql -U postgres -d foodbridge

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue: "Permission denied" on uploads folder

**Solution**:
```bash
# Windows
icacls backend\uploads /grant Everyone:F /T

# Linux/WSL
chmod -R 777 backend/uploads
```

### Issue: Migration fails with "relation already exists"

**Solution**:
The migration is idempotent and uses `IF NOT EXISTS`. If you see this error, it means the migration was partially applied. You can:
1. Drop the database and recreate: `dropdb foodbridge && createdb foodbridge`
2. Or manually drop the conflicting tables and re-run

---

## Quick Start Script (Docker)

Save this as `start-postgres.bat` (Windows) or `start-postgres.sh` (Linux/Mac):

```bash
#!/bin/bash

echo "🚀 Starting PostgreSQL with PostGIS..."

# Check if container exists
if docker ps -a | grep -q foodbridge-postgres; then
  echo "📦 Container exists, starting..."
  docker start foodbridge-postgres
else
  echo "📦 Creating new container..."
  docker run --name foodbridge-postgres \
    -e POSTGRES_DB=foodbridge \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=password \
    -p 5432:5432 \
    -v foodbridge-data:/var/lib/postgresql/data \
    -d postgis/postgis:15-3.3
fi

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

echo "✅ PostgreSQL is running!"
echo "📝 Connection details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: foodbridge"
echo "   User: postgres"
echo "   Password: password"

echo ""
echo "🔧 Next steps:"
echo "   1. cd backend"
echo "   2. node test-migration.js"
echo "   3. npm run dev"
```

Make it executable:
```bash
chmod +x start-postgres.sh
./start-postgres.sh
```

---

## Next Steps

After PostgreSQL is set up:

1. ✅ Apply migrations: `cd backend && node test-migration.js`
2. ✅ Start backend: `npm run dev`
3. ✅ Test photo upload: Upload a test image
4. ✅ Continue with Task 4: Listing Service implementation

---

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)
- [PostGIS Docker Image](https://hub.docker.com/r/postgis/postgis)

---

**Recommended**: Use Docker (Option 1) for the easiest setup and consistent environment across development and production.
