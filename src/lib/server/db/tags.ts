import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { tags } from '#lib/server/db/schema.ts';

export async function updateTag(id: number, name: string) {
  await db.update(tags).set({ name }).where(eq(tags.id, id));
}

export async function createTag(name: string) {
  return await db.insert(tags).values({ name }).returning();
}

export async function getTags() {
  return db
    .select({
      id: tags.id,
      name: tags.name,
    })
    .from(tags)
    .orderBy(tags.id);
}

export async function deleteTag(id: number) {
  return db.delete(tags).where(eq(tags.id, id));
}
