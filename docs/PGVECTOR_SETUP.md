# PGVector Extension Setup Guide

## Overview

The `pgvector` extension is required for semantic matching using vector embeddings in the recruitment system. This guide will help you install it on your PostgreSQL database.

## Installation Options

### Option 1: Local PostgreSQL (Windows)

#### Using Pre-built Binaries

1. **Download pgvector for Windows:**
   - Visit: https://github.com/pgvector/pgvector/releases
   - Download the latest Windows release (e.g., `pgvector-v0.7.4-windows-x64.zip`)

2. **Extract and Install:**

   ```powershell
   # Extract the downloaded zip file
   # Copy the files to your PostgreSQL installation directory:
   # - Copy vector.dll to: C:\Program Files\PostgreSQL\17\lib\
   # - Copy vector.control and vector--*.sql to: C:\Program Files\PostgreSQL\17\share\extension\
   ```

3. **Restart PostgreSQL Service:**

   ```powershell
   # Restart the PostgreSQL service
   Restart-Service postgresql-x64-17
   ```

4. **Enable the Extension:**

   ```sql
   -- Connect to your database
   psql -U postgres -d fyp

   -- Create the extension
   CREATE EXTENSION IF NOT EXISTS vector;

   -- Verify installation
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

#### Building from Source (Advanced)

If pre-built binaries don't work:

```bash
# Install Visual Studio Build Tools
# Then in Visual Studio Command Prompt:
git clone https://github.com/pgvector/pgvector.git
cd pgvector
nmake /F Makefile.win
nmake /F Makefile.win install
```

### Option 2: Using Neon (Cloud PostgreSQL) - RECOMMENDED

If you're using Neon.tech for PostgreSQL:

1. **Neon has pgvector pre-installed!** No installation needed.

2. **Just enable it in your database:**

   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Update your DATABASE_URL in `.env`:**
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/fyp?sslmode=require"
   ```

### Option 3: Docker PostgreSQL with pgvector

```bash
# Use the official pgvector Docker image
docker run -d \
  --name postgres-pgvector \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=fyp \
  -p 5432:5432 \
  ankane/pgvector
```

Then apply migrations:

```bash
npx prisma migrate deploy
```

## Verification Steps

After installation, verify the extension is available:

```sql
-- Connect to your database
psql -U postgres -d fyp

-- Check if vector extension exists
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- Enable the extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Test vector operations
SELECT '[1,2,3]'::vector;
```

## Apply Prisma Migration

Once pgvector is installed and enabled:

```bash
# Apply the pending migration
npx prisma migrate deploy

# Or reset and apply all migrations
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

## Troubleshooting

### Error: "extension 'vector' is not available"

**Solution 1:** Use Neon.tech cloud database (easiest option)

- Sign up at: https://neon.tech
- Create a new project
- Copy the connection string
- Update your `.env` file

**Solution 2:** Install pgvector on local PostgreSQL

- Follow the installation steps above
- Make sure files are in the correct directories
- Restart PostgreSQL service

### Error: "Could not open extension control file"

This means pgvector files are not in the correct location.

**Fix:**

```powershell
# Verify PostgreSQL version
psql --version

# Check if files exist
Test-Path "C:\Program Files\PostgreSQL\17\share\extension\vector.control"
Test-Path "C:\Program Files\PostgreSQL\17\lib\vector.dll"

# If missing, copy files from the pgvector release
```

### Temporary Workaround: Skip Vector Fields

If you need to proceed without pgvector temporarily:

1. **Comment out vector fields in `schema.prisma`:**

```prisma
model Candidate {
  // embedding  Unsupported("vector(1536)")?  // Temporarily disabled
}

model Job {
  // embedding  Unsupported("vector(1536)")?  // Temporarily disabled
}

model Resume {
  // embedding  Unsupported("vector(1536)")?  // Temporarily disabled
}
```

2. **Remove pgvector extension from datasource:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // extensions = [vector]  // Temporarily disabled
}
```

3. **Create new migration:**

```bash
npx prisma migrate dev --name remove-vector-temp
```

## Why Vector Embeddings?

Vector embeddings enable:

- **Semantic Job Matching**: Match candidates to jobs based on meaning, not just keywords
- **Intelligent Search**: Find similar candidates or jobs using AI-powered similarity
- **Better Recommendations**: Suggest relevant jobs to candidates based on their profile
- **Improved Scoring**: More accurate AI-powered resume-job compatibility scores

## Vector Dimensions

We use **1536 dimensions** because:

- OpenAI's `text-embedding-3-small` produces 1536-dimensional vectors
- This is the FastAPI backend's embedding model output size
- Provides good balance between accuracy and performance

## Next Steps

After installing pgvector:

1. Apply the migration: `npx prisma migrate deploy`
2. Generate Prisma Client: `npx prisma generate`
3. Update your FastAPI backend to generate embeddings
4. Implement semantic search endpoints
5. Update UI to show similarity scores

## Resources

- pgvector GitHub: https://github.com/pgvector/pgvector
- Neon.tech (pgvector pre-installed): https://neon.tech
- Prisma pgvector docs: https://www.prisma.io/docs/orm/overview/databases/postgresql#pgvector
- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings

---

**Recommendation**: Use **Neon.tech** for the easiest setup with pgvector pre-installed!
