import { Router } from 'express';
import { getHealth } from '@/api/controllers/health.controller';

const router = Router();

/**
 * GET /api/health
 * Liveness check — returns 200 OK with service metadata.
 */
router.get('/', getHealth);

export default router;
