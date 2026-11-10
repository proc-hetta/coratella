import postgres from 'postgres';
import * as schema from './schema';
import { DATABASE_URL } from '$app/env/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { building } from '$app/env';
import { exit } from 'node:process';

// https://github.com/sveltejs/kit/issues/11341#issuecomment-1858836699
if (!building && !DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  exit(1);
}
const client = postgres(building ? '' : DATABASE_URL!);
export const db = drizzle(client, { schema });
if (!building) await migrate(db, { migrationsFolder: 'drizzle' });
