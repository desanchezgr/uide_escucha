import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { logError } from '../utils/logger';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };

  try {
    const result = await authService.login(email || '', password || '');
    res.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('login', error);
    res.status(statusCode).json({ error: message });
  }
}

export async function verificarCedula(req: Request, res: Response) {
  const { cedula } = req.body as { cedula?: string };

  try {
    const result = await authService.verificarCedula(cedula || '');
    res.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('verificarCedula', error);
    res.status(statusCode).json({ error: message });
  }
}

export async function verificarIdentidad(req: Request, res: Response) {
  const { cedula, email } = req.body as { cedula?: string; email?: string };

  try {
    const result = await authService.verificarIdentidad(cedula || '', email || '');
    res.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('verificarIdentidad', error);
    res.status(statusCode).json({ error: message });
  }
}

export async function registroPorCedula(req: Request, res: Response) {
  const { cedula, password, email_recuperacion } = req.body as { cedula?: string; password?: string; email_recuperacion?: string };

  try {
    const result = await authService.registroPorCedula(cedula || '', password || '', email_recuperacion);
    res.status(201).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('registroPorCedula', error);
    res.status(statusCode).json({ error: message });
  }
}

export async function loginPorCedula(req: Request, res: Response) {
  const { cedula, password } = req.body as { cedula?: string; password?: string };

  try {
    const result = await authService.loginPorCedula(cedula || '', password || '');
    res.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('loginPorCedula', error);
    res.status(statusCode).json({ error: message });
  }
}

export async function verificarEmailAdmin(req: Request, res: Response) {
  const { email } = req.body as { email?: string };

  try {
    const result = await authService.verificarEmailAdmin(email || '');
    res.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('verificarEmailAdmin', error);
    res.status(statusCode).json({ error: message });
  }
}

export async function registroPorEmailAdmin(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };

  try {
    const result = await authService.registroPorEmailAdmin(email || '', password || '');
    res.status(201).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('registroPorEmailAdmin', error);
    res.status(statusCode).json({ error: message });
  }
}

export async function loginPorEmailAdmin(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };

  try {
    const result = await authService.loginPorEmailAdmin(email || '', password || '');
    res.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('loginPorEmailAdmin', error);
    res.status(statusCode).json({ error: message });
  }
}

export async function verifyMfa(req: Request, res: Response) {
  const { tempToken, code } = req.body as { tempToken?: string; code?: string };

  try {
    const result = await authService.verifyMfaWithTempToken(tempToken || '', code || '');
    res.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('verifyMfa', error);
    res.status(statusCode).json({ error: message });
  }
}

export async function saveRecoveryEmail(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  const usuarioId = req.user?.sub;

  if (!usuarioId) {
    res.status(401).json({ error: 'No autorizado.' });
    return;
  }

  try {
    await authService.saveRecoveryEmail(usuarioId, email || '');
    res.json({ message: 'Correo de recuperación guardado correctamente.' });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('saveRecoveryEmail', error);
    res.status(statusCode).json({ error: message });
  }
}

export async function verifyEmailToken(req: Request, res: Response) {
  const { cedula, token } = req.body as { cedula?: string; token?: string };

  try {
    const result = await authService.verifyEmailToken(cedula || '', token || '');
    res.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor.';
    if (statusCode === 500) logError('verifyEmailToken', error);
    res.status(statusCode).json({ error: message });
  }
}
