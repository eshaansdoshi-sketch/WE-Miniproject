# AI-Powered Hiring Evaluation System

An end-to-end recruitment platform that uses AI to analyze resumes, screen candidates against job roles, and conduct role-based MCQ assessments.

## 🚀 Features

- **Auth**: Supabase Authentication with email/password.
- **Role-Based Routing**: Admin dashboard for HR/Admins, and a structured application flow for Candidates.
- **Job Role Management**: Admins can define job roles with specific required/preferred skills and minimum experience levels.
- **Resume Analysis**: AI-driven resume scoring and skill extraction.
- **Screening**: Real-time screening of candidates against job requirements.
- **Strictly Role-Based Testing**: Automatically assigns and retrieves MCQ tests based ONLY on the selected job role's required skills.
- **Automated Test Generation**: AI generates questions for skills if tests don't already exist.
- **Performance Reporting**: Comprehensive candidate feedback and interview readiness scoring.

## 📁 Project Structure

```text
/
├── backend/                # FastAPI Application
│   ├── main.py             # Main API entry point & routes
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Backend environment variables
│   ├── sql/                # SQL setup scripts for Supabase
│   │   ├── job_roles.sql
│   │   ├── user_roles.sql
│   │   └── test_submissions.sql
│   └── services/           # Business logic & AI modules
│       ├── ai_resume_analyzer.py
│       ├── qualification_engine.py
│       ├── test_generator.py
│       ├── test_scorer.py
│       ├── feedback_generator.py
│       └── ...
│
├── frontend/               # React + Vite Application
│   ├── package.json        # Frontend dependencies
│   ├── .env                # React environment variables
│   ├── src/
│   │   ├── main.jsx        # App entry point
│   │   ├── App.jsx         # Routing & Layout
│   │   ├── api.js          # API client for backend
│   │   ├── AuthContext.jsx # Supabase Auth context
│   │   ├── UserContext.jsx # Candidate progress context
│   │   ├── supabaseClient.js
│   │   ├── index.css
│   │   └── pages/          # UI Pages
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── Apply.jsx
│   │       ├── ResumeUpload.jsx
│   │       ├── Screening.jsx
│   │       ├── TestPage.jsx
│   │       └── HRDashboard.jsx
└── ...
```

## 🛠️ Setup Instructions

### Backend Setup
1. Navigate to `/backend`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Configure `.env` with Supabase and AI API credentials.
4. Run server: `uvicorn main:app --reload`.

### Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Configure `.env` with Supabase credentials.
4. Run development server: `npm run dev`.

### Database Setup
Execute the SQL files located in `backend/sql/` within your Supabase SQL Editor.
