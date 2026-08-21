import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import jobRoutes from './job.routes';
import applicationRoutes from './application.routes';
import candidateRoutes from './candidate.routes';
import aiRoutes from './ai.routes';
import interviewRoutes from './interview.routes';
import assessmentRoutes from './assessment.routes';
import offerRoutes from './offer.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/candidates', candidateRoutes);
router.use('/ai', aiRoutes);
router.use('/interviews', interviewRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/offers', offerRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

export default router;
