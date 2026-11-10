import { beforeEach, vi } from 'vitest';

// SvelteKit only populates $app/env modules inside a running server: back them with process.env.
const liveEnv = (...names: string[]) =>
  Object.defineProperties(
    {},
    Object.fromEntries(
      names.map((name) => [name, { enumerable: true, get: () => process.env[name] }]),
    ),
  );

vi.mock('$app/env/private', () =>
  liveEnv('DATABASE_URL', 'CORATELLA_SECRET', 'TORCOLO_URL', 'TORCOLO_TOKEN'),
);
vi.mock('$app/env/public', () =>
  liveEnv('PUBLIC_TITLE', 'PUBLIC_LOGO', 'PUBLIC_LOGOLIGHT', 'PUBLIC_LOGODARK'),
);

vi.mock('#lib/server/db/index.ts', async () => {
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  const schema = await import('#lib/server/db/schema.ts');

  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: 'drizzle' });

  return { db, client };
});

beforeEach(async () => {
  const { client } = (await import('#lib/server/db/index.ts')) as unknown as {
    client: import('@electric-sql/pglite').PGlite;
  };
  await client.exec(
    'TRUNCATE posts_to_tags, posts_to_categories, posts_to_authors, posts, tags, categories, authors, users RESTART IDENTITY CASCADE',
  );
});
