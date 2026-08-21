export type Role = 'CANDIDATE' | 'RECRUITER' | 'HIRING_MANAGER' | 'INTERVIEWER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  emailVerified: boolean;
  companyId?: string;
  location?: string;
}

export type ApplicationStage =
  | 'APPLIED'
  | 'SCREENING'
  | 'SCREENING_TEST_ASSIGNED'
  | 'SCREENING_TEST_SUBMITTED'
  | 'SCREENING_PASSED'
  | 'SCREENING_FAILED'
  | 'SHORTLISTED'
  | 'INTERVIEW_PENDING'
  | 'INTERVIEW_SCHEDULED'
  | 'TECHNICAL_INTERVIEW'
  | 'HR_INTERVIEW'
  | 'INTERVIEW_COMPLETED'
  | 'INTERVIEW_PASSED'
  | 'INTERVIEW_FAILED'
  | 'MANAGER_REVIEW'
  | 'MANAGER_APPROVED'
  | 'OFFER_PENDING'
  | 'OFFER'
  | 'OFFER_SENT'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'HIRED'
  | 'REJECTED';

export type JobStatus =
  | 'DRAFT'
  | 'MANAGER_CREATED'
  | 'PENDING_RECRUITER_APPROVAL'
  | 'RECRUITER_ACCEPTED'
  | 'ACTIVE'
  | 'PUBLISHED'
  | 'CLOSED'
  | 'ARCHIVED';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description?: string;
  requirements?: string[];
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  experience?: number;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  workMode: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  status: JobStatus;
  companyName?: string;
  company?: { name: string; logo?: string; website?: string };
  createdBy?: { id: string; name: string; email: string; role?: string };
  createdAt: string;
}
