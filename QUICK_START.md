# Quick Start Guide - Role-Based Authentication System

## 🚀 Getting Started in 3 Steps

### Step 1: Environment Setup

```bash
# 1. Make sure you have JWT_SECRET in your .env file
# Add this line to your .env:
JWT_SECRET="your-secret-key-at-least-32-characters-long"

# 2. Your DATABASE_URL should already be set
```

### Step 2: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Test the System

1. Open http://localhost:3000
2. Click "Sign Up"
3. Create an account (try both HR and Candidate roles)
4. Explore the portals!

---

## 🎯 What Changed?

### Before

- Single shared space
- No user authentication
- No role-based access
- Mixed HR and candidate features

### After

- 🏠 **Landing Page** - Choose your portal
- 🔐 **Authentication** - Secure login/register
- 👔 **HR Portal** - Complete recruitment management
- 👤 **Candidate Portal** - Job search and applications
- 🛡️ **Protected Routes** - Role-based access control

---

## 🎨 Portal Features

### HR Portal (`/hr`)

Access for recruiters and HR team:

- **Dashboard** - Overview and quick stats
- **Jobs** - Create and manage job postings
- **Candidates** - View all applicants
- **Email Templates** - Communication management
- **Analytics** - Recruitment insights

### Candidate Portal (`/candidate`)

Access for job seekers:

- **Dashboard** - Your application status
- **Browse Jobs** - Find opportunities
- **My Applications** - Track your progress
- **Profile** - Update info and upload resume

---

## 🔑 Test Accounts

### Create HR Account:

```
Role: HR
Email: hr@test.com
Password: Test1234
Name: HR Manager
```

### Create Candidate Account:

```
Role: Candidate
Email: candidate@test.com
Password: Test1234
Name: John Candidate
```

---

## 📱 How to Use

### For HR Users:

1. Register with role "HR"
2. You'll land on the HR dashboard
3. Use sidebar to navigate:
   - Manage jobs
   - Review candidates
   - Send emails
   - View analytics

### For Candidates:

1. Register with role "Candidate"
2. You'll land on the Candidate dashboard
3. Use sidebar to:
   - Browse available jobs
   - Submit applications
   - Track application status
   - Update your profile

---

## 🔒 Security

Your app now has:

- ✅ Encrypted passwords (bcrypt)
- ✅ Secure JWT tokens
- ✅ HTTP-only cookies
- ✅ Protected routes
- ✅ Role-based access
- ✅ Session management

---

## 🐛 Troubleshooting

### "Not authenticated" error

**Solution:** Clear cookies and log in again

```javascript
// In browser console:
document.cookie.split(";").forEach((c) => {
  document.cookie = c
    .replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

### Can't access HR/Candidate portal

**Solution:** Check your user role

1. Go to http://localhost:3000/api/auth/me
2. Verify your role is correct
3. Log out and log in again

### Database errors

**Solution:** Check your DATABASE_URL

```bash
# Test connection
npx prisma db push
```

---

## 📋 Checklist

Before going live:

- [ ] Set strong JWT_SECRET in production
- [ ] Enable HTTPS
- [ ] Set up email service for notifications
- [ ] Add rate limiting
- [ ] Implement email verification
- [ ] Add password reset flow
- [ ] Configure proper CORS
- [ ] Add logging and monitoring
- [ ] Set up backups
- [ ] Test all user flows

---

## 🎓 Key Concepts

### Authentication Flow

```
Register → Create User → Generate JWT → Set Cookie → Redirect to Portal
Login → Verify Password → Generate JWT → Set Cookie → Redirect to Portal
```

### Authorization Flow

```
Request → Middleware → Check Cookie → Verify JWT → Check Role → Allow/Deny
```

### Portal Access

```
HR users → Can ONLY access /hr/*
Candidates → Can ONLY access /candidate/*
Not logged in → Can ONLY access /, /auth/*
```

---

## 💡 Tips

1. **Testing Tip**: Use incognito mode to test different user roles simultaneously

2. **Development Tip**: Keep the browser console open to see any errors

3. **Database Tip**: Use Prisma Studio to view your data:

   ```bash
   npx prisma studio
   ```

4. **Debugging Tip**: Check the Network tab to see API responses

---

## 🎉 You're Ready!

Your application now has a professional authentication system with role-based access control. Start building your features on top of this solid foundation!

### Next Features to Build:

1. Job posting creation (HR)
2. Job application submission (Candidate)
3. Resume parsing and scoring
4. Email notifications
5. Application status workflow
6. Dashboard analytics

---

## 📞 Need Help?

1. Check [AUTH_SYSTEM_GUIDE.md](AUTH_SYSTEM_GUIDE.md) for detailed documentation
2. Review [RESTRUCTURING_COMPLETE.md](RESTRUCTURING_COMPLETE.md) for what was changed
3. Look at the code comments in the files
4. Check the browser console for errors

**Happy coding! 🚀**
