# 🚀 Quiz Module - Quick Start Guide

## Setup Instructions

### 1. Database Migration

Run the database migration to add quiz integration fields:

```bash
cd cv-jd
npx prisma migrate dev --name add_quiz_integration
npx prisma generate
```

This will:

- Add `quizRequired` and `quizCompleted` to Application model
- Add `applicationId` to QuizAttempt model
- Add new statuses: `QUIZ_PENDING` and `QUIZ_COMPLETED`
- Add quiz tracking fields (timeSpent, totalQuestions, correctAnswers)

### 2. Verify FastAPI is Running

Ensure your FastAPI backend is running:

```bash
cd "Fast APIs"
uvicorn app.main:app --reload
```

Visit http://localhost:8000/docs to verify quiz endpoints are available:

- POST `/api/v1/quiz/generate`
- POST `/api/v1/quiz/submit`
- POST `/api/v1/quiz/validate-answer`

### 3. Start Next.js Development Server

```bash
cd cv-jd
npm run dev
```

Visit http://localhost:3000

---

## 🧪 Testing the Complete Flow

### Scenario 1: Candidate Applies and Takes Quiz

**Step 1: Login as Candidate**

- Go to http://localhost:3000/auth/login
- Use candidate credentials (e.g., `john.doe@example.com` / `password123`)

**Step 2: Browse Jobs**

- Navigate to `/candidate/jobs`
- Find an active job posting

**Step 3: Apply to Job**

- Click "Apply Now"
- If you have a resume, select it; otherwise upload one
- Submit application

**Step 4: Automatic Quiz Redirect**

- You'll be automatically redirected to `/candidate/quiz/[applicationId]`
- Wait for quiz generation (takes 5-10 seconds)

**Step 5: Take the Quiz**

- Read each question carefully
- Select your answers (radio buttons)
- Navigate using Previous/Next buttons
- Watch the timer (top right)
- Submit when all questions are answered

**Step 6: View Results**

- See your score, pass/fail status
- Review correct/incorrect answers
- Check explanations for each question
- Click "Return to Dashboard" or "Browse More Jobs"

---

### Scenario 2: HR Reviews Quiz Results

**Step 1: Login as HR**

- Go to http://localhost:3000/auth/login
- Use HR credentials (e.g., `hr.manager@company.com` / `password123`)

**Step 2: View Applications**

- Navigate to `/hr/candidates` or `/hr/jobs/[jobId]`
- See list of applications

**Step 3: Check Quiz Status**

- Each application card shows quiz status badge:
  - 🟢 **Completed** - Quiz done
  - 🟡 **Pending** - Quiz not started
  - ⚪ **Not Started** - No quiz yet

**Step 4: View Detailed Results**

- Click on an application with completed quiz
- Scroll to "Assessment Results" section
- See:
  - Overall score and pass/fail
  - Time spent
  - Number of correct answers
  - Question-by-question breakdown
  - Candidate's answers vs correct answers

---

## 📊 Sample Test Data

### Create Test Candidate

```typescript
// Register a new candidate at /auth/register
{
  email: "test.candidate@example.com",
  password: "Test123!@#",
  name: "Test Candidate",
  role: "CANDIDATE"
}
```

### Create Test Job (as HR)

```typescript
// At /hr/jobs/new
{
  title: "Senior Frontend Developer",
  description: `
    Looking for experienced React developer with:
    - 5+ years React experience
    - TypeScript proficiency
    - Next.js knowledge
    - State management (Redux/Zustand)
    - Testing (Jest, React Testing Library)
  `,
  location: "Remote",
  requirements: "Bachelor's degree in CS or equivalent",
  responsibilities: "Build scalable frontend applications"
}
```

---

## ✅ Verification Checklist

After completing the test flow, verify:

### Database Records

```bash
# Check application record
npx prisma studio
# Navigate to Application table
# Find your test application
# Verify: status = "QUIZ_COMPLETED", quizCompleted = true
```

### Quiz Attempt Record

```sql
-- In Prisma Studio, check QuizAttempt table
-- Verify fields:
- applicationId is set
- questions array has 5 items
- answers object has 5 entries
- score is between 0-100
- passed is true/false based on score
- completedAt is set
- timeSpent has a value
```

### Application Status Flow

The status should progress:

1. `PENDING` (initial)
2. `QUIZ_PENDING` (after quiz generated)
3. `QUIZ_COMPLETED` (after quiz submitted)

---

## 🐛 Common Issues & Solutions

### Issue 1: Quiz Not Generating

**Symptom:** Stuck on "Generating your assessment..." screen

**Solutions:**

```bash
# Check FastAPI logs
cd "Fast APIs"
# Look for errors in terminal

# Verify OpenAI API key
cat .env | grep OPENAI_API_KEY

# Test FastAPI endpoint manually
curl -X POST http://localhost:8000/api/v1/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"job_description": "Test job", "num_questions": 3}'
```

### Issue 2: Timer Not Working

**Symptom:** Timer stuck at 30:00

**Solution:**

- Check browser console for errors
- Ensure quiz state is "in-progress"
- Verify duration prop is passed correctly

### Issue 3: Results Not Showing

**Symptom:** Blank page after submitting quiz

**Solution:**

```typescript
// Check browser network tab
// Verify /api/quiz/submit returned 200
// Check response data structure
// Look for errors in browser console
```

### Issue 4: HR Can't See Results

**Symptom:** Quiz results not appearing in HR dashboard

**Solution:**

```bash
# Check database
npx prisma studio
# Verify QuizAttempt has applicationId
# Verify Application.quizCompleted is true
# Check API response from /api/applications/[id]/quiz
```

---

## 🔍 Debugging Tools

### 1. Browser DevTools

Open with F12:

- **Console:** Check for JavaScript errors
- **Network:** Monitor API calls
- **React DevTools:** Inspect component state

### 2. Prisma Studio

```bash
cd cv-jd
npx prisma studio
```

Browse database records visually.

### 3. FastAPI Docs

Visit http://localhost:8000/docs

Test individual endpoints:

- Generate quiz
- Submit quiz
- Validate answers

### 4. Server Logs

**Next.js:**

```bash
# Terminal running npm run dev
# Shows API route logs
```

**FastAPI:**

```bash
# Terminal running uvicorn
# Shows Python backend logs
```

---

## 📈 Success Metrics

After successful implementation, you should see:

✅ **Candidate Experience:**

- Seamless redirect from application to quiz
- Intuitive quiz interface
- Clear timer and progress indicators
- Helpful results with explanations

✅ **HR Experience:**

- Quiz status visible in application list
- Detailed results in application view
- Easy comparison between candidates
- Filterable by quiz score (future enhancement)

✅ **Technical:**

- Quiz generation time < 10 seconds
- Auto-save working on every answer
- No data loss on page refresh
- Proper error handling
- Mobile responsive

---

## 🎯 Next Steps

After successful testing:

1. **Customize Quiz Settings**
   - Adjust duration per job
   - Set different passing scores
   - Configure question counts

2. **Enhance HR Dashboard**
   - Add quiz filters
   - Show average scores
   - Compare candidates by quiz performance

3. **Add Analytics**
   - Track quiz completion rates
   - Identify difficult questions
   - Monitor average scores per job

4. **Improve Question Quality**
   - Review AI-generated questions
   - Build question bank
   - Add domain-specific questions

---

## 📞 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review [QUIZ_MODULE_GUIDE.md](./QUIZ_MODULE_GUIDE.md) for detailed documentation
3. Check database records in Prisma Studio
4. Review API logs in browser and server

---

**Ready to test?** Start with Scenario 1 above! 🚀
