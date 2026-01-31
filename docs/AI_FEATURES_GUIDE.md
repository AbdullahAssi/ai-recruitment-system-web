# AI Features Integration Guide

This document explains how the Quiz Generation, Resume Parsing, and Candidate Matching features work in the frontend.

## 🎯 Overview

The application integrates with a FastAPI backend for AI-powered features:

- **Resume Parsing**: Extract structured data from resumes (PDF/DOCX)
- **Quiz Generation**: Create job-specific assessment quizzes
- **Candidate Matching**: AI-powered candidate-to-job matching with semantic search
- **Scoring**: Calculate compatibility scores between candidates and jobs

## 📁 File Structure

```
lib/
  ├── fastapi.ts                    # FastAPI client (main integration point)
  └── types/fastapi.types.ts        # TypeScript interfaces

app/api/fastapi/                    # Next.js API proxy routes
  ├── parsing/
  │   ├── extract-pdf/route.ts
  │   ├── extract-text/route.ts
  │   └── methods/route.ts
  ├── quiz/
  │   ├── generate/route.ts
  │   ├── submit/route.ts
  │   └── validate/route.ts
  └── matching/
      ├── match/route.ts
      └── search/route.ts

hooks/
  ├── useQuiz.ts                    # Quiz generation/submission
  ├── useMatching.ts                # Candidate matching
  └── useParsing.ts                 # Resume parsing

components/
  ├── quiz/
  │   ├── QuizGenerator.tsx         # Generate quiz form
  │   ├── QuizCard.tsx              # Display single question
  │   ├── QuizAttempt.tsx           # Take quiz interface
  │   └── index.ts
  └── matching/
      ├── CandidateMatchCard.tsx    # Show match result
      ├── MatchingResults.tsx       # List of matches
      └── index.ts
```

## 🚀 How to Use Each Feature

### 1. Resume Parsing

**When It Happens:**

- Automatically when a candidate uploads their resume via the profile page
- Triggered in `/app/api/upload/resume/route.ts`

**What It Does:**

- Extracts text from PDF/DOCX files
- Parses structured information: name, email, phone, skills, experience, education
- Stores extracted data in the `resumes` table

**How It Works:**

```typescript
// In app/api/upload/resume/route.ts (lines 95-115)
// After file is saved, AI processing is triggered asynchronously
fetch(`${process.env.NEXTAUTH_URL}/api/ai/process`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resumeId: resume.id }),
});
```

**Frontend Usage (Manual Parsing):**

```typescript
import { useParsing } from "@/hooks/useParsing";

function ResumeUploader() {
  const { extractPDF, loading, error } = useParsing();

  const handleUpload = async (file: File) => {
    const result = await extractPDF(file);
    console.log(result.extracted_data);
    // Use result.extracted_data.skills, .experience, etc.
  };
}
```

### 2. Quiz Generation

**Where to Use:**

- HR portal when creating/editing a job
- Candidate portal for skills assessment

**What It Does:**

- Generates multiple-choice questions based on job description
- Creates technical and behavioral questions
- Adjustable difficulty (easy, medium, hard)
- Returns questions with explanations

**How to Implement:**

**For HR - Add to Job Creation/Edit Page:**

```typescript
// app/hr/jobs/[id]/edit/page.tsx or new job creation page

import { QuizGenerator, QuizCard } from '@/components/quiz';
import { useState } from 'react';

function JobWithQuiz() {
  const [quizQuestions, setQuizQuestions] = useState([]);

  return (
    <div>
      {/* Existing job form */}

      {/* Add Quiz Section */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Generate Assessment Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizGenerator
            jobDescription={jobDescription} // From job form
            onQuizGenerated={(questions) => {
              setQuizQuestions(questions);
              // Optionally save to database
            }}
          />

          {quizQuestions.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold">Preview Generated Questions:</h3>
              {quizQuestions.slice(0, 3).map((q, i) => (
                <QuizCard
                  key={q.id}
                  question={q}
                  questionNumber={i + 1}
                  totalQuestions={quizQuestions.length}
                  onAnswerSelect={() => {}}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

**For Candidates - Add to Job Detail Page:**

```typescript
// app/candidate/jobs/[id]/page.tsx

import { QuizAttempt } from '@/components/quiz';
import { useQuiz } from '@/hooks/useQuiz';
import { useState } from 'react';

function JobDetailWithQuiz() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const { generateQuiz, loading } = useQuiz();

  const handleStartQuiz = async () => {
    const result = await generateQuiz({
      job_description: job.description,
      num_questions: 5,
      difficulty: 'medium',
      question_types: ['technical', 'behavioral']
    });

    if (result) {
      setQuizQuestions(result.questions);
      setShowQuiz(true);
    }
  };

  return (
    <div>
      {/* Existing job details */}

      {!showQuiz ? (
        <Button onClick={handleStartQuiz} disabled={loading}>
          {loading ? 'Generating Quiz...' : 'Take Assessment Quiz'}
        </Button>
      ) : (
        <QuizAttempt
          questions={quizQuestions}
          candidateId={user?.candidate?.id}
          onComplete={(result) => {
            console.log('Quiz Score:', result.score_percentage);
            // Save result to database if needed
          }}
        />
      )}
    </div>
  );
}
```

### 3. Candidate Matching

**Where to Use:**

- HR portal when viewing candidates for a job
- AI-powered candidate search

**What It Does:**

- Matches candidates to jobs based on skills, experience
- Semantic similarity using vector embeddings
- Shows matched/missing skills
- Provides AI explanation for match score

**How to Implement:**

**For HR - Add to Job Candidates Page:**

```typescript
// app/hr/jobs/[id]/candidates/page.tsx

import { MatchingResults } from '@/components/matching';
import { useMatching } from '@/hooks/useMatching';
import { useState, useEffect } from 'react';

function JobCandidatesWithMatching() {
  const [matches, setMatches] = useState([]);
  const { matchCandidates, loading } = useMatching();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    const result = await matchCandidates({
      job_id: jobId,
      job_description: job.description,
      required_skills: job.requirements,
      min_experience: job.minExperience || 0,
      top_n: 10
    });

    if (result) {
      setMatches(result.matches);
    }
  };

  return (
    <div>
      <h2>Top Matched Candidates</h2>

      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <MatchingResults
          matches={matches}
          totalCandidates={matches.length}
          onViewProfile={(candidateId) => {
            router.push(`/hr/candidates/${candidateId}`);
          }}
          onDownloadResume={(candidateId) => {
            // Download resume logic
          }}
        />
      )}
    </div>
  );
}
```

**Semantic Search Example:**

```typescript
import { useMatching } from "@/hooks/useMatching";

function CandidateSearch() {
  const { semanticSearch } = useMatching();

  const handleSearch = async (query: string) => {
    const results = await semanticSearch({
      query: "Senior React developer with 5 years experience",
      top_k: 10,
      filters: {
        min_experience: 3,
        location: "Remote",
      },
    });

    console.log(results.results); // Ranked by semantic similarity
  };
}
```

## 🔧 Configuration

### Environment Variables

Add to your `.env.local`:

```env
# FastAPI Backend URL (IMPORTANT: Must start with NEXT_PUBLIC_ to be accessible in browser)
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000/api/v1

# For production
# NEXT_PUBLIC_FASTAPI_URL=https://your-fastapi-backend.com/api/v1
```

**Important Notes:**

- The variable MUST start with `NEXT_PUBLIC_` to be accessible in the browser
- Do NOT use just `FASTAPI_URL` - it won't work in client-side components
- The URL should end with `/api/v1` to match the FastAPI routing

### FastAPI Backend Setup

The frontend expects these endpoints from FastAPI:

1. **Parsing:**
   - `POST /api/parsing/extract-pdf` - Extract from PDF
   - `POST /api/parsing/extract-text` - Extract from DOCX
   - `GET /api/parsing/methods` - Get available methods

2. **Quiz:**
   - `POST /api/quiz/generate` - Generate quiz questions
   - `POST /api/quiz/submit` - Submit quiz for scoring
   - `POST /api/quiz/validate` - Validate single answer

3. **Matching:**
   - `POST /api/matching/match` - Match candidates to job
   - `POST /api/matching/search` - Semantic search

## 🎨 UI Components Reference

### QuizGenerator

```typescript
<QuizGenerator
  jobDescription="Full Stack Developer position..."
  onQuizGenerated={(questions) => console.log(questions)}
/>
```

### QuizAttempt

```typescript
<QuizAttempt
  questions={quizQuestions}
  candidateId="candidate-123"
  onComplete={(result) => console.log('Score:', result.score_percentage)}
/>
```

### MatchingResults

```typescript
<MatchingResults
  matches={matchResults}
  totalCandidates={100}
  onViewProfile={(id) => router.push(`/candidate/${id}`)}
  onDownloadResume={(id) => downloadResume(id)}
/>
```

## 📊 Data Flow

```
User Action → React Hook → Next.js API Route → FastAPI Backend
    ↓
Response ← React Hook ← Next.js API Route ← FastAPI Backend
    ↓
Update UI State → Render Component
```

## 🧪 Testing

Test the integration:

1. **Resume Parsing**: Upload a resume via profile page, check console for AI processing logs
2. **Quiz Generation**: Use the QuizGenerator component in Storybook or test page
3. **Matching**: Create test page at `/app/test-matching/page.tsx` with MatchingResults component

## 🚨 Troubleshooting

**Issue: "Failed to fetch" errors**

- Check FastAPI backend is running on port 8000
- Verify NEXT_PUBLIC_FASTAPI_URL environment variable is set in `.env.local`
- Check CORS settings in FastAPI (must allow `http://localhost:3000`)

**Issue: 422 Unprocessable Entity**

- This means the request body doesn't match FastAPI's expected schema
- For matching: Candidates must have format: `{ id, name, skills[], experience_years, education_level?, summary? }`
- Check the browser console for the exact error from FastAPI
- Verify candidates array is not empty
- Ensure skills is an array of strings, not objects

**Issue: Quiz questions not generating**

- Ensure job description is at least 50 characters
- Check FastAPI logs for OpenAI API errors
- Verify OpenAI API key is set in FastAPI backend

**Issue: Matching returns no results**

- Ensure candidates have skills data in the database
- Check that candidateSkills relationship is properly loaded
- Run the seeder script to add test data: `npx ts-node prisma/seed.ts`
- Verify pgvector extension is installed

**Issue: Environment variable not found**

- Remember: Must use `NEXT_PUBLIC_FASTAPI_URL` (with NEXT*PUBLIC* prefix)
- Restart Next.js dev server after changing `.env.local`
- Check the variable is not in quotes in `.env.local`

## 📝 Next Steps

1. **Save Quiz Results**: Create QuizAttempt model in Prisma schema to persist results
2. **Job Quizzes**: Link generated quizzes to jobs (add `quizId` field to Job model)
3. **Analytics**: Track quiz performance, matching accuracy
4. **Notifications**: Email candidates when matched to jobs

## 🔗 Related Files

- [lib/fastapi.ts](../lib/fastapi.ts) - Main FastAPI client
- [instructions.md](../instructions.md) - Component guidelines
- [prisma/schema.prisma](../prisma/schema.prisma) - Database schema
