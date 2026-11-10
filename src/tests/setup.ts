import { beforeEach, vi } from 'vitest';

// SvelteKit only populates $env modules inside a running server: back them with process.env.
vi.mock('$env/dynamic/private', () => ({ env: process.env }));
vi.mock('$env/dynamic/public', () => ({ env: process.env }));

vi.mock('$lib/server/db', async () => {
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  const schema = await import('$lib/server/db/schema');

  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: 'drizzle' });

  return { db, client };
});

beforeEach(async () => {
  const { client } = (await import('$lib/server/db')) as unknown as {
    client: import('@electric-sql/pglite').PGlite;
  };
  await client.exec(
    'TRUNCATE posts_to_tags, posts_to_categories, posts_to_authors, posts, tags, categories, authors, users RESTART IDENTITY CASCADE',
  );
});
