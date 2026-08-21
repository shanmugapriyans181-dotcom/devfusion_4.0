import { Router } from 'express';
import { getCandidates, getMyProfile, updateMyProfile } from '../controllers/candidate.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', authorize('CANDIDATE'), getMyProfile);
router.put('/profile', authorize('CANDIDATE'), updateMyProfile);

// Recruiter, Manager & Admin candidate search
router.get('/', authorize('RECRUITER', 'HIRING_MANAGER', 'ADMIN'), getCandidates);

export default router;
