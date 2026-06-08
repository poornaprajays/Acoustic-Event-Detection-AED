import morgan from 'morgan';
import { Request, Response } from 'express';

/**
 * HTTP request logger middleware.
 * Uses 'dev' format in development, 'combined' (Apache-style) in production.
 */
export const requestLogger = morgan(
  process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev',
  {
    skip: (_req: Request, res: Response) =>
      // Skip logging successful health checks to reduce noise
      res.statusCode === 200 && _req.path === '/api/health',
  },
);
