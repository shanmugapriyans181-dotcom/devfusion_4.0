import { Router } from 'express';
import { createOffer, getOffers, approveOffer, updateOfferStatus } from '../controllers/offer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getOffers);
router.post('/', authorize('RECRUITER', 'HIRING_MANAGER', 'ADMIN'), createOffer);
router.post('/:id/approve', authorize('RECRUITER', 'ADMIN'), approveOffer);
router.put('/:id/status', updateOfferStatus);

export default router;
