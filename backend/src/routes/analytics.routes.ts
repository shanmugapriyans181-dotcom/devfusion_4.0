import { Router } from 'express';
import { getRecruiterAnalytics } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/recruiter', authorize('RECRUITER', 'HIRING_MANAGER', 'ADMIN'), getRecruiterAnalytics);

export default router;
