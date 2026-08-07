import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { logError } from './utils/logger';

process.on('unhandledRejection', (reason) => {
  logError('unhandledRejection', reason instanceof Error ? reason : new Error(String(reason)));
});
process.on('uncaughtException', (error) => {
  logError('uncaughtException', error);
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { registerRoutes } from './routes';
import { connectRedis } from './config/redis';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '25mb' }));
app.use(requestLogger);
app.use('/api/', apiLimiter);

app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/api/reportes/imagen', express.static(UPLOADS_DIR));

const swaggerDocument = yaml.load(path.resolve(process.cwd(), '..', 'openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

registerRoutes(app);

app.use(errorHandler);

async function start() {
  connectRedis();

  app.listen(PORT, () => {
    console.log(`Servidor de uide_escucha corriendo en http://localhost:${PORT}`);
    console.log(`Sirviendo archivos estaticos desde: ${UPLOADS_DIR}`);
  });
}

start();
