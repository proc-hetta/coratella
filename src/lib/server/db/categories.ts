import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import type { HSL, RGB } from './color';

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
