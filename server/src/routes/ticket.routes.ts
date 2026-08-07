import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import * as ctrl from '../controllers/ticket.controller';

const router = Router();

router.get('/',      requireAuth, ctrl.listar);
router.get('/stats', ctrl.stats);
router.get('/mapa-calor', requireAuth, ctrl.mapaCalor);
router.get('/heatmap', requireAuth, ctrl.heatmap);
router.get('/:id',   requireAuth, ctrl.obtener);
router.post('/',   requireAuth, ctrl.crear);

router.patch('/:id',  requireAuth, requireAdmin, ctrl.actualizar);
router.delete('/:id', requireAuth, requireAdmin, ctrl.eliminar);

export default router;
