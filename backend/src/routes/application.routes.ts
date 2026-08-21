import { Router } from 'express';
import { applyForJob, getApplications, updateStage } from '../controllers/application.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('CANDIDATE'), applyForJob);
router.get('/', getApplications);
router.put('/:id/stage', authorize('RECRUITER', 'HIRING_MANAGER', 'ADMIN'), updateStage);

export default router;
