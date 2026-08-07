import { Router } from 'express';
import * as ctrl from '../controllers/passwordReset.controller';

const router = Router();

router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password/:token', ctrl.resetPassword);
router.get('/reset-password/:token/validate', ctrl.validateToken);

export default router;
