import { Router } from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  approveJob,
  closeJob,
  duplicateJob,
  deleteJob,
} from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

import { requireCompany } from '../middleware/company.middleware';

// Public / Candidate endpoint
router.get('/', getJobs);
router.get('/:id', getJobById);

// Recruiter, Hiring Manager & Admin endpoints
router.post('/', authenticate, requireCompany, authorize('RECRUITER', 'HIRING_MANAGER', 'ADMIN'), createJob);
router.patch('/:id/approve', authenticate, requireCompany, authorize('RECRUITER', 'ADMIN'), approveJob);
router.put('/:id', authenticate, requireCompany, authorize('RECRUITER', 'ADMIN', 'HIRING_MANAGER'), updateJob);
router.post('/:id/close', authenticate, requireCompany, authorize('RECRUITER', 'ADMIN'), closeJob);
router.post('/:id/duplicate', authenticate, requireCompany, authorize('RECRUITER', 'ADMIN'), duplicateJob);
router.delete('/:id', authenticate, requireCompany, authorize('RECRUITER', 'ADMIN'), deleteJob);

export default router;
