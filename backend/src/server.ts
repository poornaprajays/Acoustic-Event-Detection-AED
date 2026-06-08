import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config';
import { requestLogger } from './api/middleware/requestLogger';
import { errorHandler } from './api/middleware/errorHandler';
import apiRouter from './api/routes';

const app = express();

// ─── Security middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// ─── Parsing middleware ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// 404 handler — must come after all routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found', code: 'NOT_FOUND' },
  });
});

// ─── Centralised error handler ────────────────────────────────────────────
// Must be last middleware
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────
app.listen(config.PORT, () => {
  console.log(`\n🚀  Backend running on http://localhost:${config.PORT}`);
  console.log(`   ENV: ${config.NODE_ENV}`);
  console.log(`   ML Service: ${config.ML_SERVICE_URL}\n`);
});

export default app;
