import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use connection pooler for all queries (port 6543 with pgbouncer=true)
const connectionString = process.env.DATABASE_URL!;

// Singleton pattern for connection in development
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb.client ?? postgres(connectionString, {
  prepare: false, // Required for pgbouncer/transaction pooling
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });

// Export schema for convenience
export * from './schema';
