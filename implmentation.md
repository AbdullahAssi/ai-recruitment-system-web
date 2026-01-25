# Fast APIs - Example API Calls

This file contains example API calls for testing all the new services.

## Prerequisites

- Server running on `http://localhost:8000`
- Environment configured with OpenAI API key
- Sample files available in `data/` directory

---

## 1. PARSING SERVICE

### Extract Text from PDF

```bash
curl -X POST "http://localhost:8000/api/v1/parsing/extract-pdf" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@data/sample_resume.pdf" \
  -F "use_ocr_fallback=true"
```

### Extract Text (Auto-detect Format)

```bash
curl -X POST "http://localhost:8000/api/v1/parsing/extract-text" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@data/sample_resume.pdf"
```

### Get Available Parsing Methods

```bash
curl -X GET "http://localhost:8000/api/v1/parsing/methods" \
  -H "accept: application/json"
```

---

## 2. QUIZ GENERATION SERVICE

### Generate Quiz

```bash
curl -X POST "http://localhost:8000/api/v1/quiz/generate" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "We are looking for a Senior Python Developer with 5+ years of experience. Must have expertise in Django, FastAPI, PostgreSQL, and cloud services (AWS/Azure). Experience with Docker and CI/CD is required. Strong problem-solving skills and ability to mentor junior developers.",
    "num_questions": 5,
    "difficulty": "medium",
    "question_types": ["technical", "behavioral"]
  }'
```

### Generate Personalized Quiz (with Resume Data)

```bash
curl -X POST "http://localhost:8000/api/v1/quiz/generate" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Senior Python Developer position requiring FastAPI and PostgreSQL expertise",
    "resume_data": {
      "name": "John Doe",
      "skills": ["Python", "FastAPI", "Django", "PostgreSQL"],
      "experience_years": 3,
      "education_level": "Bachelor in Computer Science"
    },
    "num_questions": 5,
    "difficulty": "medium"
  }'
```

### Validate Single Answer

```bash
curl -X POST "http://localhost:8000/api/v1/quiz/validate-answer" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "question": {
      "id": 1,
      "question": "What is the primary purpose of async/await in Python?",
      "options": {
        "A": "To make code run faster",
        "B": "To handle concurrent operations efficiently",
        "C": "To create parallel processes",
        "D": "To manage memory allocation"
      },
      "correct_answer": "B",
      "explanation": "async/await enables efficient concurrent programming using coroutines"
    },
    "user_answer": "B"
  }'
```

### Submit Complete Quiz

```bash
curl -X POST "http://localhost:8000/api/v1/quiz/submit" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [
      {
        "id": 1,
        "question": "What is FastAPI built on?",
        "options": {"A": "Flask", "B": "Django", "C": "Starlette", "D": "Tornado"},
        "correct_answer": "C"
      },
      {
        "id": 2,
        "question": "Which database is best for time-series data?",
        "options": {"A": "MySQL", "B": "PostgreSQL", "C": "MongoDB", "D": "TimescaleDB"},
        "correct_answer": "D"
      }
    ],
    "answers": {
      "1": "C",
      "2": "D"
    }
  }'
```

### Generate Personalized Feedback

```bash
curl -X POST "http://localhost:8000/api/v1/quiz/feedback?job_description=Senior%20Python%20Developer" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "skills": ["Python", "Django", "PostgreSQL"],
    "experience_years": 3,
    "education_level": "Bachelor in Computer Science",
    "summary": "Experienced Python developer with expertise in web development"
  }'
```

---

## 3. MATCHING SERVICE

### Match Candidates to Job

```bash
curl -X POST "http://localhost:8000/api/v1/match/jobs" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Senior Full Stack Developer with 5+ years experience. Required skills: Python, React, PostgreSQL, Docker, AWS. Preferred: FastAPI, TypeScript, CI/CD experience.",
    "candidates": [
      {
        "id": "candidate_1",
        "name": "John Doe",
        "skills": ["Python", "React", "PostgreSQL", "Docker", "FastAPI"],
        "experience_years": 6,
        "education_level": "Bachelor in Computer Science",
        "summary": "Experienced full-stack developer with strong Python and React skills"
      },
      {
        "id": "candidate_2",
        "name": "Jane Smith",
        "skills": ["Java", "Angular", "MySQL", "Jenkins"],
        "experience_years": 5,
        "education_level": "Master in Software Engineering",
        "summary": "Backend specialist with focus on Java and microservices"
      },
      {
        "id": "candidate_3",
        "name": "Bob Johnson",
        "skills": ["Python", "Django", "PostgreSQL", "AWS", "Docker", "Kubernetes"],
        "experience_years": 8,
        "education_level": "Bachelor in Computer Science",
        "summary": "Senior developer specializing in Python backend and cloud infrastructure"
      }
    ],
    "top_k": 10,
    "min_score": 0.5
  }'
```

### Create Candidate Index (for faster matching)

```bash
curl -X POST "http://localhost:8000/api/v1/match/index" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "candidates": [
      {
        "id": "1",
        "name": "John Doe",
        "skills": ["Python", "FastAPI", "PostgreSQL"],
        "experience_years": 5,
        "education_level": "Bachelor"
      },
      {
        "id": "2",
        "name": "Jane Smith",
        "skills": ["Java", "Spring Boot", "MongoDB"],
        "experience_years": 4,
        "education_level": "Master"
      }
    ]
  }'
```

### Semantic Search

```bash
curl -X POST "http://localhost:8000/api/v1/match/search" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "experienced Python developer with cloud skills",
    "documents": [
      {
        "id": "resume_1",
        "text": "Senior Software Engineer with 5 years of Python development experience. Proficient in Django, FastAPI, and AWS cloud services. Led multiple projects involving microservices architecture."
      },
      {
        "id": "resume_2",
        "text": "Full-stack developer specializing in JavaScript and React. 3 years of experience building web applications. Some exposure to Node.js backend development."
      },
      {
        "id": "resume_3",
        "text": "Python developer with strong background in data science and machine learning. 4 years experience with pandas, scikit-learn, and TensorFlow. Experience with Google Cloud Platform."
      }
    ],
    "top_k": 3,
    "score_threshold": 0.3
  }'
```

### Matching Service Health Check

```bash
curl -X GET "http://localhost:8000/api/v1/match/health" \
  -H "accept: application/json"
```

---

## 4. EXISTING SCORING SERVICE

### Score Resume by ID

```bash
curl -X POST "http://localhost:8000/api/v1/scoring/score-by-id" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_id": "123e4567-e89b-12d3-a456-426614174000",
    "job_description": "Senior Python Developer with 5+ years experience in Django and PostgreSQL",
    "job_id": "job_001"
  }'
```

### Score Resume with Data

```bash
curl -X POST "http://localhost:8000/api/v1/scoring/score-with-data" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_data": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "skills": ["Python", "Django", "PostgreSQL", "Docker", "AWS"],
      "experience_years": 5,
      "education_level": "Bachelor in Computer Science",
      "work_experience": [
        {
          "title": "Senior Python Developer",
          "company": "Tech Corp",
          "duration": "3 years",
          "description": "Led backend development team"
        }
      ],
      "summary": "Experienced Python developer with expertise in web development"
    },
    "job_description": "Senior Python Developer with 5+ years experience in Django and PostgreSQL. Must have cloud experience (AWS/Azure).",
    "job_id": "job_001"
  }'
```

---

## 5. HEALTH CHECK

### Root Endpoint

```bash
curl -X GET "http://localhost:8000/" \
  -H "accept: application/json"
```

### Health Check

```bash
curl -X GET "http://localhost:8000/api/v1/health" \
  -H "accept: application/json"
```

---

## Python Examples

### Using Python requests library

```python
import requests

# Base URL
BASE_URL = "http://localhost:8000/api/v1"

# 1. Generate Quiz
quiz_response = requests.post(
    f"{BASE_URL}/quiz/generate",
    json={
        "job_description": "Python Developer position",
        "num_questions": 5,
        "difficulty": "medium"
    }
)
quiz_data = quiz_response.json()
print(f"Generated {len(quiz_data['questions'])} questions")

# 2. Match Candidates
match_response = requests.post(
    f"{BASE_URL}/match/jobs",
    json={
        "job_description": "Senior Full Stack Developer",
        "candidates": [
            {
                "id": "1",
                "name": "John Doe",
                "skills": ["Python", "React"],
                "experience_years": 5
            }
        ],
        "top_k": 5
    }
)
matches = match_response.json()
print(f"Found {matches['matches_found']} matches")

# 3. Parse PDF
with open("resume.pdf", "rb") as f:
    files = {"file": f}
    parse_response = requests.post(
        f"{BASE_URL}/parsing/extract-pdf",
        files=files
    )
    parsed_data = parse_response.json()
    print(f"Extracted {parsed_data['character_count']} characters")
```

---

## Testing Tips

1. **Start Simple**: Test health endpoints first
2. **Check Logs**: Monitor server logs for errors
3. **Validate JSON**: Ensure request bodies are valid JSON
4. **File Uploads**: Use proper multipart/form-data encoding
5. **Error Handling**: Check response status codes
6. **Rate Limits**: Be mindful of API rate limits (OpenAI)

---

## Common Issues

### 1. "OpenAI API key not configured"

- Check `.env` file has `OPENAI_API_KEY=your-key`
- Restart server after updating `.env`

### 2. "Parsing method not available"

- Install missing libraries: `pip install PyPDF2 tika`
- For OCR: Install tesseract-ocr system package

### 3. "Embedding service unavailable"

- If using local: `pip install sentence-transformers`
- If using OpenAI: Check API key is valid
- Check `USE_LOCAL_EMBEDDINGS` setting in `.env`

### 4. "Database connection failed"

- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check database credentials

---

## Interactive Testing

Use the built-in Swagger UI for interactive testing:

- Navigate to: http://localhost:8000/docs
- Try out endpoints with the "Try it out" button
- View request/response schemas
- See example values

---

For more information, see:

- `REFACTORING_SUMMARY.md` - Overview of changes
- `docs/SERVICE_MODULES_GUIDE.md` - Detailed service documentation
- Interactive API docs at `/docs` when server is running
