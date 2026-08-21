import { Router } from 'express';
import { scheduleInterview, getInterviews, submitFeedback, getInterviewers } from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/interviewers', getInterviewers);
router.get('/', getInterviews);
router.post('/', authorize('RECRUITER', 'ADMIN'), scheduleInterview);
router.post('/:id/feedback', authorize('INTERVIEWER', 'HIRING_MANAGER', 'ADMIN'), submitFeedback);

export default router;
