# Authentication System Setup Guide

## Overview

This application now has a complete role-based authentication system with separate portals for HR and Candidates.

## Architecture

### User Roles

- **CANDIDATE**: Job seekers who can browse jobs and apply
- **HR**: Recruiters who can manage jobs, candidates, and recruitment process
- **ADMIN**: Full system access (future implementation)

### Portal Structure

```
/                    → Landing page with portal selection
/auth/login          → Login page
/auth/register       → Registration page
/hr/*                → HR Portal (protected)
/candidate/*         → Candidate Portal (protected)
```

## Database Schema

### New Models

1. **User** - Authentication and user management

   - email, password (hashed), role, name, phone
   - Linked to either Candidate or HRProfile

2. **HRProfile** - HR-specific data

   - department, position, permissions

3. **Candidate** - Enhanced with userId link
   - Now connected to User for authentication

## Setup Instructions

### 1. Environment Variables

Create a `.env` file based on `.env.example`:

```bash
DATABASE_URL="your-postgresql-url"
JWT_SECRET="your-secret-key-min-32-chars"
```

### 2. Run Database Migrations

```bash
# When database is available, run:
npx prisma migrate dev --name add_user_authentication_and_roles

# Generate Prisma client
npx prisma generate
```

### 3. Start the Application

```bash
npm run dev
```

## Features Implemented

### ✅ Authentication System

- JWT-based authentication with HTTP-only cookies
- Password hashing with bcryptjs
- Login/Register pages with validation
- Session management

### ✅ Role-Based Access Control

- Middleware protection for routes
- Automatic redirection based on role
- Role validation on API routes

### ✅ Landing Page

- Portal selection cards
- User status in navigation
- Direct access to appropriate dashboard

### ✅ HR Portal

- Dashboard with stats
- Sidebar navigation
- Access to:
  - Jobs management
  - Candidates
  - Email templates
  - Analytics

### ✅ Candidate Portal

- Dashboard with application stats
- Sidebar navigation
- Access to:
  - Browse jobs
  - My applications
  - Profile management
  - Resume upload

## Authentication Flow

### Registration

1. User fills registration form with role selection
2. Password is hashed
3. User record created
4. Candidate or HRProfile created based on role
5. JWT token generated and set in cookie
6. User redirected to appropriate portal

### Login

1. User enters credentials
2. Password verified
3. JWT token generated
4. User redirected based on role

### Protected Routes

1. Middleware checks for auth token
2. Validates JWT token
3. Checks role permissions
4. Allows access or redirects

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user details

## Security Features

✅ Password hashing with bcrypt
✅ HTTP-only cookies for JWT
✅ JWT token expiration (7 days)
✅ Role-based middleware protection
✅ Secure password validation (min 8 characters)
✅ Email uniqueness validation

## Next Steps

### Immediate

1. Wait for database to reconnect and run migrations
2. Test authentication flow
3. Create seed data for testing

### Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] OAuth integration (Google, LinkedIn)
- [ ] Activity logging
- [ ] Session management dashboard
- [ ] Profile picture upload
- [ ] Advanced permissions system

## Usage Examples

### Registering as HR

```typescript
POST /api/auth/register
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "password": "SecurePass123",
  "role": "HR",
  "phone": "+1234567890"
}
```

### Registering as Candidate

```typescript
POST /api/auth/register
{
  "name": "John Smith",
  "email": "john@email.com",
  "password": "SecurePass123",
  "role": "CANDIDATE",
  "phone": "+1234567890"
}
```

## Troubleshooting

### Database Connection Issues

If you see "Can't reach database server" error:

1. Check DATABASE_URL in .env
2. Ensure database is running
3. Check network connectivity
4. Verify database credentials

### Migration Issues

```bash
# Reset database (CAREFUL: deletes all data)
npx prisma migrate reset --force

# Create new migration
npx prisma migrate dev --name your_migration_name
```

### JWT Token Issues

- Clear browser cookies
- Check JWT_SECRET is set in .env
- Verify token hasn't expired (7 days default)

## File Structure

```
app/
  ├── auth/
  │   ├── login/page.tsx          # Login page
  │   └── register/page.tsx       # Registration page
  ├── hr/
  │   ├── layout.tsx              # HR portal layout with sidebar
  │   ├── page.tsx                # HR dashboard
  │   ├── jobs/                   # Jobs management
  │   ├── candidates/             # Candidates management
  │   └── email/templates/        # Email templates
  ├── candidate/
  │   ├── layout.tsx              # Candidate portal layout
  │   ├── page.tsx                # Candidate dashboard
  │   ├── jobs/page.tsx           # Browse jobs
  │   ├── applications/page.tsx   # My applications
  │   └── profile/page.tsx        # Profile management
  └── api/
      └── auth/
          ├── register/route.ts   # Registration endpoint
          ├── login/route.ts      # Login endpoint
          ├── logout/route.ts     # Logout endpoint
          └── me/route.ts         # Current user endpoint

lib/
  └── auth.ts                     # Authentication utilities

contexts/
  └── AuthContext.tsx             # Auth context and hooks

middleware.ts                     # Route protection middleware
```

## Support

For issues or questions:

1. Check this documentation
2. Review error logs
3. Verify environment variables
4. Check database connection
5. Review Prisma schema

---

**Last Updated**: December 14, 2025
**Version**: 1.0.0
