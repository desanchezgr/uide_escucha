import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { logError } from '../utils/logger';

export async function obtenerPerfil(req: Request, res: Response) {
  try {
    const perfil = await authService.obtenerPerfil(req.user!.sub);
    res.json(perfil);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('obtenerPerfil', error);
    res.status(statusCode).json({ error: message });
  }
}

export async function cambiarContrasenia(req: Request, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
    await authService.cambiarContrasenia(req.user!.sub, currentPassword || '', newPassword || '');
    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('cambiarContrasenia', error);
    res.status(statusCode).json({ error: message });
  }
}
