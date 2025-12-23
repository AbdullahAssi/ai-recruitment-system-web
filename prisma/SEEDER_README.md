# Database Seeder

This seeder populates your database with realistic test data based on your Prisma schema.

## Installation

First, install the required dependencies:

```bash
npm install
# or
npm install tsx --save-dev
```

## Running the Seeder

After running Prisma migrations, you can seed your database:

```bash
# Using npm script
npm run seed

# Or directly with Prisma
npx prisma db seed
```

## What Gets Seeded

The seeder creates the following data:

| Table | Records | Description |
|-------|---------|-------------|
| **Users** | 10 | 5 candidates, 3 HR staff, 2 admins |
| **HR Profiles** | 3 | Profiles for HR users with permissions |
| **Candidates** | 8 | 5 linked to users, 3 legacy records |
| **Skills** | 10 | Various technical skills |
| **Candidate Skills** | 10 | Skill associations with proficiency levels |
| **Jobs** | 7 | Active and inactive job postings |
| **Job Skills** | 10 | Required skills for jobs |
| **Resumes** | 8 | Resume files for candidates |
| **Email Templates** | 8 | All email types |
| **Applications** | 10 | Applications with various statuses |
| **CV Scores** | 8 | AI scoring results |
| **Email History** | 10 | Email communication records |

## Test Login Credentials

After seeding, you can log in with these accounts:

### Candidate Account
- Email: `john.doe@example.com`
- Password: `password123`

### HR Account
- Email: `hr.manager@company.com`
- Password: `password123`

### Admin Account
- Email: `admin@company.com`
- Password: `password123`

## Data Features

### Realistic Relationships
- Applications linked to candidates and jobs
- CV scores connected to applications
- Email history tracking communications
- Candidate skills with proficiency levels

### Various States
- Active and inactive jobs
- Different application statuses (PENDING, REVIEWED, SHORTLISTED, REJECTED)
- Sent, pending, and failed emails
- Users with verified and unverified accounts

### Comprehensive Coverage
- All user roles (CANDIDATE, HR, ADMIN)
- All email types
- Skill proficiency levels (BEGINNER to EXPERT)
- Complete job application workflow

## Customization

To modify the seeded data:

1. Edit `prisma/seed.ts`
2. Adjust the data arrays or add new records
3. Run `npm run seed` again

## Clearing Data

The seeder automatically clears existing data before seeding. If you want to preserve existing data, comment out the delete operations at the beginning of the `main()` function in `seed.ts`.

## Troubleshooting

### Error: Cannot find module 'bcryptjs'
```bash
npm install bcryptjs @types/bcryptjs
```

### Error: Cannot find module 'tsx'
```bash
npm install tsx --save-dev
```

### Foreign Key Constraint Errors
Make sure to run migrations first:
```bash
npx prisma migrate dev
```

### Connection Issues
Check your `DATABASE_URL` in `.env` file.

## Integration with Prisma

This seeder integrates with Prisma's seed workflow:

- Runs automatically after `prisma migrate dev` or `prisma migrate reset`
- Can be run manually with `npx prisma db seed`
- Configured in `package.json` under the `prisma` key

## Next Steps

After seeding:

1. Start your development server: `npm run dev`
2. Log in with test credentials
3. Explore the application with realistic data
4. Test all features with pre-populated records

## Notes

- All passwords are hashed with bcrypt
- IDs are auto-generated CUIDs
- Timestamps are set to current time
- JSON fields contain structured data for skills, projects, etc.
- File paths point to `/uploads/resumes/` directory
