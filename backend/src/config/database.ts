import config from './index';

/**
 * PostgreSQL connection configuration.
 * Uses the connection string from the validated environment config.
 * Actual pool instantiation will occur in Phase 4 (database integration).
 */
export const databaseConfig = {
  connectionString: config.DATABASE_URL,
  /** Maximum number of clients in the pool */
  max: 10,
  /** Milliseconds a client must sit idle before being closed */
  idleTimeoutMillis: 30_000,
  /** Milliseconds to wait for a connection before throwing */
  connectionTimeoutMillis: 5_000,
} as const;
