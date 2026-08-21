# HireAI ATS - System Architecture Specification

## Executive Overview
**HireAI ATS** ("AI-Powered Recruitment. Smarter Hiring.") is a production-ready, full-stack recruitment and Applicant Tracking System designed for high-scale enterprise hiring pipelines.

---

## 1. Component Architecture Overview

```
                          ┌─────────────────────────────┐
                          │   React 18 + Vite Frontend  │
                          │   (Tailwind, TanStack Query) │
                          └──────────────┬──────────────┘
                                         │ REST API / JSON
                                         ▼
                          ┌─────────────────────────────┐
                          │    Express.js Node Backend  │
                          │ (TypeScript Controller/Svc) │
                          └──────┬───────────────┬──────┘
                                 │               │
                  Prisma ORM     │               │ OpenAI API / Zod Engine
                                 ▼               ▼
                 ┌──────────────────┐  ┌──────────────────┐
                 │ PostgreSQL Data  │  │ AI Resume Parser │
                 │ (20+ Entities)   │  │ & Matcher Svc    │
                 └──────────────────┘  └──────────────────┘
```

### Key Architectural Layers:
1. **Presentation Layer (Frontend)**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Monaco Code Editor.
2. **API Gateways & Routers**: Express.js typed router handlers with rate limiting, Zod schema validation, CORS policy, and cookie handlers.
3. **Business Logic Layer (Backend Services)**: Separated into dedicated Domain Services (`AuthService`, `JobService`, `CandidateService`, `AIService`, `AssessmentService`, `InterviewService`, `OfferService`).
4. **Data Access Layer**: Prisma ORM interacting with PostgreSQL.
5. **AI Execution Engine**: Server-side OpenAI GPT integration using structured JSON schemas, fallback `DEMO_MODE` engine, and bias-filtering guardrails.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Feature / Domain | Candidate | Recruiter | Hiring Manager | Interviewer | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Job Search & Apply | ✅ | ❌ | ❌ | ❌ | ✅ |
| Job Posting & Management | ❌ | ✅ | ❌ | ❌ | ✅ |
| Resume AI Analysis | Self | ✅ | ✅ | ❌ | ✅ |
| Drag-and-Drop Pipeline | ❌ | ✅ | ❌ | ❌ | ✅ |
| Hiring Decision Approval | ❌ | ❌ | ✅ | ❌ | ✅ |
| Interviewer Feedback | ❌ | ❌ | ✅ | ✅ | ✅ |
| Salary Inspection | ❌ | ✅ | ✅ | ❌ | ✅ |
| System Audit Logs | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. AI Service Pipeline & Safety
- **Server-Side Only**: OpenAI credentials never leak to client code.
- **Strict JSON Parsing**: AI outputs are validated using Zod schemas.
- **Fairness & Bias Shield**: Excludes race, religion, gender, sexual orientation, disability, and age from prompt evaluations.
