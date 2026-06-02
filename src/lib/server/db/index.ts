import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { building } from '$app/environment';
import { exit } from 'node:process';

// https://github.com/sveltejs/kit/issues/11341#issuecomment-1858836699
if (!building && !env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  exit(1);
}
const client = postgres(building ? '' : env.DATABASE_URL);
export const db = drizzle(client, { schema });
if (!building) await migrate(db, { migrationsFolder: 'drizzle' });
