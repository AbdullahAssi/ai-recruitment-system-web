# AI Models Integration Guide

This document explains how the AI models integrate with your Next.js recruitment system to provide automated resume processing and scoring.

## 🔄 Workflow Overview

The complete workflow when a candidate uploads a resume:

1. **Resume Upload** (`/api/upload/resume`)
   - Candidate uploads CV through frontend
   - File saved to `uploads/` directory
   - Candidate and Resume records created in database
   - **AI processing automatically triggered**

2. **AI Processing** (`/api/ai/process`)
   - Resume text extracted (supports PDF, DOCX, DOC, TXT)
   - OpenAI GPT extracts structured data (name, email, skills, experience, projects)
   - Database updated with extracted information

3. **AI Scoring** (`/api/ai/score`)
   - Resume scored against specific job descriptions
   - Intelligent matching using LangChain + OpenAI
   - Scores (0-100) with explanations saved to database

## 📁 File Structure

```
ai_models/
├── ai_service.py          # Main AI processing service
├── main.py               # OpenAI text extraction
├── db.py                 # Database operations (PostgreSQL/Prisma)
├── text_extractor.py     # Multi-format text extraction
├── scoring_agent/
│   ├── scorer.py         # Resume scoring engine
│   ├── langchain_chain.py # LangChain scoring logic
│   └── retriever.py      # Knowledge base retrieval
├── requirements.txt      # Python dependencies
├── package.json         # Prisma dependencies
└── .env                 # Environment variables
```

## 🚀 API Endpoints

### 1. Process Resume with AI
```http
POST /api/ai/process
Content-Type: application/json

{
  "resumeId": "resume_id_here",
  "jobDescription": "optional_job_description"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "resume_id": "...",
    "extracted_data": {
      "Name": "John Doe",
      "Email": "john@example.com",
      "Skills": ["JavaScript", "React", "Node.js"],
      "Work Experience": [...],
      "Projects": [...],
      "Certifications": [...]
    },
    "scoring_result": {
      "score": 85,
      "explanation": "Strong match with required skills..."
    }
  }
}
```

### 2. Score Resume Against Job
```http
POST /api/ai/score
Content-Type: application/json

{
  "resumeId": "resume_id_here",
  "jobId": "job_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "scoring_result": {
      "score": 85,
      "explanation": "Candidate shows strong experience in required technologies..."
    }
  },
  "job": {
    "id": "...",
    "title": "Senior Developer",
    "location": "Remote"
  }
}
```

### 3. Get Resume Data with Scores
```http
GET /api/ai/process?resumeId=resume_id_here
```

## 🛠 Setup Instructions

### 1. Install Dependencies
```bash
# Run from project root
python setup_ai_integration.py
```

### 2. Environment Variables
Create `ai_models/.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_neon_database_url_here
```

### 3. Test the Integration
```bash
# Test resume processing
cd ai_models
python ai_service.py --file path/to/resume.pdf

# Test scoring
cd scoring_agent
python scorer.py
```

## 🔧 Manual Commands

### Process Single Resume
```bash
cd ai_models
python ai_service.py --file uploads/resume.pdf --resume-id resume_123
```

### Score Resume Against Job
```bash
cd ai_models
python ai_service.py --file uploads/resume.pdf --resume-id resume_123 --job "Job description here"
```

### Check Dependencies
```bash
cd ai_models
python text_extractor.py --check
```

## 📊 Database Schema

The AI system works with these models:

### Resume Model
```prisma
model Resume {
  id                  String    @id @default(cuid())
  candidateId         String
  filePath            String
  fileName            String
  extractedText       String?
  
  // AI-extracted fields
  name                String?
  email               String?
  linkedin            String?
  github              String?
  skills_json         String?
  experience_json     String?
  projects_json       String?
  certifications_json String?
  
  cvScores            CvScore[]
  candidate           Candidate @relation(...)
}
```

### CvScore Model
```prisma
model CvScore {
  id              String   @id @default(cuid())
  resume_id       String
  job_description String?
  score           Int?
  explanation     String?
  scored_at       DateTime @default(now())
  
  resume          Resume   @relation(...)
}
```

## 🔄 Integration Flow

### Frontend Upload → AI Processing

1. **User uploads resume** in candidate portal
2. **Next.js API** saves file and creates database records
3. **AI processing triggered** automatically via `/api/ai/process`
4. **Python service** extracts and processes resume data
5. **Database updated** with structured information
6. **Optional scoring** against job descriptions

### Automatic vs Manual Processing

- **Automatic**: Triggered on resume upload
- **Manual**: Call `/api/ai/process` with specific parameters
- **Batch**: Process multiple resumes using Python scripts

## 🎯 Scoring System

The AI scoring system evaluates resumes against job descriptions using:

1. **Skills Matching**: Compares candidate skills with job requirements
2. **Experience Relevance**: Analyzes work experience alignment
3. **Project Portfolio**: Reviews project relevance and complexity
4. **Contextual Understanding**: Uses LangChain for intelligent interpretation

**Scoring Range**: 0-100
- **90-100**: Excellent match
- **80-89**: Very good match
- **70-79**: Good match
- **60-69**: Fair match
- **Below 60**: Poor match

## 🚨 Troubleshooting

### Common Issues

1. **Python dependencies missing**
   ```bash
   cd ai_models
   pip install -r requirements.txt
   ```

2. **Database connection failed**
   - Check `DATABASE_URL` in `.env`
   - Ensure Neon database is accessible

3. **OpenAI API errors**
   - Verify `OPENAI_API_KEY` in `.env`
   - Check API usage limits

4. **File processing errors**
   - Install additional dependencies:
   ```bash
   pip install PyPDF2 python-docx textract
   ```

### Debug Commands

```bash
# Test database connection
cd ai_models
python -c "from db import get_db_connection; conn = get_db_connection(); print('OK')"

# Test OpenAI connection
python -c "from main import extract_cv_info; print('OK')"

# Check file processing
python text_extractor.py --file path/to/file.pdf
```

## 📈 Performance Optimization

### For Production

1. **Background Processing**: Use job queues (Redis/Bull) for heavy AI processing
2. **Caching**: Cache OpenAI responses to reduce API calls
3. **Batch Processing**: Process multiple resumes in batches
4. **Rate Limiting**: Implement proper rate limiting for OpenAI API

### Monitoring

- Track AI processing success rates
- Monitor OpenAI API usage and costs
- Log scoring accuracy and user feedback

## 🔐 Security Considerations

1. **API Keys**: Store securely in environment variables
2. **File Validation**: Validate file types and sizes
3. **Rate Limiting**: Prevent API abuse
4. **Data Privacy**: Handle resume data according to privacy regulations

## 🤝 Contributing

When modifying the AI system:

1. Update Python dependencies in `requirements.txt`
2. Test with different file formats
3. Validate database schema changes
4. Update API documentation
5. Test integration with frontend

## 📞 Support

For issues with the AI integration:

1. Check logs in AI processing APIs
2. Verify environment variables
3. Test individual components
4. Review database connections
5. Validate file formats and content
