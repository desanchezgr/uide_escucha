import { Router } from 'express';
import * as ctrl from '../controllers/mfa.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/setup', requireAuth, ctrl.setup);
router.post('/verify-setup', requireAuth, ctrl.verifySetup);
router.post('/validate', requireAuth, ctrl.validate);
router.post('/disable', requireAuth, ctrl.disable);
router.get('/status', requireAuth, ctrl.status);
router.get('/recovery-email', requireAuth, ctrl.getRecoveryEmail);

export default router;
