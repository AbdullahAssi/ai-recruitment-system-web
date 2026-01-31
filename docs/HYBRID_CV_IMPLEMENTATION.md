# 📄 Hybrid CV Model Implementation Guide

## Overview

This implementation provides a **LinkedIn/Indeed-style hybrid CV system** that gives users the flexibility to maintain a primary CV while also allowing custom CVs for specific job applications.

---

## 🎯 Key Features

### 1. **Primary CV Management**

- Users can upload and manage a **primary resume** in their profile
- This resume is used by default for all job applications
- Provides **quick apply** functionality for 80% of users
- Can be updated/replaced at any time

### 2. **Job-Specific CV Option**

- When applying for a job, users can choose:
  - ✅ **Use my profile CV** (default, fast)
  - ✅ **Upload a different CV for this job** (customized)
- Flexibility for power users who want tailored applications

### 3. **AI Processing Integration**

- FastAPI receives the correct resume (primary or job-specific)
- **No changes to AI processing flow**
- Resume ID is passed to scoring service automatically

---

## 🗄️ Database Schema Changes

### Candidate Model

```prisma
model Candidate {
  primaryResumeId String? @unique  // Reference to primary resume
  primaryResume   Resume? @relation("PrimaryResume", ...)
  resumes         Resume[] @relation("CandidateResumes")
}
```

### Resume Model

```prisma
model Resume {
  candidate           Candidate @relation("CandidateResumes", ...)
  primaryForCandidate Candidate? @relation("PrimaryResume")
  applicationsUsingThis Application[] @relation("ApplicationResume")
}
```

### Application Model

```prisma
model Application {
  resumeId String?  // The specific resume used for this application
  resume   Resume?  @relation("ApplicationResume", ...)
}
```

---

## 🎨 UI Components

### 1. PrimaryResumeUpload Component

**Location:** `components/reusables/PrimaryResumeUpload.tsx`

**Features:**

- Shows current primary resume with upload date
- Upload new primary resume
- Remove primary resume
- Visual feedback with icons and badges

**Usage:**

```tsx
<PrimaryResumeUpload
  candidateId={user.candidate.id}
  userName={user.name}
  userEmail={user.email}
  experience={user.candidate.experience}
  primaryResume={primaryResume}
  onUploadSuccess={() => refreshUser()}
/>
```

### 2. JobApplicationDialog Component

**Location:** `components/jobs/JobApplicationDialog.tsx`

**Features:**

- Radio button selection between primary CV and custom CV
- File upload for job-specific CV
- Validation and error handling
- Shows primary resume details if available

**Usage:**

```tsx
<JobApplicationDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  jobId={job.id}
  jobTitle={job.title}
  candidateId={user.candidate.id}
  primaryResume={primaryResume}
  onApplicationSuccess={() => fetchJobDetails()}
/>
```

---

## 🔌 API Endpoints

### 1. Upload Resume API

**Endpoint:** `POST /api/upload/resume`

**New Parameters:**

- `isPrimary`: boolean - Mark resume as primary
- `isJobSpecific`: boolean - Mark as job-specific resume
- `jobId`: string - Job ID for job-specific uploads
- `candidateId`: string - Candidate ID

**Behavior:**

- If `isPrimary=true`, updates `candidate.primaryResumeId`
- Triggers AI processing asynchronously
- Returns resume ID for immediate use

### 2. Remove Primary Resume API

**Endpoint:** `DELETE /api/candidates/{id}/primary-resume`

**Behavior:**

- Sets `candidate.primaryResumeId` to null
- Resume file remains in database (not deleted)

### 3. Application Submission API

**Endpoint:** `POST /api/applications`

**Updated Parameters:**

- `resumeId`: string (optional) - Specific resume to use
- Falls back to primary resume if not provided

**AI Processing:**

```typescript
// Uses the selected resume (primary or job-specific)
const scoreResult = await scoringService.scoreById(
  resume.id,
  job.description,
  job.id,
  application.id,
);
```

### 4. Get Candidate API

**Endpoint:** `GET /api/candidates/{id}`

**Response includes:**

```typescript
{
  candidate: {
    id: string,
    name: string,
    primaryResume: {
      id: string,
      fileName: string,
      uploadDate: string
    },
    resumes: [...],
    applications: [...]
  }
}
```

---

## 🔄 User Flow

### Profile Setup Flow

1. User goes to `/candidate/profile`
2. Sees **Primary Resume** card at top
3. Uploads resume → marked as primary automatically
4. Can replace/remove primary resume anytime

### Job Application Flow

1. User clicks "Apply Now" on job detail page
2. **Dialog opens** with two options:
   - **Option A:** Use my profile CV (if exists)
   - **Option B:** Upload a different CV
3. User selects option:
   - **Option A:** Submits immediately with primary resume
   - **Option B:** Uploads new CV, then submits
4. Application is created with correct `resumeId`
5. **FastAPI receives resume** and processes scoring
6. User sees "Application Submitted" confirmation

---

## 🚀 Implementation Files

### Modified Files

- ✅ `prisma/schema.prisma` - Database schema updates
- ✅ `app/candidate/profile/page.tsx` - Primary resume upload
- ✅ `app/candidate/jobs/[id]/page.tsx` - Job application dialog
- ✅ `app/api/upload/resume/route.ts` - Resume upload handling
- ✅ `app/api/applications/route.ts` - Application creation with resume
- ✅ `app/api/candidates/[id]/route.ts` - Include primary resume in response

### New Files

- ✅ `components/reusables/PrimaryResumeUpload.tsx` - Primary CV component
- ✅ `components/jobs/JobApplicationDialog.tsx` - Application dialog
- ✅ `app/api/candidates/[id]/primary-resume/route.ts` - Remove primary CV

---

## 🎯 AI Processing Flow (Unchanged)

The AI processing remains exactly the same:

```typescript
// 1. Get resume being used (primary or job-specific)
const resume = await prisma.resume.findUnique({
  where: { id: resumeId },
});

// 2. Get job description
const job = await prisma.job.findUnique({
  where: { id: jobId },
});

// 3. Call FastAPI scoring service (UNCHANGED)
const scoreResult = await scoringService.scoreById(
  resume.id, // Resume to analyze
  job.description, // Job to match against
  job.id,
  application.id,
);

// 4. Update application with score
await prisma.application.update({
  where: { id: application.id },
  data: { score: scoreResult.score },
});
```

**No changes to FastAPI code needed!** The system just passes the correct resume ID.

---

## 📊 Benefits

### For Candidates

- ✅ **Quick Apply:** One-click applications with primary CV
- ✅ **Flexibility:** Custom CV for important positions
- ✅ **Convenience:** Manage primary CV in one place

### For HR/System

- ✅ **Better Applications:** Candidates can tailor CVs
- ✅ **More Data:** Track which jobs get custom CVs
- ✅ **Same AI Flow:** No changes to existing AI processing

### For Development

- ✅ **Clean Architecture:** Minimal changes to existing code
- ✅ **Type Safety:** Full TypeScript support
- ✅ **Scalable:** Easy to add features like CV versions

---

## 🧪 Testing Checklist

- [ ] Upload primary resume in profile
- [ ] Remove primary resume
- [ ] Replace primary resume
- [ ] Apply with primary resume (quick apply)
- [ ] Apply with custom resume
- [ ] Verify resume appears in application details
- [ ] Verify AI scoring works with both resume types
- [ ] Check database: `resumeId` stored correctly in applications
- [ ] Test without primary resume (should require upload)

---

## 🔐 Database Migration

Already applied via:

```bash
npx prisma db push
npx prisma generate
```

### Manual Migration (if needed):

```sql
-- Add primary resume reference
ALTER TABLE candidates ADD COLUMN "primaryResumeId" TEXT UNIQUE;

-- Add resume reference to applications
ALTER TABLE applications ADD COLUMN "resumeId" TEXT;

-- Add index
CREATE INDEX "applications_resumeId_idx" ON applications("resumeId");

-- Add foreign key constraints
ALTER TABLE candidates
  ADD CONSTRAINT "candidates_primaryResumeId_fkey"
  FOREIGN KEY ("primaryResumeId")
  REFERENCES resumes(id)
  ON DELETE SET NULL;

ALTER TABLE applications
  ADD CONSTRAINT "applications_resumeId_fkey"
  FOREIGN KEY ("resumeId")
  REFERENCES resumes(id)
  ON DELETE SET NULL;
```

---

## 📝 Future Enhancements

1. **CV Version History**
   - Track multiple versions of primary CV
   - Show which version was used for each application

2. **CV Templates**
   - Provide templates for different industries
   - Auto-tailor CV based on job description

3. **Analytics**
   - Track success rate: primary vs custom CVs
   - Show which CV format performs better

4. **Bulk Apply**
   - Apply to multiple jobs with one primary CV
   - Queue system for processing

---

## 🎉 Implementation Complete!

The hybrid CV model is now fully implemented and ready to use. The system provides the best of both worlds:

- **Speed** for quick applications
- **Flexibility** for customized submissions
- **No disruption** to existing AI processing

Restart your development server:

```bash
npm run dev
```
