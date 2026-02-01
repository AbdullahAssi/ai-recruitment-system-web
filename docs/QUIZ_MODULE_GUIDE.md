# 📝 Quiz Module - Complete Implementation Guide

## Overview

The Quiz Module provides automated assessment functionality for job applications. When a candidate applies for a job, they are automatically redirected to take an AI-generated quiz tailored to the job requirements and their resume.

---

## 🏗️ Architecture

### Flow Diagram

```
Candidate applies → Application Created → Redirect to Quiz
                         ↓
                    Quiz Generated (FastAPI)
                         ↓
                    Candidate Takes Quiz
                         ↓
                    Submit Answers
                         ↓
                    FastAPI Grades Quiz
                         ↓
                    Results Saved to DB
                         ↓
                    Show Results to Candidate & HR
```

---

## 📊 Database Schema

### Updated Models

#### Application Model

```prisma
model Application {
  id            String            @id @default(cuid())
  candidateId   String
  jobId         String
  resumeId      String?
  score         Float?
  status        ApplicationStatus @default(PENDING)
  quizRequired  Boolean           @default(true)   // NEW
  quizCompleted Boolean           @default(false)  // NEW
  appliedAt     DateTime          @default(now())

  quizAttempt   QuizAttempt?     // NEW RELATION
  // ... other relations
}
```

#### QuizAttempt Model (Enhanced)

```prisma
model QuizAttempt {
  id             String    @id @default(cuid())
  quizId         String
  candidateId    String
  applicationId  String?   @unique   // NEW
  questions      Json      // Store generated questions
  answers        Json      // Candidate's answers
  score          Float?
  passed         Boolean   @default(false)
  totalQuestions Int       @default(0)
  correctAnswers Int       @default(0)
  startedAt      DateTime  @default(now())
  completedAt    DateTime?
  timeSpent      Int?      // Time in seconds

  application    Application? @relation(...)  // NEW
  // ... other relations
}
```

#### ApplicationStatus Enum (Enhanced)

```prisma
enum ApplicationStatus {
  PENDING
  QUIZ_PENDING      // NEW
  QUIZ_COMPLETED    // NEW
  REVIEWED
  SHORTLISTED
  REJECTED
}
```

---

## 🔌 API Endpoints

### 1. Generate Quiz

**POST** `/api/quiz/generate`

**Request:**

```json
{
  "applicationId": "app_123",
  "numQuestions": 5,
  "difficulty": "medium"
}
```

**Response:**

```json
{
  "success": true,
  "quizAttemptId": "qa_456",
  "quiz": {
    "id": "quiz_789",
    "title": "Assessment for Senior Developer",
    "duration": 30,
    "passingScore": 70.0
  },
  "questions": [...],
  "totalQuestions": 5
}
```

### 2. Submit Quiz

**POST** `/api/quiz/submit`

**Request:**

```json
{
  "quizAttemptId": "qa_456",
  "answers": {
    "1": "A",
    "2": "C",
    "3": "B"
  },
  "timeSpent": 1200
}
```

**Response:**

```json
{
  "success": true,
  "results": {
    "totalQuestions": 5,
    "correctAnswers": 4,
    "score": 80.0,
    "passed": true,
    "passingScore": 70.0,
    "feedback": "Great job!",
    "details": [...]
  }
}
```

### 3. Get Quiz Attempt

**GET** `/api/quiz/[id]`

Returns quiz attempt details including questions, answers, and results.

### 4. Update Quiz Progress

**PATCH** `/api/quiz/[id]`

Saves candidate's progress during the quiz.

### 5. Get Application with Quiz

**GET** `/api/applications/[id]/quiz`

Returns application with quiz attempt data for HR view.

---

## 🎨 Frontend Components

### Page Components

#### 1. Quiz Assessment Page

**Path:** `/app/candidate/quiz/[applicationId]/page.tsx`

**Features:**

- Auto quiz generation on load
- Timer with warnings (5min, 1min)
- Question navigation (Previous/Next)
- Progress tracking
- Auto-save answers
- Submit confirmation dialog
- Time-up auto-submit
- Results display

**States:**

- `loading` - Generating quiz
- `in-progress` - Taking quiz
- `submitting` - Submitting answers
- `completed` - Showing results

### Reusable Components

#### 1. QuizTimer

**Path:** `/components/quiz/QuizTimer.tsx`

Countdown timer with color-coded warnings.

```tsx
<QuizTimer duration={30} onTimeUp={() => submitQuiz()} isActive={true} />
```

#### 2. QuizProgress

**Path:** `/components/quiz/QuizProgress.tsx`

Visual progress indicator showing answered questions.

```tsx
<QuizProgress
  currentQuestion={3}
  totalQuestions={5}
  answeredQuestions={[1, 2, 3]}
/>
```

#### 3. QuizNavigation

**Path:** `/components/quiz/QuizNavigation.tsx`

Previous/Next navigation with submit button on last question.

```tsx
<QuizNavigation
  currentQuestion={3}
  totalQuestions={5}
  onPrevious={() => {}}
  onNext={() => {}}
  onSubmit={() => {}}
  canSubmit={allAnswered}
/>
```

#### 4. QuizCard

**Path:** `/components/quiz/QuizCard.tsx`

Individual question display with radio options.

```tsx
<QuizCard
  question={question}
  questionNumber={1}
  totalQuestions={5}
  selectedAnswer="A"
  onAnswerSelect={(id, answer) => {}}
/>
```

#### 5. QuizResults

**Path:** `/components/quiz/QuizResults.tsx`

Comprehensive results display with:

- Overall score and pass/fail status
- Question-by-question breakdown
- Explanations for each answer
- Time spent
- Navigation buttons

```tsx
<QuizResults results={results} questions={questions} timeSpent={1200} />
```

#### 6. QuizAttemptView (HR View)

**Path:** `/components/quiz/QuizAttemptView.tsx`

HR-facing view of candidate quiz results.

```tsx
<QuizAttemptView quizAttempt={attempt} quiz={quiz} showDetails={true} />
```

#### 7. QuizStatusCard

**Path:** `/components/applications/QuizStatusCard.tsx`

Summary card showing quiz status in application list.

```tsx
<QuizStatusCard applicationId="app_123" />
```

---

## 🔄 Integration Flow

### 1. Application Submission

**File:** `/app/api/applications/route.ts`

```typescript
// After creating application
return NextResponse.json({
  success: true,
  application,
  redirectTo: `/candidate/quiz/${application.id}`, // Redirect to quiz
});
```

### 2. Frontend Application Form

Update your job application submit handler:

```typescript
const handleSubmit = async () => {
  const response = await fetch("/api/applications", {
    method: "POST",
    body: JSON.stringify({ jobId, candidateId, resumeId }),
  });

  const data = await response.json();

  if (data.redirectTo) {
    router.push(data.redirectTo); // Go to quiz
  }
};
```

### 3. Quiz Generation

The quiz page automatically calls `/api/quiz/generate` which:

1. Fetches application, job, and resume data
2. Calls FastAPI to generate questions
3. Creates QuizAttempt record
4. Updates application status to `QUIZ_PENDING`

### 4. Quiz Submission

When candidate submits:

1. Answers sent to `/api/quiz/submit`
2. FastAPI grades the quiz
3. Results saved to database
4. Application status updated to `QUIZ_COMPLETED`
5. Results displayed to candidate

---

## 👔 HR Dashboard Integration

### View Quiz Results in Application Details

```typescript
import { QuizAttemptView } from "@/components/quiz";

// In your HR application detail page
const application = await prisma.application.findUnique({
  where: { id },
  include: { quizAttempt: { include: { quiz: true } } }
});

return (
  <div>
    {/* Other application details */}

    {application.quizAttempt && (
      <QuizAttemptView
        quizAttempt={application.quizAttempt}
        quiz={application.quizAttempt.quiz}
        showDetails={true}
      />
    )}
  </div>
);
```

### Application List with Quiz Status

```typescript
import { QuizStatusCard } from "@/components/applications/QuizStatusCard";

// In application list
applications.map(app => (
  <div key={app.id}>
    <h3>{app.candidate.name}</h3>
    <QuizStatusCard applicationId={app.id} />
  </div>
));
```

---

## 🔧 Configuration

### Environment Variables

```env
# FastAPI endpoint (already configured)
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000/api/v1

# OpenAI API Key (required for quiz generation)
OPENAI_API_KEY=sk-your-key-here
```

### Quiz Settings (Database)

Default values in Quiz model:

- `duration`: 30 minutes
- `passingScore`: 70%

These can be customized per job when creating Quiz records.

---

## 🚀 Migration Guide

### 1. Run Database Migration

```bash
cd cv-jd
npx prisma migrate dev --name add_quiz_integration
npx prisma generate
```

### 2. Seed Database (Optional)

The seeder will automatically create quiz records for existing jobs.

```bash
npx prisma db seed
```

### 3. Test the Flow

1. Create a job (as HR)
2. Apply to the job (as candidate)
3. You'll be redirected to `/candidate/quiz/[applicationId]`
4. Complete the quiz
5. View results
6. Check HR dashboard for quiz results

---

## 🎯 Best Practices

### 1. Error Handling

All API routes handle errors gracefully and return appropriate status codes.

### 2. Loading States

Components show loading spinners during async operations.

### 3. Auto-Save

Quiz progress is auto-saved on every answer selection.

### 4. Time Management

- Timer shows warnings at 5 minutes and 1 minute
- Auto-submits when time runs out
- Shows grace period dialog

### 5. Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Clear visual feedback
- Color-blind friendly indicators

### 6. Mobile Responsive

All components are fully responsive and work on mobile devices.

---

## 📊 Analytics Potential

### Track Quiz Performance

```typescript
// Analytics you can add:
- Average quiz scores per job
- Pass/fail rates
- Time spent on quizzes
- Most difficult questions
- Question category performance
```

### Sample Query

```typescript
const stats = await prisma.quizAttempt.aggregate({
  where: { quiz: { jobId } },
  _avg: { score: true, timeSpent: true },
  _count: { id: true },
});
```

---

## 🔒 Security Considerations

1. **Authentication:** All quiz routes require authenticated user
2. **Authorization:** Candidates can only access their own quizzes
3. **Rate Limiting:** Consider adding to prevent spam
4. **Data Validation:** All inputs validated with Zod (optional enhancement)
5. **XSS Protection:** All user inputs sanitized

---

## 🐛 Troubleshooting

### Quiz Not Generating

**Issue:** Quiz generation fails

**Solutions:**

- Check FastAPI is running (`http://localhost:8000`)
- Verify OpenAI API key is set
- Check FastAPI logs for errors
- Ensure job description exists

### Timer Not Working

**Issue:** Timer doesn't countdown

**Solutions:**

- Check `isActive` prop is true
- Verify `duration` is set correctly
- Check browser console for errors

### Results Not Showing

**Issue:** Results page blank after submission

**Solutions:**

- Check `/api/quiz/submit` response
- Verify QuizAttempt was updated
- Check browser console for errors
- Ensure `results` state is set

---

## 🚦 Testing Checklist

- [ ] Quiz generation works for new applications
- [ ] Timer counts down correctly
- [ ] Warnings show at 5min and 1min
- [ ] Auto-save persists answers
- [ ] Navigation between questions works
- [ ] Submit button enabled when all answered
- [ ] Confirmation dialog shows for incomplete quiz
- [ ] Time-up auto-submits quiz
- [ ] Results display correctly
- [ ] HR can view quiz results
- [ ] Status updates in application list
- [ ] Mobile responsive
- [ ] Works across different browsers

---

## 📈 Future Enhancements

1. **Adaptive Difficulty:** Adjust question difficulty based on answers
2. **Question Bank:** Reuse questions across similar jobs
3. **Video Proctoring:** Add webcam monitoring (optional)
4. **Analytics Dashboard:** Detailed quiz performance insights
5. **Custom Quiz Templates:** Allow HR to create custom quizzes
6. **Practice Mode:** Let candidates practice before real quiz
7. **Leaderboard:** Show top performers (with consent)
8. **Question Feedback:** Let HR review and improve questions

---

## 📚 Related Documentation

- [FastAPI Quiz Endpoints](../../Fast%20APIs/docs/API_EXAMPLES.md)
- [Prisma Schema](../prisma/schema.prisma)
- [Authentication Guide](../docs/AUTH_SYSTEM_GUIDE.md)
- [AI Features Guide](../docs/AI_FEATURES_GUIDE.md)

---

## 🤝 Support

For issues or questions:

1. Check troubleshooting section above
2. Review error logs in browser console
3. Check FastAPI logs for backend errors
4. Review database records for data issues

---

**Last Updated:** January 31, 2026
**Version:** 1.0.0
