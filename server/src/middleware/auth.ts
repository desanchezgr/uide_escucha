import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logError } from '../utils/logger';

export const ROLES_ADMIN = [
  'admin', 'prorector', 'ti_soporte', 'bibliotecario', 'conserje',
  'mantenimiento', 'secretaria', 'bienestar universitario', 'financiero',
] as const;

export type TokenPayload = {
  sub:   number;
  email: string;
  rol:   string;
};

declare global {
  namespace Express {
    interface Request { 
      user?: TokenPayload; 
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET no configurado o demasiado corto.');
  }
  return secret;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  
  if (!header?.startsWith('Bearer ')) {
    logError('requireAuth - header ausente', { headers: JSON.stringify(req.headers) });
    res.status(401).json({ error: 'Token no proporcionado.' });
    return;
  }
  
  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, getJwtSecret()) as unknown as TokenPayload;
    
    req.user = payload;
    next();
  } catch (err) {
    logError('requireAuth - verificando token', err);
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!ROLES_ADMIN.includes(req.user?.rol as any)) {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol administrativo.' });
    return;
  }
  next();
}
