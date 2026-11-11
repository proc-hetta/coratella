import { hash } from '@node-rs/argon2';
import { and, eq, isNotNull, notLike } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';
import { posts } from './schema';
import { argonOptions } from './utils';

/** Replaces post passwords still stored in plaintext with their argon2 hash. */
export async function hashPlaintextPostPasswords(db: PgDatabase<PgQueryResultHKT, typeof schema>) {
  const rows = await db
    .select({ id: posts.id, password: posts.password })
    .from(posts)
    .where(and(isNotNull(posts.password), notLike(posts.password, '$argon2%')));
  for (const { id, password } of rows) {
    await db
      .update(posts)
      .set({ password: await hash(password!, argonOptions) })
      .where(eq(posts.id, id));
  }
}
