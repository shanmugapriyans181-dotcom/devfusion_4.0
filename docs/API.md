# HireAI ATS - REST API Specification

## API Architecture Standards
- Base URL: `/api/v1`
- Content Type: `application/json`
- Auth Strategy: JWT Bearer / Secure HTTP-Only Cookies
- Standard Response Wrapper:
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

## Endpoint Map

### Authentication (`/api/v1/auth`)
- `POST /register`: Register user account
- `POST /login`: Authenticate and issue token
- `POST /logout`: Revoke active session
- `POST /refresh`: Refresh access token
- `POST /forgot-password`: Request reset email
- `POST /reset-password`: Complete password reset
- `POST /verify-email`: Verify email address

### Jobs (`/api/v1/jobs`)
- `GET /`: Search and filter open jobs
- `POST /`: Create new job (Recruiter/Admin)
- `GET /:id`: Retrieve job details
- `PUT /:id`: Update job details
- `DELETE /:id`: Delete job
- `POST /:id/close`: Close job
- `POST /:id/duplicate`: Clone existing job

### Resumes & AI (`/api/v1/resumes`, `/api/v1/ai`)
- `POST /resumes/upload`: Upload PDF/DOCX resume
- `POST /resumes/:id/analyze`: Execute AI resume parser
- `POST /ai/match`: Compute candidate-to-job AI match vector & score

### Applications (`/api/v1/applications`)
- `POST /`: Submit job application
- `GET /`: List applications (Filtered by role)
- `PUT /:id/stage`: Update pipeline stage (Kanban drag-and-drop)

### Interviews & Feedback (`/api/v1/interviews`)
- `POST /`: Schedule interview session
- `POST /:id/feedback`: Submit interviewer score & evaluation

### Assessments (`/api/v1/assessments`)
- `POST /`: Create assessment suite
- `POST /:id/submit`: Submit assessment answers

### Offers (`/api/v1/offers`)
- `POST /`: Draft offer letter
- `PUT /:id/status`: Candidate accept/reject offer

### Admin & Audit (`/api/v1/admin`)
- `GET /users`: System user list
- `GET /audit-logs`: System audit trail
