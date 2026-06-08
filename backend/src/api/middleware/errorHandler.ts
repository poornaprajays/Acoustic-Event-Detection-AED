import { Request, Response, NextFunction } from 'express';
import type { ApiErrorResponse } from '@/types';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Centralised error handler middleware.
 * Must be the LAST middleware registered in server.ts.
 *
 * Catches any error thrown or passed via next(err) and returns
 * a consistent ApiErrorResponse shape.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const isDev = process.env['NODE_ENV'] === 'development';

  const body: ApiErrorResponse = {
    success: false,
    error: {
      message: isDev ? err.message : 'An unexpected error occurred',
      code: err.code ?? 'INTERNAL_SERVER_ERROR',
    },
  };

  if (isDev) {
    console.error('[ErrorHandler]', err);
  }

  res.status(statusCode).json(body);
}
