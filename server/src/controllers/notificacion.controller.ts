import { Request, Response } from 'express';
import * as service from '../services/notificacion.service';
import { logError } from '../utils/logger';

export async function listar(req: Request, res: Response) {
  try {
    const notificaciones = await service.listarNotificaciones(req.user!.sub);
    res.json(notificaciones);
  } catch (error: any) {
    logError('listar notificaciones', error);
    res.status(500).json({ error: 'Error al obtener notificaciones.' });
  }
}

export async function contarNoLeidas(req: Request, res: Response) {
  try {
    const count = await service.contarNoLeidas(req.user!.sub);
    res.json({ count });
  } catch (error: any) {
    logError('contar no leidas', error);
    res.status(500).json({ error: 'Error al contar notificaciones.' });
  }
}

export async function marcarLeida(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await service.marcarComoLeida(id, req.user!.sub);
    res.status(204).send();
  } catch (error: any) {
    logError('marcar notificacion leida', error);
    res.status(500).json({ error: 'Error al marcar notificacion.' });
  }
}

export async function marcarTodasLeidas(req: Request, res: Response) {
  try {
    await service.marcarTodasComoLeidas(req.user!.sub);
    res.status(204).send();
  } catch (error: any) {
    logError('marcar todas leidas', error);
    res.status(500).json({ error: 'Error al marcar notificaciones.' });
  }
}
