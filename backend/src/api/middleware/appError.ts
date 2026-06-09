/**
 * appError.ts
 * -----------
 * Throwable AppError class for the Express backend.
 *
 * Why a class vs a plain object:
 *   The existing errorHandler reads err.statusCode and err.code via a local
 *   AppError interface.  Making this a real class lets any module `throw new
 *   AppError(...)` and have the handler pick it up automatically, without
 *   changing the handler itself.
 *
 * Usage:
 *   throw new AppError('File too large', 413, 'FILE_TOO_LARGE');
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    // Restore prototype chain (required when extending built-ins in TS/CommonJS)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
