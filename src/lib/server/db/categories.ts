import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { categories } from '#lib/server/db/schema.ts';

export async function updateCategory(id: number, name: string, color: string | undefined) {
  await db.update(categories).set({ name, color }).where(eq(categories.id, id));
}

export async function createCategory(name: string, color: string | undefined) {
  return await db.insert(categories).values({ name, color }).returning();
}

export async function getCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
    })
    .from(categories)
    .orderBy(categories.id);
}

export async function deleteCategory(id: number) {
  return db.delete(categories).where(eq(categories.id, id));
}
