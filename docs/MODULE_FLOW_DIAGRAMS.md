# Module Flow & Sequence Diagrams

This document contains flow and sequence diagrams for every module in the AI Recruitment System.

---

## Table of Contents

1. [Authentication Module](#1-authentication-module)
2. [Candidate Module](#2-candidate-module)
3. [HR Module](#3-hr-module)
4. [Jobs Module](#4-jobs-module)
5. [Applications Module](#5-applications-module)
6. [CV Analysis & Scoring Module](#6-cv-analysis--scoring-module)
7. [Quiz Module](#7-quiz-module)
8. [Email Notification Module](#8-email-notification-module)
9. [Matching Module](#9-matching-module)
10. [Dashboard & Analytics Module](#10-dashboard--analytics-module)

---

## 1. Authentication Module

### 1.1 Registration Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as /api/auth/register
    participant RL as Rate Limiter
    participant DB as PostgreSQL
    participant Email as Email Service

    User->>FE: Fill registration form (name, email, password, role)
    FE->>API: POST /api/auth/register
    API->>RL: checkRateLimit(IP, 5 attempts/hr)
    alt Rate limit exceeded
        RL-->>API: blocked
        API-->>FE: 429 Too Many Requests
        FE-->>User: "Too many attempts. Try later."
    else Rate limit OK
        RL-->>API: allowed
        API->>API: Validate with Zod schema
        alt Validation fails
            API-->>FE: 400 Validation error
        else Validation passes
            API->>DB: Check if email already exists
            alt Email exists
                DB-->>API: User found
                API-->>FE: 400 "User already exists"
            else Email new
                API->>API: hashPassword (bcrypt)
                API->>API: generateVerificationCode (6-digit)
                API->>DB: Create User record (isVerified: false)
                DB-->>API: User created
                API->>DB: Create Candidate/HR Profile
                API->>Email: Send verification email (code, expires 1hr)
                Email-->>API: Email queued
                API-->>FE: 201 { message, userId }
                FE-->>User: "Check your email for verification code"
            end
        end
    end
```

### 1.2 Email Verification Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as /api/auth/verify-email
    participant DB as PostgreSQL

    User->>FE: Enter 6-digit verification code
    FE->>API: POST /api/auth/verify-email { code, email }
    API->>DB: Find user by email
    DB-->>API: User record
    API->>API: Check token match & not expired
    alt Token invalid or expired
        API-->>FE: 400 "Invalid or expired code"
        FE-->>User: Show error, option to resend
    else Token valid
        API->>DB: Update user (isVerified: true, clear tokens)
        DB-->>API: Updated
        API-->>FE: 200 { message: "Email verified" }
        FE-->>User: Redirect to login
    end
```

### 1.3 Login Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as /api/auth/login
    participant RL as Rate Limiter
    participant DB as PostgreSQL
    participant Auth as Auth Lib (JWT)

    User->>FE: Enter email & password
    FE->>API: POST /api/auth/login
    API->>RL: checkRateLimit(IP, 10 attempts/15min)
    alt Rate limit exceeded
        RL-->>API: blocked
        API-->>FE: 429 Too Many Requests
    else Rate limit OK
        API->>DB: Find user by email
        alt User not found
            API-->>FE: 401 "Invalid email or password"
        else User found
            API->>DB: Check isActive
            alt Account deactivated
                API-->>FE: 403 "Account deactivated"
            else Account active
                API->>DB: Check isVerified
                alt Not verified
                    API-->>FE: 403 "Please verify your email"
                else Verified
                    API->>Auth: comparePassword (bcrypt)
                    alt Password mismatch
                        API-->>FE: 401 "Invalid email or password"
                    else Password matches
                        API->>Auth: generateToken (JWT, 7d)
                        API->>DB: Update lastLogin
                        API->>FE: Set httpOnly JWT cookie
                        API-->>FE: 200 { user: { id, email, role, name } }
                        FE-->>User: Redirect to role-based dashboard
                    end
                end
            end
        end
    end
```

### 1.4 Password Reset Flow

```mermaid
flowchart TD
    A([User forgets password]) --> B[Request reset\n/api/auth/forgot-password]
    B --> C{Email exists?}
    C -- No --> D[Return generic success\nto prevent enumeration]
    C -- Yes --> E[Generate reset token + expiry 1hr]
    E --> F[Save token to DB]
    F --> G[Send reset email with link]
    G --> H([User clicks link])
    H --> I[/api/auth/reset-password\ntoken + new password]
    I --> J{Token valid\n& not expired?}
    J -- No --> K[400 Invalid/expired token]
    J -- Yes --> L[Hash new password]
    L --> M[Update password in DB]
    M --> N[Clear reset token]
    N --> O([Redirect to login])
```

---

## 2. Candidate Module

### 2.1 Candidate Profile Setup Flow

```mermaid
sequenceDiagram
    actor Candidate
    participant FE as Candidate Dashboard
    participant API as /api/candidates
    participant DB as PostgreSQL

    Candidate->>FE: Navigate to Profile
    FE->>API: GET /api/candidates?userId={id}
    API->>DB: Find candidate by userId
    DB-->>API: Candidate profile (or null)
    API-->>FE: Profile data

    Candidate->>FE: Edit profile (bio, location, skills, links)
    FE->>API: PATCH /api/candidates/{id}
    API->>API: Validate input
    API->>DB: Update Candidate record
    API->>DB: Upsert CandidateSkills
    DB-->>API: Updated profile
    API-->>FE: 200 Updated candidate
    FE-->>Candidate: "Profile updated successfully"
```

### 2.2 Resume Upload & Parsing Flow

```mermaid
sequenceDiagram
    actor Candidate
    participant FE as Frontend
    participant API as /api/resume
    participant FS as File System (uploads/)
    participant Parser as Resume Parser
    participant FastAPI as FastAPI Service
    participant DB as PostgreSQL

    Candidate->>FE: Upload PDF/DOCX resume
    FE->>API: POST /api/resume (multipart/form-data)
    API->>API: Validate file type & size
    API->>FS: Save file to /uploads/{candidateId}/
    FS-->>API: filePath

    API->>Parser: extractText(filePath)
    Parser-->>API: Raw text

    API->>FastAPI: POST /parse-resume { text }
    FastAPI->>FastAPI: NLP extraction\n(skills, experience, education, etc.)
    FastAPI-->>API: Structured resume data

    API->>DB: Create Resume record\n(filePath, extractedText, skills_json, etc.)
    DB-->>API: Resume created

    API->>FastAPI: POST /embed-resume { resumeId, text }
    FastAPI->>DB: Store vector embedding (1536-dim)

    API-->>FE: 201 { resume }
    FE-->>Candidate: Resume uploaded & parsed
```

### 2.3 Avatar Upload Flow

```mermaid
flowchart TD
    A([Candidate selects image]) --> B[POST /api/upload/avatar]
    B --> C{Valid image?\njpg/png/webp, max 5MB}
    C -- No --> D[400 Invalid file]
    C -- Yes --> E[Convert to WebP via Sharp]
    E --> F[Resize to 256×256]
    F --> G[Save to /uploads/avatars/{userId}.webp]
    G --> H[Update user.avatarUrl in DB]
    H --> I([Return new avatar URL])
```

---

## 3. HR Module

### 3.1 HR Onboarding & Company Setup Flow

```mermaid
sequenceDiagram
    actor HR
    participant FE as HR Dashboard
    participant API as /api/hr & /api/company
    participant DB as PostgreSQL

    HR->>FE: Complete profile after registration
    FE->>API: POST /api/company { name, description, industry... }
    API->>DB: Create Company record
    DB-->>API: Company { id }
    API->>DB: Link HRProfile.companyId = company.id
    DB-->>API: HRProfile updated
    API-->>FE: 201 { company }
    FE-->>HR: Company created, can now post jobs
```

### 3.2 Manage Candidates (HR View)

```mermaid
sequenceDiagram
    actor HR
    participant FE as HR Dashboard
    participant API as /api/candidates
    participant DB as PostgreSQL

    HR->>FE: View candidates list
    FE->>API: GET /api/candidates?page=1&search=...&companyId=...
    API->>DB: Paginated candidates with skills & latest resume
    DB-->>API: { candidates[], total, pages }
    API-->>FE: Candidate list

    HR->>FE: Click candidate profile
    FE->>API: GET /api/candidates/{id}
    API->>DB: Candidate + resumes + applications + scores
    DB-->>API: Full candidate data
    API-->>FE: Candidate detail view

    HR->>FE: Update application status
    FE->>API: PATCH /api/applications/{id} { status: "SHORTLISTED" }
    API->>DB: Update application status
    API->>DB: Log email history (optional)
    API-->>FE: 200 Updated application
```

---

## 4. Jobs Module

### 4.1 Job Posting Flow (HR)

```mermaid
sequenceDiagram
    actor HR
    participant FE as HR Dashboard
    participant API as /api/jobs
    participant FastAPI as FastAPI Service
    participant DB as PostgreSQL

    HR->>FE: Fill job form (title, description, requirements...)
    FE->>API: POST /api/jobs
    API->>API: Validate input
    API->>DB: Create Job record (companyId, isActive: true)
    DB-->>API: Job { id }
    API->>DB: Create JobSkill records
    API->>FastAPI: POST /embed-job { jobId, text }
    FastAPI->>DB: Store job embedding (vector 1536-dim)
    FastAPI-->>API: Embedding stored
    API-->>FE: 201 { job }
    FE-->>HR: Job posted successfully
```

### 4.2 Job Browse & Apply Flow (Candidate)

```mermaid
sequenceDiagram
    actor Candidate
    participant FE as Candidate Portal
    participant API as /api/jobs & /api/applications
    participant DB as PostgreSQL
    participant FastAPI as FastAPI (CV Scoring)

    Candidate->>FE: Browse jobs (search, filter, paginate)
    FE->>API: GET /api/jobs?page=1&search=...&location=...
    API->>DB: Query active jobs (paginated)
    DB-->>API: { jobs[], total, pages }
    API-->>FE: Job listings

    Candidate->>FE: Click "Apply" on a Job
    FE->>API: POST /api/applications\n{ candidateId, jobId, resumeId }
    API->>DB: Check for duplicate application
    alt Already applied
        DB-->>API: Application found
        API-->>FE: 400 "Already applied"
    else New application
        API->>DB: Create Application (status: PENDING)
        DB-->>API: Application { id }
        API->>FastAPI: POST /score-cv\n{ resumeId, jobId, applicationId }
        FastAPI->>FastAPI: Compare embeddings\n+ AI scoring
        FastAPI->>DB: Create CvScore record
        FastAPI-->>API: { score, explanation, skillsMatch }
        API->>DB: Update Application.score
        API-->>FE: 201 { application, cvScore }
        FE-->>Candidate: "Applied! Check your status."
    end
```

---

## 5. Applications Module

### 5.1 Application Lifecycle Flow

```mermaid
flowchart TD
    A([Candidate Applies]) --> B[Status: PENDING]
    B --> C{CV Score\ncalculated?}
    C -- Yes --> D[CV Score stored]
    D --> E{Quiz\nRequired?}
    E -- Yes --> F[Status: QUIZ_PENDING]
    E -- No --> G[Status: REVIEWED by HR]
    F --> H[Candidate takes Quiz]
    H --> I[Status: QUIZ_COMPLETED]
    I --> G
    G --> J{HR Decision}
    J -- Shortlist --> K[Status: SHORTLISTED]
    J -- Reject --> L[Status: REJECTED]
    K --> M[Email: Interview Invite sent]
    L --> N[Email: Rejection sent]
    M --> O([Candidate Notified])
    N --> O
```

### 5.2 Application Status Update Sequence (HR)

```mermaid
sequenceDiagram
    actor HR
    participant FE as HR Dashboard
    participant API as /api/applications/{id}
    participant DB as PostgreSQL
    participant EmailSvc as Email Service

    HR->>FE: Review candidate application
    FE->>API: GET /api/applications?jobId={id}&page=1
    API->>DB: Fetch applications with scores & quiz results
    DB-->>API: Paginated application list
    API-->>FE: Application data with CV scores

    HR->>FE: Change status to SHORTLISTED
    FE->>API: PATCH /api/applications/{id}\n{ status: "SHORTLISTED" }
    API->>DB: Update application status
    API->>EmailSvc: Trigger shortlist email
    EmailSvc->>DB: Log EmailHistory record
    EmailSvc-->>API: Email queued
    API-->>FE: 200 Updated
    FE-->>HR: Status updated
```

---

## 6. CV Analysis & Scoring Module

### 6.1 CV Scoring Flow

```mermaid
sequenceDiagram
    participant API as Next.js API
    participant FastAPI as FastAPI /score-cv
    participant OpenAI as OpenAI API
    participant DB as PostgreSQL

    API->>FastAPI: POST /score-cv\n{ resumeId, jobId, applicationId }
    FastAPI->>DB: Fetch Resume (text, embedding)
    FastAPI->>DB: Fetch Job (description, embedding)

    FastAPI->>FastAPI: Cosine similarity\n(resume_embedding vs job_embedding)
    FastAPI->>OpenAI: Prompt: "Score this CV for this JD\nReturn: score, skills_match, explanation"
    OpenAI-->>FastAPI: { score: 78, skills_match: {...}, explanation: "..." }

    FastAPI->>FastAPI: Combine vector similarity\n+ LLM score → final score
    FastAPI->>DB: Create CvScore record\n{ score, explanation, skillsMatch, requirements }
    DB-->>FastAPI: CvScore { id }
    FastAPI-->>API: { score, cvScoreId, details }
```

### 6.2 CV Analysis Detail View

```mermaid
flowchart TD
    A([HR views Application]) --> B[Load CvScore from DB]
    B --> C{Score exists?}
    C -- No --> D[Show Re-score button]
    D --> E[POST /api/cv-analysis/rescore]
    E --> B
    C -- Yes --> F[Display Score Dashboard]
    F --> G[Overall Score %]
    F --> H[Skills Match breakdown]
    F --> I[Requirements Analysis]
    F --> J[AI Explanation text]
    J --> K{HR Disagrees?}
    K -- Yes --> L[Submit Feedback /api/feedback]
    L --> M[Store FeedbackType:\nSCORE_CORRECTION]
    M --> N[Flag for model retraining]
```

---

## 7. Quiz Module

### 7.1 Quiz Generation Flow

```mermaid
sequenceDiagram
    actor HR
    participant FE as HR Dashboard
    participant API as /api/quiz/generate
    participant FastAPI as FastAPI /generate-quiz
    participant OpenAI as OpenAI API
    participant DB as PostgreSQL

    HR->>FE: Click "Generate Quiz" for application
    FE->>API: POST /api/quiz/generate\n{ applicationId, numQuestions: 5, difficulty: "medium" }
    API->>DB: Fetch Application (with Job + Candidate + Resume)
    DB-->>API: Application details

    API->>DB: Check if quiz already exists
    alt Quiz exists
        DB-->>API: QuizAttempt found
        API-->>FE: 400 "Quiz already generated"
    else No quiz yet
        API->>DB: Find or create Quiz for Job
        API->>FastAPI: POST /generate-quiz\n{ job_description, resume_text, num_questions, difficulty }
        FastAPI->>OpenAI: Generate contextual MCQ questions
        OpenAI-->>FastAPI: [ { questionText, options, correctAnswer, points } ]
        FastAPI-->>API: Generated questions

        API->>DB: Create QuizAttempt\n{ quizId, candidateId, applicationId, questions }
        DB-->>API: QuizAttempt { id }
        API->>DB: Update Application (quizRequired: true)
        API-->>FE: 201 { quizAttemptId, questions (no answers) }
        FE-->>HR: "Quiz generated and sent to candidate"
    end
```

### 7.2 Candidate Quiz Attempt Flow

```mermaid
sequenceDiagram
    actor Candidate
    participant FE as Candidate Portal
    participant API as /api/quiz
    participant DB as PostgreSQL
    participant FastAPI as FastAPI /grade-quiz

    Candidate->>FE: Open application, see quiz pending
    FE->>API: GET /api/quiz?applicationId={id}
    API->>DB: Fetch QuizAttempt (questions without correct answers)
    DB-->>API: Quiz questions
    API-->>FE: Questions displayed (timer starts)

    Candidate->>FE: Submit answers
    FE->>API: POST /api/quiz/submit\n{ quizAttemptId, answers, timeSpent }
    API->>DB: Fetch QuizAttempt with questions

    API->>FastAPI: POST /grade-quiz\n{ questions, answers }
    FastAPI->>FastAPI: Compare answers, calculate score
    FastAPI-->>API: { score, correctAnswers, totalQuestions, passed }

    API->>DB: Update QuizAttempt\n{ answers, score, passed, completedAt, timeSpent }
    API->>DB: Update Application\n{ quizCompleted: true, status: QUIZ_COMPLETED }
    API-->>FE: 200 { score, passed, correctAnswers }
    FE-->>Candidate: Show quiz result
```

### 7.3 Quiz Result & Application Update Flow

```mermaid
flowchart TD
    A([Quiz Submitted]) --> B[Grade via FastAPI]
    B --> C{Passed ≥ 70%?}
    C -- Yes ✓ --> D[passed: true]
    C -- No ✗ --> E[passed: false]
    D --> F[Update Application\nstatus → QUIZ_COMPLETED]
    E --> F
    F --> G[Notify HR Dashboard\n- quiz score visible]
    G --> H{HR Reviews}
    H -- Shortlist --> I[SHORTLISTED + Email]
    H -- Reject --> J[REJECTED + Email]
```

---

## 8. Email Notification Module

### 8.1 Email Send Flow

```mermaid
sequenceDiagram
    participant Trigger as Trigger\n(API / Status Change)
    participant EmailSvc as emailService.ts
    participant DB as PostgreSQL (Templates)
    participant Nodemailer as Nodemailer (SMTP)
    participant Candidate as Candidate Email

    Trigger->>EmailSvc: sendEmail({ to, templateType, variables })
    EmailSvc->>DB: Find EmailTemplate by type
    DB-->>EmailSvc: Template { subject, body }
    EmailSvc->>EmailSvc: Interpolate variables\n(candidateName, jobTitle, etc.)
    EmailSvc->>Nodemailer: sendMail({ from, to, subject, html })
    Nodemailer->>Candidate: Deliver email
    Nodemailer-->>EmailSvc: { messageId } or error
    alt Send success
        EmailSvc->>DB: Create EmailHistory\n{ status: SENT, sentAt }
    else Send failed
        EmailSvc->>DB: Create EmailHistory\n{ status: FAILED, errorMessage }
    end
    EmailSvc-->>Trigger: Result
```

### 8.2 Email Types & Triggers

```mermaid
flowchart TD
    A[Application Received\nAPPLICATION_RECEIVED] -->|On POST /applications| B[Candidate notified]
    C[Quiz Pending\nQUIZ_PENDING] -->|On quiz generated| D[Candidate gets quiz link]
    E[Under Review\nAPPLICATION_UNDER_REVIEW] -->|HR sets REVIEWED| F[Candidate notified]
    G[Shortlisted\nAPPLICATION_SHORTLISTED] -->|HR sets SHORTLISTED| H[Candidate gets interview invite]
    I[Rejected\nAPPLICATION_REJECTED] -->|HR sets REJECTED| J[Candidate notified politely]
    K[Custom Email] -->|HR sends manual email| L[Custom message]
    B & D & F & H & J & L --> M[(EmailHistory\nlogged in DB)]
```

---

## 9. Matching Module

### 9.1 Candidate–Job Vector Matching Flow

```mermaid
sequenceDiagram
    participant API as Next.js /api/match
    participant DB as PostgreSQL + pgvector
    participant FastAPI as FastAPI /match

    Note over API,FastAPI: Triggered on demand or during application

    API->>DB: Fetch candidate embedding (vector 1536)
    API->>DB: Fetch job embedding (vector 1536)
    DB-->>API: Both embeddings

    API->>FastAPI: POST /match\n{ candidate_embedding, job_embedding }
    FastAPI->>FastAPI: Cosine Similarity calculation
    FastAPI-->>API: { similarity_score: 0.87 }

    API-->>FE: Match percentage (87%)
```

### 9.2 Bulk Matching (Find Best Candidates for Job)

```mermaid
flowchart TD
    A([HR clicks 'Find Matches'\nfor a Job]) --> B[GET /api/match?jobId={id}]
    B --> C[Fetch Job embedding from DB]
    C --> D[pgvector: SELECT candidates\nORDER BY embedding <=> job_embedding\nLIMIT 20]
    D --> E[Return top 20 candidates\nby vector similarity]
    E --> F[Fetch their CvScores\nif applications exist]
    F --> G[Combine: vector score + CV score → rank]
    G --> H([Display ranked candidate list\nwith match %])
```

### 9.3 Skill Extraction & Matching Detail

```mermaid
sequenceDiagram
    participant Resume as Resume Text
    participant SkillLib as skillExtraction.ts
    participant FastAPI as FastAPI /extract-skills
    participant DB as PostgreSQL

    Resume->>SkillLib: extractSkills(resumeText)
    SkillLib->>FastAPI: POST /extract-skills { text }
    FastAPI->>FastAPI: NLP / regex skill extraction
    FastAPI-->>SkillLib: [ "Python", "React", "SQL", ... ]
    SkillLib->>DB: Upsert Skill records
    SkillLib->>DB: Create CandidateSkill records
    DB-->>SkillLib: skills saved

    Note over SkillLib,DB: Same done for Job skills on job creation
```

---

## 10. Dashboard & Analytics Module

### 10.1 HR Dashboard Data Flow

```mermaid
sequenceDiagram
    actor HR
    participant FE as HR Dashboard
    participant API as /api/dashboard & /api/analytics
    participant DB as PostgreSQL

    HR->>FE: Open Dashboard
    FE->>API: GET /api/dashboard?companyId={id}
    API->>DB: COUNT active jobs for company
    API->>DB: COUNT total applications (by status)
    API->>DB: COUNT pending reviews
    API->>DB: AVG cv_score for recent applications
    DB-->>API: Aggregated stats
    API-->>FE: { totalJobs, totalApplications,\npending, shortlisted, avgScore }

    FE->>API: GET /api/analytics?companyId={id}
    API->>DB: Applications per job (bar chart data)
    API->>DB: Status distribution (pie chart data)
    API->>DB: Applications over time (line chart data)
    DB-->>API: Chart datasets
    API-->>FE: Analytics data
    FE-->>HR: Rendered charts & KPIs
```

### 10.2 Candidate Dashboard Data Flow

```mermaid
sequenceDiagram
    actor Candidate
    participant FE as Candidate Dashboard
    participant API as Next.js API Routes
    participant DB as PostgreSQL

    Candidate->>FE: Open Dashboard
    FE->>API: GET /api/applications?candidateId={id}
    API->>DB: Fetch applications with job, score, quiz status
    DB-->>API: Applications list

    FE->>API: GET /api/candidates/{id}
    API->>DB: Fetch profile + skills + resume count
    DB-->>API: Profile data

    API-->>FE: Dashboard assembled:
    Note over FE: - Applied jobs with status
    Note over FE: - CV scores per application
    Note over FE: - Pending quizzes
    Note over FE: - Profile completion %
    FE-->>Candidate: Personalized dashboard
```

---

## 11. System Architecture Overview

### 11.1 Overall Request Flow

```mermaid
flowchart TD
    subgraph Client["Client (Browser)"]
        A[Next.js Frontend\nReact / Tailwind CSS]
    end

    subgraph NextJS["Next.js App (Port 3000)"]
        B[App Router\nPages & Layouts]
        C[API Routes\n/api/**]
        D[Middleware\nAuth JWT check]
        E[Auth Library\nbcrypt + JWT]
    end

    subgraph FastAPIService["FastAPI Service (Python, Port 8000)"]
        F[Resume Parser\n/parse-resume]
        G[CV Scorer\n/score-cv]
        H[Quiz Generator\n/generate-quiz]
        I[Quiz Grader\n/grade-quiz]
        J[Skill Extractor\n/extract-skills]
        K[Embedding Service\n/embed-resume, /embed-job]
    end

    subgraph Database["PostgreSQL + pgvector"]
        L[(Main DB\nUsers, Jobs, Applications\nQuizzes, Emails)]
        M[(Vector Store\nResume embeddings\nJob embeddings)]
    end

    subgraph External["External Services"]
        N[OpenAI API\nGPT-4 / embeddings]
        O[SMTP Server\nEmail delivery]
        P[File Storage\n/uploads]
    end

    A <-->|HTTP| B
    B --> D
    D --> C
    C --> E
    C <-->|Prisma ORM| L
    L --- M
    C <-->|HTTP| FastAPIService
    FastAPIService <-->|API calls| N
    FastAPIService <-->|Read/Write| L
    C --> O
    C --> P
```

### 11.2 Authentication Guard Flow (Middleware)

```mermaid
flowchart TD
    A([Incoming Request]) --> B{Public route?\n/login, /register\n/jobs public, /api/health}
    B -- Yes --> C[Allow through]
    B -- No --> D[Read JWT from cookie]
    D --> E{Token present?}
    E -- No --> F[Redirect to /login]
    E -- Yes --> G[Verify JWT signature]
    G --> H{Valid & not expired?}
    H -- No --> F
    H -- Yes --> I[Decode payload\n{ userId, email, role }]
    I --> J{Role matches\nrequired route?}
    J -- No --> K[403 Forbidden\nRedirect to own dashboard]
    J -- Yes --> L[Attach user to request\nProceed to handler]
```

---

_Generated: March 2026 | AI Recruitment System — FYP Project_
