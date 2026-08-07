import { Express, Request, Response } from 'express';
import authRoutes from './auth.routes';
import ticketRoutes from './ticket.routes';
import comentarioRoutes from './comentario.routes';
import notificacionRoutes from './notificacion.routes';
import usuarioRoutes from './usuario.routes';
import mfaRoutes from './mfa.routes';
import passwordResetRoutes from './passwordReset.routes';

export function registerRoutes(app: Express) {
  app.use('/api/auth', authRoutes);
  app.use('/api/auth', passwordResetRoutes);
  app.use('/api/mfa', mfaRoutes);
  app.use('/api/reportes', ticketRoutes);
  app.use('/api/reportes', comentarioRoutes);
  app.use('/api/notificaciones', notificacionRoutes);
  app.use('/api/usuarios', usuarioRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Recurso no encontrado',
      message: 'La ruta solicitada no existe.'
    });
  });
}
