import { Router } from 'express';
import {
  applyForJob,
  getApplications,
  updateStage,
  assignScreening,
  submitScreeningScore,
  requestInterviewer,
  sendReportToManager,
} from '../controllers/application.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('CANDIDATE'), applyForJob);
router.get('/', getApplications);
router.put('/:id/stage', authorize('RECRUITER', 'HIRING_MANAGER', 'ADMIN'), updateStage);

// Custom Workflow Endpoints
router.post('/:id/screening', authorize('RECRUITER', 'ADMIN'), assignScreening);
router.post('/:id/screening-submit', authorize('CANDIDATE', 'RECRUITER', 'ADMIN'), submitScreeningScore);
router.post('/:id/request-interviewer', authorize('RECRUITER', 'ADMIN'), requestInterviewer);
router.post('/:id/send-report-to-manager', authorize('RECRUITER', 'ADMIN'), sendReportToManager);

export default router;
