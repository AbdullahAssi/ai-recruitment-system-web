# 🚀 Recruit.ai - AI-Powered Recruitment Platform

An intelligent recruitment management system built with Next.js 13+, featuring AI-powered resume scoring, candidate matching, quiz assessments, and role-based access control.

![Next.js](https://img.shields.io/badge/Next.js-13.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.12-2D3748?logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?logo=tailwind-css)

---

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based authentication with HTTP-only cookies
- Role-based access control (CANDIDATE, HR, ADMIN)
- Secure password hashing with bcrypt
- Protected routes with middleware

### 👔 HR Portal (`/hr`)

- **Dashboard** - Recruitment analytics and quick stats
- **Jobs** - Create, edit, and manage job postings
- **Candidates** - View applicants, filter, and bulk email
- **Email Templates** - Manage communication templates
- **Company** - Company profile management
- **Analytics** - Recruitment insights and charts

### 👤 Candidate Portal (`/candidate`)

- **Dashboard** - Application status overview
- **Browse Jobs** - Search and filter job listings
- **My Applications** - Track application progress
- **Profile** - Update info and upload resume

### 🧠 AI Features (via FastAPI Backend)

- **Resume Parsing** - Extract structured data from PDF/DOCX
- **CV Scoring** - AI-powered resume-job matching (0-100 score)
- **Quiz Generation** - Auto-generate job-specific assessments
- **Candidate Matching** - Semantic search with vector embeddings

---

## 🏗️ Project Structure

```
cv-jd/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── jobs/                 # Job CRUD operations
│   │   ├── candidates/           # Candidate management
│   │   ├── applications/         # Application handling
│   │   └── fastapi/              # Proxy to Python AI services
│   ├── hr/                       # HR portal pages
│   ├── candidate/                # Candidate portal pages
│   └── auth/                     # Login/register pages
├── components/
│   ├── ui/                       # ShadCN UI components
│   ├── hr/                       # HR-specific components
│   ├── candidates/               # Candidate components
│   ├── jobs/                     # Job-related components
│   ├── quiz/                     # Quiz components
│   └── matching/                 # Matching components
├── hooks/                        # Custom React hooks
├── lib/
│   ├── fastapi.ts                # FastAPI client
│   ├── auth.ts                   # Auth utilities
│   ├── prisma.ts                 # Prisma client
│   └── emailService.ts           # Nodemailer service
├── contexts/
│   └── AuthContext.tsx           # Global auth state
├── prisma/
│   └── schema.prisma             # Database schema
└── middleware.ts                 # Route protection
```

---

## 🛠️ Tech Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| **Framework**  | Next.js 13.5 (App Router) |
| **Language**   | TypeScript                |
| **Styling**    | TailwindCSS, ShadCN UI    |
| **Database**   | PostgreSQL with pgvector  |
| **ORM**        | Prisma                    |
| **Auth**       | JWT (jose), bcrypt        |
| **Charts**     | Recharts                  |
| **Email**      | Nodemailer                |
| **AI Backend** | FastAPI (Python)          |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (with pgvector extension)
- FastAPI backend running (see [Fast APIs README](../Fast%20APIs/README.md))

### Installation

1. **Clone and install dependencies**

```bash
cd cv-jd
npm install
```

2. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/recruitment_db"

# JWT Secret (min 32 characters)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# FastAPI Backend
NEXT_PUBLIC_FASTAPI_URL="http://localhost:8000/api/v1"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

3. **Setup database**

```bash
npx prisma generate
npx prisma migrate dev
```

4. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📊 Database Schema

### Core Models

| Model               | Description                            |
| ------------------- | -------------------------------------- |
| `User`              | Authentication (email, password, role) |
| `Candidate`         | Job seeker profile                     |
| `HRProfile`         | HR staff profile                       |
| `Company`           | Company details                        |
| `Job`               | Job postings with embeddings           |
| `Resume`            | Uploaded CVs with parsed data          |
| `Application`       | Job applications                       |
| `CvScore`           | AI scoring results                     |
| `Quiz` / `Question` | Assessment system                      |
| `EmailTemplate`     | Email templates                        |

---

## 🔐 Authentication Flow

1. **Register** → Password hashed → JWT generated → Cookie set
2. **Login** → Credentials verified → JWT issued → Redirected by role
3. **Protected Routes** → Middleware validates JWT → Role checked

### Test Accounts

```
HR User:
  Email: hr@test.com
  Password: Test1234

Candidate:
  Email: candidate@test.com
  Password: Test1234
```

---

## 📡 API Routes

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | User registration |
| POST   | `/api/auth/login`    | User login        |
| POST   | `/api/auth/logout`   | User logout       |
| GET    | `/api/auth/me`       | Get current user  |

### Jobs

| Method | Endpoint         | Description     |
| ------ | ---------------- | --------------- |
| GET    | `/api/jobs`      | List all jobs   |
| POST   | `/api/jobs`      | Create job      |
| GET    | `/api/jobs/[id]` | Get job details |
| PUT    | `/api/jobs/[id]` | Update job      |

### Candidates

| Method | Endpoint               | Description     |
| ------ | ---------------------- | --------------- |
| GET    | `/api/candidates`      | List candidates |
| GET    | `/api/candidates/[id]` | Get candidate   |

### Applications

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| GET    | `/api/applications` | List applications  |
| POST   | `/api/applications` | Submit application |

---

## 🧪 Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database operations
npx prisma studio     # Open Prisma GUI
npx prisma migrate dev # Run migrations
npx prisma db seed    # Seed database
```

---

## 📁 Related Projects

- **[Fast APIs](../Fast%20APIs/)** - Python FastAPI backend for AI services

---

## 📄 License

This project is part of a Final Year Project (FYP).

---

## 👥 Contributors

- Abdullah Assi - [GitHub](https://github.com/AbdullahAssi)
