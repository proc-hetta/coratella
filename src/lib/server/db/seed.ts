import postgres from 'postgres';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import { exit } from 'node:process';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  exit(1);
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });

const main = async () => {
  await db
    .insert(schema.users)
    .values({
      id: crypto.randomUUID(),
      username: 'admin',
      password:
        '$argon2id$v=19$m=19456,t=2,p=1$bqqISP13LF0PJ8xXBAoaRg$bnpM061DhmmEpVvBktgj2YSJSuBTB1YX46EFBjiYqFo',
    })
    .execute();
};

main().then(() => {
  console.log('Seeding done!');
  exit(0);
});
