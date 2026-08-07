import rateLimit from 'express-rate-limit';
import RedisStore, { SendCommandFn } from 'rate-limit-redis';
import jwt from 'jsonwebtoken';
import { getRedisClient, isRedisAvailable } from '../config/redis';

function extractUserId(req: any): string {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = jwt.decode(token) as { sub?: number } | null;
      if (payload?.sub) return `user:${payload.sub}`;
    } catch { /* fallback abajo */ }
  }

  // Fallback para login/registro: usa cédula o email del body
  const identifier = req.body?.cedula || req.body?.email || req.body?.email_institucional;
  if (identifier) return `id:${identifier}`;

  return req.ip || req.socket.remoteAddress || 'unknown';
}

const sendCommand: SendCommandFn = async (cmd: string, ...args: string[]) => {
  const result = await getRedisClient()!.call(cmd, ...args);
  return result as string | number;
};

const store = isRedisAvailable()
  ? new RedisStore({ sendCommand })
  : undefined;

export const apiLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Espere 2 minutos antes de intentar nuevamente.' },
  store,
  skipFailedRequests: false,
  keyGenerator: extractUserId,
  skip: () => process.env.DISABLE_RATE_LIMIT === 'true',
});
