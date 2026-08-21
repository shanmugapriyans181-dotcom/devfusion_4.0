# 🚀 HireAI ATS — AI-Powered Recruitment & Applicant Tracking System
> **DevFusion 4.0 Hackathon Submission — Problem Statement 2: AI-Powered Recruitment & Applicant Tracking System (ATS)**

[![Tech Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20TypeScript%20%7C%20Node.js%20%7C%20Prisma%20%7C%20PostgreSQL-blue.svg)](#-tech-stack)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](#-docker-deployment)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

---

## 📌 Executive Summary

**HireAI ATS** is a production-ready, full-stack enterprise recruitment application designed to streamline the modern hiring lifecycle—from job creation and candidate sourcing to AI-assisted resume screening, interview scheduling, Monaco coding assessments, offer letter generation, and executive analytics.

Built for **DevFusion 4.0 Hackathon**, the system features strict **Role-Based Access Control (RBAC)** across **5 distinct user roles**, real-time notifications, interactive Kanban recruitment workflows, and an OpenAI-backed resume analysis engine.

---

## 🔑 Demo Credentials (Quick Login)

All demo accounts share the password: `DemoPassword123!`

| Role | Email | Capabilities |
| --- | --- | --- |
| 🛡️ **Admin** | `admin@demo.com` | Full platform control, audit logs, system settings, user & company management |
| 💼 **Recruiter** | `recruiter@demo.com` | Post jobs, Kanban stage movement, schedule interviews, send offer letters, view candidate scores |
| 📊 **Hiring Manager** | `manager@demo.com` | Review shortlisted candidates, approve hiring decisions, inspect feedback, view analytics |
| 🎯 **Interviewer** | `interviewer@demo.com` | View assigned interviews, score candidates (1-5 ratings), submit detailed feedback |
| 👤 **Candidate** | `candidate@demo.com` | Search jobs, auto-fill profile via resume upload, track applications, take coding tests, accept/reject offers |

---

## ✨ Key Features & PDF Requirement Matrix

| DevFusion 4.0 Requirement | Implementation Status | Features & Details |
| --- | :---: | --- |
| **Authentication & RBAC** | ✅ Complete | JWT + Secure Refresh Cookies, Google OAuth, Email/Password, Email Verification, Password Reset, 5-Role RBAC |
| **Landing Page** | ✅ Complete | Hero section, features, testimonials, pricing, FAQ, dark/light mode toggle, SEO tags |
| **Job Management** | ✅ Complete | Job posting (salary, skills, work mode, location, deadline), edit, close, duplicate, delete jobs |
| **Resume Upload & AI Parsing** | ✅ Complete | PDF/DOCX support (up to 10MB), automated field extraction (skills, experience, education) |
| **AI Resume Matching** | ✅ Complete | Match percentage score, missing skills detection, strengths/weaknesses breakdown, recommendation logic |
| **Kanban Application Pipeline** | ✅ Complete | Drag-and-drop candidates across 8 hiring stages (`Applied` → `Hired`/`Rejected`) |
| **Interview Scheduler** | ✅ Complete | Interviewer selection, date/time scheduling, Zoom/Google Meet link auto-generation, calendar invites |
| **Coding Assessment Engine** | ✅ Complete | Integrated Monaco Code Editor with timer, auto-submission, tab-switch cheat detection, test cases for MCQs/Coding/SQL/Debugging |
| **Interviewer Scorecards** | ✅ Complete | Score technical skills, communication, problem solving, teamwork, leadership + overall recommendation |
| **Offer Letter Generator** | ✅ Complete | Template-based offer creation (salary, joining date, benefits), candidate PDF view, Accept/Reject options |
| **Analytics & Dashboard** | ✅ Complete | Applications per job, hiring funnel, conversion rate, monthly hiring trends, time-to-hire charts |
| **Admin & Security** | ✅ Complete | User management, company settings, audit logging, rate-limiting, bcrypt hashing, input validation |

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Modern Dark/Light Theme System
- **State & Data**: TanStack React Query, React Router v6
- **Components**: Monaco Editor (`@monaco-editor/react`), Recharts

### **Backend**
- **Runtime**: Node.js, Express.js (TypeScript)
- **Database & ORM**: PostgreSQL, Prisma ORM v5
- **AI Integration**: OpenAI API (GPT-4 / GPT-3.5) with fallback structured engine
- **Authentication**: JWT, bcryptjs, HTTP-Only cookies, Zod validation middleware

### **DevOps & Deployment**
- **Containerization**: Docker & Docker Compose (`docker-compose.yml`)
- **API Specs**: Swagger / OpenAPI, Postman Collection

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18+` or `v20+`
- **npm** or **yarn**
- **Docker & Docker Compose** *(Optional for single-command start)*

---

### Method A: Docker Compose (One-Command Setup)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/hireai-ats.git
   cd hireai-ats
   ```

2. Launch full stack (Database + Backend + Frontend):
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - **Frontend App**: `http://localhost:80` (or `http://localhost:5173`)
   - **Backend API**: `http://localhost:5000/api/v1`

---

### Method B: Manual Local Setup

1. **Install Dependencies**:
   ```bash
   # Root / Backend / Frontend setup
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Prisma Setup & Seed Database**:
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:seed
   ```

4. **Run Backend API**:
   ```bash
   cd backend
   npm run dev
   # API running on http://localhost:5000
   ```

5. **Run Frontend Application**:
   ```bash
   cd frontend
   npm run dev
   # App running on http://localhost:5173
   ```

---

## 📂 Project Directory Structure

```
.
├── backend/                  # Express.js REST API Backend
│   ├── src/
│   │   ├── ai/              # OpenAI parser & matching pipeline
│   │   ├── controllers/     # API route controllers
│   │   ├── middleware/      # Auth, RBAC, Rate-limit, Zod validators
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Core domain services
│   │   ├── seed.ts          # Hackathon seed script with 5 demo accounts
│   │   └── server.ts        # Express application entrypoint
│   └── package.json
├── frontend/                 # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/      # UI components (Kanban, Monaco Editor, Navbar, Layouts)
│   │   ├── pages/           # 15 role-specific dashboards and views
│   │   ├── services/        # Axios API clients
│   │   └── types/           # Shared TypeScript interfaces
│   └── package.json
├── prisma/
│   └── schema.prisma        # 20 relational database entities
├── docs/                     # Documentation & Submission Deliverables
│   ├── API.md               # REST API Endpoints Specification
│   ├── ARCHITECTURE.md      # System Architecture Specification
│   ├── DATABASE.md         # ER Diagram & Entity Descriptions
│   ├── swagger.json         # OpenAPI API Export
│   └── HireAI_ATS.postman_collection.json # Postman Collection
├── docker-compose.yml       # Production/Local Docker container orchestrator
└── Dockerfile               # Multi-stage Docker build file
```

---

## 📖 Architecture & Deliverables Documentation

- 📄 [System Architecture Specification](file:///c:/Users/shanm/OneDrive/Documents/New%20folder%20%283%29/docs/ARCHITECTURE.md)
- 📄 [REST API Specification](file:///c:/Users/shanm/OneDrive/Documents/New%20folder%20%283%29/docs/API.md)
- 📄 [Database ER Diagram & Schema](file:///c:/Users/shanm/OneDrive/Documents/New%20folder%20%283%29/docs/DATABASE.md)
- 🔌 [Swagger OpenAPI Specification](file:///c:/Users/shanm/OneDrive/Documents/New%20folder%20%283%29/docs/swagger.json)
- 🔌 [Postman Collection](file:///c:/Users/shanm/OneDrive/Documents/New%20folder%20%283%29/docs/HireAI_ATS.postman_collection.json)

---

## 🏆 DevFusion 4.0 Submission Checklist

- [x] Full-Stack AI-Powered Recruitment & ATS Solution
- [x] All 10 Core Application Modules Implemented
- [x] 5 Role-Based Dashboards (Candidate, Recruiter, Hiring Manager, Interviewer, Admin)
- [x] Zero compilation/type errors in Backend & Frontend
- [x] Clean seed data with ready-to-test credentials
- [x] API export (Swagger JSON + Postman Collection)
- [x] Complete database schema with 20 entities
- [x] Docker containerization (`docker-compose.yml`)

---

*Submitted for **DevFusion 4.0 Hackathon**.*
