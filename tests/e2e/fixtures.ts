import { test as base, expect, type Page } from '@playwright/test';
import { hash } from '@node-rs/argon2';
import postgres from 'postgres';
import { databaseUrl } from '../../playwright.config';

export const admin = { username: 'admin', password: 'admin-password' };

const argonOptions = { memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1 };

const sql = postgres(databaseUrl, { onnotice: () => {} });

let migrated = false;

export async function resetDatabase() {
  // The app applies migrations on boot: hit it once so tables exist.
  if (!migrated) {
    await fetch('http://localhost:4173/');
    migrated = true;
  }
  await sql`TRUNCATE posts_to_tags, posts_to_categories, posts_to_authors, posts, tags, categories, authors, users RESTART IDENTITY CASCADE`;
  const password = await hash(admin.password, argonOptions);
  await sql`INSERT INTO users (id, username, password) VALUES ('00000000-0000-4000-8000-000000000001', ${admin.username}, ${password})`;
}

export async function seedPost(post: {
  title: string;
  content: string;
  password?: string | null;
  draft?: boolean;
  ctime?: string;
}) {
  const [author] = await sql`INSERT INTO authors (nickname, first_name, last_name, email)
    VALUES (${'author-' + post.title}, 'Ada', 'Lovelace', ${post.title + '@example.com'}) RETURNING id`;
  const [category] = await sql`INSERT INTO categories (name, color)
    VALUES (${'cat-' + post.title}, '#ff0000') RETURNING id`;
  const [tag] = await sql`INSERT INTO tags (name) VALUES (${'tag-' + post.title}) RETURNING id`;
  const password = post.password ? await hash(post.password, argonOptions) : null;
  const [row] = await sql`INSERT INTO posts (title, content, password, draft, toc, math, ctime)
    VALUES (${post.title}, ${post.content}, ${password}, ${post.draft ?? false}, true, true,
      ${post.ctime ?? '2024-01-01T00:00:00Z'}) RETURNING id`;
  await sql`INSERT INTO posts_to_authors VALUES (${row.id}, ${author.id})`;
  await sql`INSERT INTO posts_to_categories VALUES (${row.id}, ${category.id})`;
  await sql`INSERT INTO posts_to_tags VALUES (${row.id}, ${tag.id})`;
  return row.id as number;
}

export async function visitsOf(id: number) {
  const [row] = await sql`SELECT visits FROM posts WHERE id = ${id}`;
  return row.visits as number;
}

export async function login(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('Username').fill(admin.username);
  await page.getByPlaceholder('Password').fill(admin.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/admin');
}

export const test = base.extend<{ fresh: void }>({
  fresh: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await resetDatabase();
      await use();
    },
    { auto: true },
  ],
});

export { expect };
