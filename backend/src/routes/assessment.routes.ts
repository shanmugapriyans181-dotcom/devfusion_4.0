import { Router } from 'express';
import { getAssessments, getAssessmentById, submitAssessment } from '../controllers/assessment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAssessments);
router.get('/:id', getAssessmentById);
router.post('/:id/submit', submitAssessment);

export default router;
