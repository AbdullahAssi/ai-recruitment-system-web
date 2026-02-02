# Large-Scale Database Seeder

This seeder populates the database with a large amount of realistic test data for thorough testing of the application, especially the new server-side pagination features.

## What It Creates

### Default Configuration

- **10 Companies** with realistic details
- **30 HR Users** (3 per company) with profiles
- **200 Candidates** with resumes, skills, and profiles
- **150 Jobs** (15 per company) with required skills
- **~1500 Applications** (~10 per job) with CV scores
- **50+ Skills** across different categories
- **50 Email Templates** (5 per company)
- **~1000 Email History** records

### Total Records: ~3000+

## How to Run

### Option 1: Using the seeder directly

```bash
# Install dependencies if not already done
npm install

# Run the large-scale seeder
npx tsx prisma/seed-large.ts
```

### Option 2: Add to package.json

Add this to your `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed-large.ts"
  }
}
```

Then run:

```bash
npx prisma db seed
```

## Test Credentials

After seeding, you can log in with any of the generated accounts:

### HR Users

- Email: `{firstname}.{lastname}@company1.com` (or company2, company3, etc.)
- Password: `password123`

### Candidates

- Email: `{firstname}.{lastname}@gmail.com` (or yahoo.com, outlook.com)
- Password: `password123`

### Example Accounts

- `john.doe@gmail.com` / `password123` (Candidate)
- `jane.smith@yahoo.com` / `password123` (Candidate)
- HR emails depend on company domains generated

## Features

### Realistic Data

- Real-world names (64 first names × 56 last names = 3,584 combinations)
- Authentic company names and industries
- Realistic job titles and descriptions
- Proper skill categorization
- Varied application statuses
- CV scores with strengths and weaknesses

### Data Distribution

- **Jobs**: 80% active, 20% inactive
- **Candidates**: 80% verified, 20% unverified
- **Applications**: Mixed statuses (Pending, Reviewed, Shortlisted, Rejected, Accepted)
- **CV Scores**: 60% of applications have scores
- **Email History**: 70% of applications have email records

### Relationships

- Every candidate has a resume and 5-12 skills
- Every job has 5-10 required skills
- Each company has 3 HR users
- Applications are randomly distributed across candidates
- Skills are categorized (Frontend, Backend, DevOps, Database, Soft Skills)

## Customization

Edit the `CONFIG` object in `seed-large.ts`:

```typescript
const CONFIG = {
  COMPANIES: 10, // Number of companies
  HR_PER_COMPANY: 3, // HR users per company
  CANDIDATES: 200, // Total candidates
  JOBS_PER_COMPANY: 15, // Jobs per company
  APPLICATIONS_PER_JOB: 10, // Applications per job
  EMAIL_TEMPLATES: 5, // Email templates per company
};
```

### Example Configurations

#### Small Test (Fast)

```typescript
const CONFIG = {
  COMPANIES: 3,
  HR_PER_COMPANY: 2,
  CANDIDATES: 50,
  JOBS_PER_COMPANY: 5,
  APPLICATIONS_PER_JOB: 5,
  EMAIL_TEMPLATES: 5,
};
```

#### Large Test (Comprehensive)

```typescript
const CONFIG = {
  COMPANIES: 20,
  HR_PER_COMPANY: 5,
  CANDIDATES: 500,
  JOBS_PER_COMPANY: 25,
  APPLICATIONS_PER_JOB: 15,
  EMAIL_TEMPLATES: 5,
};
```

#### Extra Large (Stress Test)

```typescript
const CONFIG = {
  COMPANIES: 50,
  HR_PER_COMPANY: 10,
  CANDIDATES: 1000,
  JOBS_PER_COMPANY: 50,
  APPLICATIONS_PER_JOB: 20,
  EMAIL_TEMPLATES: 5,
};
```

## Performance

### Seeding Time

- Small (500 records): ~10-20 seconds
- Default (3000+ records): ~30-60 seconds
- Large (10000+ records): ~2-5 minutes

### Database Size

- Small: ~5 MB
- Default: ~50 MB
- Large: ~200+ MB

## Testing Pagination

With this seed data, you can test:

### HR Jobs Page

- Multiple pages of jobs (15 jobs × 10 companies = 150 jobs)
- Filtering by status, location, search
- Sorting by date, title, applications

### HR Candidates Page

- Multiple pages (200 candidates)
- Search by name, email
- Filter by experience range
- Bulk actions with many candidates

### Candidate Jobs Page

- Browse available jobs (120 active jobs)
- Search functionality
- Application status indicators

### Job Applications Page

- Multiple applications per job
- Filter by status
- Sort by score, date, name
- CV scores and detailed analysis

## Data Cleanup

The seeder automatically cleans up existing data before seeding. To manually clean:

```bash
npx prisma migrate reset
```

This will:

1. Drop all data
2. Recreate the database schema
3. Run the seeder automatically (if configured in package.json)

## Troubleshooting

### Error: Connection timeout

- Increase connection timeout in Prisma schema
- Check database server is running

### Error: Out of memory

- Reduce CONFIG values
- Run seeder in smaller batches

### Error: Unique constraint violation

- Run cleanup first: `npx prisma migrate reset`
- Ensure no existing data conflicts

## Notes

- All passwords are hashed with bcrypt
- Phone numbers use +1 country code
- Resumes are placeholder paths (files don't exist)
- Email addresses follow realistic patterns
- Companies have unique domains
- Skills are properly categorized
- Application dates are within 90 days of job posting

## Next Steps

After seeding:

1. Start the development server: `npm run dev`
2. Log in with test credentials
3. Test pagination on all pages
4. Test filtering and sorting
5. Test bulk actions with multiple items
6. Verify performance with large datasets
7. Test search functionality across pages
