import { Router } from 'express';
import healthRouter from './health.route';

/**
 * Root API router.
 * Mount all feature routers here.
 *
 * Prefix: /api  (applied in server.ts)
 */
const router = Router();

router.use('/health', healthRouter);

// Future routes — to be added in subsequent phases:
// router.use('/upload', uploadRouter);
// router.use('/analyses', analysisRouter);

export default router;
