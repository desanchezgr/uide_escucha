import { Router } from 'express';
import * as ctrl from '../controllers/notificacion.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, ctrl.listar);
router.get('/no-leidas', requireAuth, ctrl.contarNoLeidas);
router.patch('/:id/leer', requireAuth, ctrl.marcarLeida);
router.patch('/leer-todas', requireAuth, ctrl.marcarTodasLeidas);

export default router;
