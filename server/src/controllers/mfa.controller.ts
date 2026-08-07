import { Request, Response } from 'express';
import * as mfaService from '../services/mfa.service';
import { logError } from '../utils/logger';

export async function setup(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const email = req.user!.email;
    const data = await mfaService.generateSetupData(userId, email);
    res.json(data);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) logError('mfa.setup', error);
    res.status(statusCode).json({ error: error.message || 'Error al generar configuración MFA.' });
  }
}

export async function verifySetup(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const { token } = req.body as { token?: string };
    const { backupCodes } = req.body as { backupCodes?: string[] };

    if (!token) {
      res.status(400).json({ error: 'Código de verificación requerido.' });
      return;
    }

    await mfaService.verifySetup(userId, token, backupCodes || []);
    res.json({ message: 'MFA activado correctamente.' });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) logError('mfa.verifySetup', error);
    res.status(statusCode).json({ error: error.message || 'Error al verificar MFA.' });
  }
}

export async function validate(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const { token } = req.body as { token?: string };

    if (!token) {
      res.status(400).json({ error: 'Código de verificación requerido.' });
      return;
    }

    const isValid = await mfaService.validateTotp(userId, token);
    if (!isValid) {
      res.status(401).json({ error: 'Código de verificación inválido.' });
      return;
    }

    res.json({ valid: true });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) logError('mfa.validate', error);
    res.status(statusCode).json({ error: error.message || 'Error al validar MFA.' });
  }
}

export async function disable(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const { password, token } = req.body as { password?: string; token?: string };

    if (!password || !token) {
      res.status(400).json({ error: 'Contraseña y código de verificación requeridos.' });
      return;
    }

    await mfaService.disableMfa(userId, password, token);
    res.json({ message: 'MFA desactivado correctamente.' });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) logError('mfa.disable', error);
    res.status(statusCode).json({ error: error.message || 'Error al desactivar MFA.' });
  }
}

export async function status(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const statusData = await mfaService.getStatus(userId);
    res.json(statusData);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) logError('mfa.status', error);
    res.status(statusCode).json({ error: error.message || 'Error al obtener estado MFA.' });
  }
}

export async function getRecoveryEmail(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const email = await mfaService.getRecoveryEmail(userId);
    res.json({ email });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener correo de recuperación.' });
  }
}
