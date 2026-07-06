import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nebula';

// Initialize the postgres-js client pool
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Export the Drizzle client instance wrapping our schema definitions
export const db = drizzle(client, { schema });
export type DbClient = typeof db;
