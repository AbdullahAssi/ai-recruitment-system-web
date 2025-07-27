# 🚀 Complete End-to-End AI Recruitment System Test Guide

## Prerequisites ✅

- ✅ Next.js server running on port 3001
- ✅ AI models configured with OpenAI API key
- ✅ PostgreSQL database connected
- ✅ All dependencies installed

## 🧪 Step-by-Step Testing Workflow

### Step 1: Upload Resume as Candidate

1. **Navigate to**: `http://localhost:3001/candidate`
2. **Fill the form**:
   - Name: `John Doe`
   - Email: `john.doe@test.com`
   - Experience: `5` (years)
3. **Upload a resume**: Choose a PDF, DOCX, DOC, or TXT file
4. **Click Submit**
5. **Expected Result**:
   - ✅ Success message with candidate ID
   - 🤖 AI processing starts automatically in background
   - Resume data extracted and stored in database

### Step 2: Check Available Jobs

1. **Navigate to**: `http://localhost:3001/jobs`
2. **View available positions**
3. **Note down a job ID** for application

### Step 3: Apply for a Job

1. **On the jobs page**, find a suitable position
2. **Click "Apply Now"**
3. **Enter your candidate ID** (from Step 1)
4. **Submit application**
5. **Expected Result**:
   - ✅ Application submitted successfully
   - 🤖 AI scoring initiated automatically
   - Message: "Application submitted successfully! AI scoring in progress..."

### Step 4: Check AI Processing Results

Wait a few moments for AI processing to complete, then check:

#### Option A: Database Check

```sql
-- Check extracted resume data
SELECT name, email, skills_json, experience_json
FROM resumes
WHERE email = 'john.doe@test.com';

-- Check AI scores
SELECT r.name, cs.score, cs.explanation, cs.scored_at
FROM cv_scores cs
JOIN resumes r ON cs.resume_id = r.id
WHERE r.email = 'john.doe@test.com';

-- Check application with score
SELECT a.score, a.status, c.name, j.title
FROM applications a
JOIN candidates c ON a.candidateId = c.id
JOIN jobs j ON a.jobId = j.id
WHERE c.email = 'john.doe@test.com';
```

#### Option B: API Check

```bash
# Get application details with AI score
curl http://localhost:3001/api/applications/[APPLICATION_ID]

# Get resume processing results
curl http://localhost:3001/api/ai/process?resumeId=[RESUME_ID]
```

## 🎯 Expected AI Processing Results

### Resume Data Extraction

The AI should extract:

```json
{
  "Name": "John Doe",
  "Email": "john.doe@test.com",
  "Skills": {
    "Languages": ["JavaScript", "Python", "TypeScript"],
    "Frameworks": ["React", "Node.js", "Next.js"],
    "Tools": ["Git", "Docker", "AWS"]
  },
  "Work Experience": [...],
  "Projects": [...],
  "Certifications": [...]
}
```

### AI Scoring Results

```json
{
  "resume_id": "xxx-xxx-xxx",
  "score": 85,
  "explanation": "Strong match with required skills. Candidate has 5 years experience in React and Node.js, which aligns well with the Senior Full Stack Developer requirements..."
}
```

## 🔍 Verification Points

### ✅ Resume Upload & Processing

- [ ] File uploaded successfully to `uploads/` directory
- [ ] Candidate record created in database
- [ ] Resume record created with file path
- [ ] AI processing triggered automatically
- [ ] Resume text extracted (for PDF/DOCX files)
- [ ] Structured data extracted by OpenAI
- [ ] Database updated with extracted information

### ✅ Job Application & Scoring

- [ ] Application record created
- [ ] AI scoring triggered on job application
- [ ] Resume scored against job description
- [ ] Score (0-100) calculated with explanation
- [ ] Application score updated in database
- [ ] CV score record created

### ✅ API Responses

- [ ] Upload API returns candidate and resume IDs
- [ ] Application API confirms AI scoring initiation
- [ ] Processing API shows extracted data
- [ ] Scoring API shows calculated scores

## 🐛 Common Issues & Solutions

### Issue 1: File Upload Fails

- **Check**: File type is supported (PDF, DOCX, DOC, TXT)
- **Check**: File size is reasonable (< 10MB)
- **Check**: `uploads/` directory exists and is writable

### Issue 2: AI Processing Fails

- **Check**: OpenAI API key is valid in `ai_models/.env`
- **Check**: Python dependencies installed (`pip install -r requirements.txt`)
- **Check**: Database connection works
- **Solution**: Check terminal logs for detailed error messages

### Issue 3: Scoring Doesn't Work

- **Check**: LangChain dependencies installed
- **Check**: Resume data was extracted successfully
- **Check**: Job description exists in database
- **Solution**: Test scoring directly: `python ai_service.py --file data/sample.txt --job "job description"`

### Issue 4: Database Errors

- **Check**: PostgreSQL connection string in `.env`
- **Check**: Prisma migrations applied (`npx prisma migrate dev`)
- **Check**: Database tables exist

## 🧪 Test Cases

### Test Case 1: PDF Resume

- Upload a PDF resume
- Verify text extraction works
- Check AI processing extracts skills correctly

### Test Case 2: DOCX Resume

- Upload a DOCX resume
- Verify formatting is preserved in extraction
- Check all sections are parsed

### Test Case 3: Different Job Types

- Apply same resume to different job positions
- Verify scores vary based on job requirements
- Check explanations are job-specific

### Test Case 4: Multiple Candidates

- Upload resumes for different candidates
- Apply to same job
- Compare AI scores and rankings

## 📊 Success Metrics

### Functional Success

- [ ] 100% file upload success rate
- [ ] AI processing completes within 30 seconds
- [ ] Scoring accuracy > 80% (manual verification)
- [ ] No database errors or data corruption

### User Experience Success

- [ ] Clear feedback messages throughout process
- [ ] Loading states for AI processing
- [ ] Error handling with helpful messages
- [ ] Responsive UI on all devices

## 🚀 Production Readiness Checklist

- [ ] Environment variables secured
- [ ] API rate limiting implemented
- [ ] Error logging and monitoring
- [ ] File size and type validation
- [ ] Background job processing
- [ ] Database connection pooling
- [ ] AI processing cost monitoring

## 🎉 Next Steps After Testing

1. **Frontend Enhancements**: Add AI score display in candidate/HR dashboards
2. **Batch Processing**: Implement bulk resume processing
3. **Advanced Matching**: Add skill-based job recommendations
4. **Analytics**: Integrate AI insights into HR analytics dashboard
5. **Notifications**: Add email notifications for application updates

---

**Ready to test!** 🚀 Navigate to `http://localhost:3001/candidate` and start the complete workflow!
