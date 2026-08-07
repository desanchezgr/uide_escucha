import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', ctrl.login);
router.post('/verificar-cedula', ctrl.verificarCedula);
router.post('/verificar-identidad', ctrl.verificarIdentidad);
router.post('/registro-cedula', ctrl.registroPorCedula);
router.post('/login-cedula', ctrl.loginPorCedula);
router.post('/verificar-email-admin', ctrl.verificarEmailAdmin);
router.post('/registro-email-admin', ctrl.registroPorEmailAdmin);
router.post('/login-email-admin', ctrl.loginPorEmailAdmin);
router.post('/verify-mfa', ctrl.verifyMfa);
router.post('/recovery-email', requireAuth, ctrl.saveRecoveryEmail);
router.post('/verify-email-token', ctrl.verifyEmailToken);

export default router;
