import { Request, Response } from 'express';
import crypto from 'crypto';
import * as passwordResetService from '../services/passwordReset.service';
import * as resetRepo from '../repositories/passwordReset.repository';
import { logError } from '../utils/logger';

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email, cedula } = req.body as { email?: string; cedula?: string };

    if (cedula) {
      const result = await passwordResetService.forgotPasswordByCedula(cedula);
      res.json(result);
      return;
    }

    if (!email) {
      res.status(400).json({ error: 'El correo electrónico es requerido.' });
      return;
    }

    const result = await passwordResetService.forgotPassword(email);
    res.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) logError('forgotPassword', error);
    res.status(statusCode).json({ error: error.message || 'Error al procesar la solicitud.' });
  }
}

export async function forgotPasswordByCedula(req: Request, res: Response) {
  try {
    const { cedula } = req.body as { cedula?: string };
    if (!cedula) {
      res.status(400).json({ error: 'La cédula es requerida.' });
      return;
    }

    const result = await passwordResetService.forgotPasswordByCedula(cedula);
    res.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) logError('forgotPasswordByCedula', error);
    res.status(statusCode).json({ error: error.message || 'Error al procesar la solicitud.' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const token = String(req.params.token);
    const { password } = req.body as { password?: string };

    if (!password) {
      res.status(400).json({ error: 'La nueva contraseña es requerida.' });
      return;
    }

    await passwordResetService.resetPassword(token, password);
    res.json({ message: 'Contraseña restablecida correctamente.' });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) logError('resetPassword', error);
    res.status(statusCode).json({ error: error.message || 'Error al restablecer la contraseña.' });
  }
}

export async function validateToken(req: Request, res: Response) {
  try {
    const token = String(req.params.token);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetToken = await resetRepo.findValidToken(tokenHash);

    if (!resetToken) {
      res.status(400).json({ valid: false, error: 'Token inválido o expirado.' });
      return;
    }

    res.json({ valid: true });
  } catch (error: any) {
    res.status(500).json({ valid: false, error: 'Error al validar el token.' });
  }
}
