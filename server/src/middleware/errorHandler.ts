import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logError } from '../utils/logger';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    res.status(422).json({
      error:   'Datos de entrada inválidos.',
      details: err.errors.map((e) => ({
        path:    e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err && typeof err === 'object' && 'type' in err && (err as any).type === 'entity.too.large') {
    res.status(413).json({
      error: 'El archivo es demasiado grande. El tamaño máximo permitido es 25MB.',
    });
    return;
  }

  if (err && typeof err === 'object' && 'status' in err && (err as any).status === 413) {
    res.status(413).json({
      error: 'El archivo es demasiado grande. El tamaño máximo permitido es 25MB.',
    });
    return;
  }

  logError('no manejado', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
}