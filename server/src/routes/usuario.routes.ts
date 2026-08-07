import { Router } from 'express';
import * as ctrl from '../controllers/usuario.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/perfil', requireAuth, ctrl.obtenerPerfil);
router.post('/cambiar-contrasenia', requireAuth, ctrl.cambiarContrasenia);

export default router;
