import Redis from 'ioredis';
import { logInfo, logWarn } from '../utils/logger';

let redisClient: Redis | null = null;
let redisAvailable = false;

function getRedisUrl(): string | null {
  const url = process.env.REDIS_URL;
  if (!url || url === 'redis://localhost:6379' && process.env.REDIS_ENABLED !== 'true') {
    return null;
  }
  return url;
}

export function connectRedis(): Redis | null {
  if (redisClient) return redisClient;

  const url = getRedisUrl();
  if (!url) {
    logInfo('redis', 'Redis no configurado, usando almacenamiento en memoria.');
    return null;
  }

  try {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          logWarn('redis', 'Redis no disponible tras 3 intentos. Modo fallback.');
          redisAvailable = false;
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      redisAvailable = true;
      logInfo('redis', 'Conexión a Redis establecida.');
    });

    redisClient.on('error', (err) => {
      redisAvailable = false;
      logWarn('redis', `Error de conexión Redis: ${err.message}`);
    });

    redisClient.on('close', () => {
      redisAvailable = false;
    });

    return redisClient;
  } catch (err: any) {
    logWarn('redis', `No se pudo conectar a Redis: ${err.message}`);
    return null;
  }
}

export function getRedisClient(): Redis | null {
  return redisClient;
}

export function isRedisAvailable(): boolean {
  return redisAvailable && redisClient !== null && redisClient.status === 'ready';
}
