import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  process.stdout.write(`[${timestamp}] ${req.method} ${req.path}\n`);
  next();
}