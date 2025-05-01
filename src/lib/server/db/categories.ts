import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';

export async function updateCategory(id: number, name: string) {
  await db.update(categories).set({ name }).where(eq(categories.id, id));
}

export async function createCategory(name: string) {
  return await db.insert(categories).values({ name }).returning();
}

export async function getCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .orderBy(categories.id);
}

export async function deleteCategory(id: number) {
  return db.delete(categories).where(eq(categories.id, id));
}
