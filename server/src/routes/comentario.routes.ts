import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/comentario.controller';

const router = Router();

router.get('/:reporteId/comentarios',    requireAuth, ctrl.listar);
router.post('/:reporteId/comentarios',   requireAuth, ctrl.crear);
router.patch('/:reporteId/comentarios/:id', requireAuth, ctrl.actualizar);
router.delete('/:reporteId/comentarios/:id', requireAuth, ctrl.eliminar);

export default router;