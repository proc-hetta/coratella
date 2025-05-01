import { db } from '$lib/server/db';
import { count, Table } from 'drizzle-orm';

export async function rowsCount(table: Table) {
  const result = await db.select({ count: count() }).from(table);
  return result.pop()?.count;
}

export const argonOptions = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};
