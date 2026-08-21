import { Router } from 'express';
import { getUsers, updateUserRole, getAuditLogs, getSystemOverview, clearAllData } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/audit-logs', getAuditLogs);
router.get('/overview', getSystemOverview);
router.post('/clear-data', clearAllData);

export default router;

