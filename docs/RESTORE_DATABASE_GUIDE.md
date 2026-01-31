# Database Restore Guide

## Problem

The backup.sql file has a syntax error in the `_prisma_migrations` table data that prevents it from running in pgAdmin.

## Solution: Two-Step Restore Process

### Step 1: Create Schema with Prisma Migrations

First, create the database schema using Prisma:

```powershell
# Make sure your DATABASE_URL in .env points to your new database
# Example: DATABASE_URL="postgresql://username:password@localhost:5432/newdatabase"

# Run Prisma migrations to create all tables
npx prisma migrate deploy

# OR if in development:
npx prisma migrate dev
```

This will create all the tables, relationships, and constraints based on your Prisma schema.

### Step 2: Import Data Only

Now you need to extract and import only the data rows from backup.sql. Since the file has formatting issues with the COPY commands, here are your options:

#### Option A: Use pg_restore with Custom Format (Recommended)

If you have the original database, export it properly:

```bash
pg_dump -Fc -d your_old_database -U username -f backup.dump
pg_restore -d your_new_database -U username backup.dump
```

#### Option B: Manual Data Import (If you only have backup.sql)

1. **Fix the backup.sql file manually in pgAdmin:**

   - Open backup.sql in a text editor
   - Find the section starting with `COPY public._prisma_migrations`
   - Comment it out (already done in your current file)
   - For other COPY commands, ensure data rows are tab-separated

2. **Run in pgAdmin after Prisma migrations:**

   ```sql
   -- Only run the COPY commands, skip all CREATE TABLE statements
   -- Start from line where it says "Data for Name: applications"
   ```

3. **Or create individual INSERT statements:**
   Instead of COPY commands, convert to INSERT statements which are more reliable.

#### Option C: Use a Script to Clean the Backup

Create a clean version that works:

```powershell
# Extract only data insertions, skip schema creation
node extract_data.js
```

## Quick Fix for Current backup.sql

Your current backup.sql has been fixed to comment out the problematic `_prisma_migrations` section. To use it:

1. Run Prisma migrations first:

   ```powershell
   npx prisma migrate deploy
   ```

2. Create a modified SQL file with only data:

   - Comment out all CREATE TABLE, CREATE TYPE, ALTER TABLE statements
   - Keep only COPY commands and their data
   - Start from line ~260 where data sections begin

3. Run the modified file in pgAdmin

## Alternative: Fresh Start with Current Data Export

If the old backup is too problematic:

1. Create fresh schema: `npx prisma migrate deploy`
2. Manually export critical data from old DB as CSV files
3. Import CSVs using pgAdmin's Import tool or COPY commands
4. This ensures clean, properly formatted data

## Recommended Approach

**For Future Backups:**

```bash
# Use custom format which is more reliable
pg_dump -Fc -d database_name -U username -f backup_$(date +%Y%m%d).dump

# To restore:
pg_restore -d new_database -U username backup_20250722.dump
```

This avoids SQL formatting issues entirely.
