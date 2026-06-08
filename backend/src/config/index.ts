import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment variable schema.
 * All access to `process.env` in the application MUST go through
 * this validated, typed config object — never read process.env directly.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  ML_SERVICE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:\n', parsed.error.format());
  process.exit(1);
}

const config = parsed.data;

export default config;
