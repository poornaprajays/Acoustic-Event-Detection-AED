import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
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
 *
 * Guard order:
 *  1. MulterError — file size limit (413) or unexpected field (400)
 *  2. AppError    — domain errors with explicit statusCode + code
 *  3. Generic     — unhandled errors → 500
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isDev = process.env['NODE_ENV'] === 'development';

  // ── Guard 1: Multer errors ─────────────────────────────────────────────
  if (err instanceof multer.MulterError) {
    const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File exceeds the 100 MB size limit.'
        : `Upload error: ${err.message}`;

    res.status(statusCode).json({
      success: false,
      error: { message, code: err.code },
    } satisfies ApiErrorResponse);
    return;
  }

  // ── Guard 2: AppError (domain errors) ─────────────────────────────────
  const statusCode = err.statusCode ?? 500;

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
