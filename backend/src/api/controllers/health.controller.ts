import { Request, Response } from 'express';
import type { ApiSuccessResponse } from '@/types';

interface HealthData {
  status: 'ok';
  timestamp: string;
  uptime: number;
  environment: string;
}

/**
 * GET /api/health
 *
 * Lightweight liveness check.
 * Returns service status, current timestamp, process uptime, and environment.
 */
export function getHealth(_req: Request, res: Response): void {
  const body: ApiSuccessResponse<HealthData> = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env['NODE_ENV'] ?? 'development',
    },
    message: 'Service is healthy',
  };

  res.status(200).json(body);
}
