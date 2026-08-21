# HireAI ATS - Database Architecture & Schema Documentation

## Database Overview
- **Engine**: PostgreSQL
- **ORM**: Prisma ORM v5+
- **Entity Count**: 20 Core Domain Entities

---

## Entity Relationship Summary

```
[User] ─── (1:1) ───> [Candidate] ─── (1:N) ───> [Application] <─── (1:N) ─── [Job] <─── (N:1) ─── [Company]
  │                        │                            │
  ├─── (1:N) ───> [Session]│                            ├─── (1:N) ───> [Interview]
  │                        ├─── (1:N) ───> [Resume]     │
  └─── (1:N) ───> [AuditLog]                            └─── (1:N) ───> [OfferLetter]
```

### Core Entities:
1. `User`: Central entity storing credentials, password hashes, email verification flags, and RBAC roles (`CANDIDATE`, `RECRUITER`, `HIRING_MANAGER`, `INTERVIEWER`, `ADMIN`).
2. `Company`: Corporate profile linked to jobs, recruiters, and managers.
3. `Candidate`: Detailed professional attributes (skills, experience, education, portfolio links).
4. `Job`: Open position definitions including department, location, work mode, salary range, status (`DRAFT`, `ACTIVE`, `CLOSED`, `ARCHIVED`).
5. `Application`: Recruitment candidate-to-job pairing supporting recruitment stages (`APPLIED`, `SCREENING`, `SHORTLISTED`, `TECHNICAL_INTERVIEW`, `HR_INTERVIEW`, `OFFER`, `HIRED`, `REJECTED`).
6. `Resume` & `ResumeAnalysis`: Stores uploaded file paths and parsed structured JSON resume attributes + match vectors.
7. `Interview` & `InterviewParticipant` & `Feedback`: Complete interview workflow scheduling and standard metric ratings (Technical, Communication, Problem Solving, Leadership, Overall).
8. `CodingAssessment`, `AssessmentQuestion`, `AssessmentAttempt`, `AssessmentAnswer`: Full evaluation engine with timer and Monaco editor support.
9. `OfferLetter`: Official compensation package and electronic approval tracking.
10. `Notification`, `ActivityLog`, `AuditLog`, `Settings`: Operations, notifications, and security logs.
