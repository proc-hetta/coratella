import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { authors } from '#lib/server/db/schema.ts';

export async function updateAuthor(
  id: number,
  email?: string,
  nickname?: string,
  firstName?: string,
  lastName?: string,
  image?: string,
) {
  await db
    .update(authors)
    .set({
      nickname: nickname || undefined,
      email: email || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      image,
    })
    .where(eq(authors.id, id));
}

export async function createAuthor(
  nickname: string,
  email?: string,
  firstName?: string,
  lastName?: string,
  image?: string,
) {
  return await db
    .insert(authors)
    .values({
      nickname,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      image: image || undefined,
      email: email || undefined,
    })
    .returning();
}

export async function getAuthors() {
  return db
    .select({
      id: authors.id,
      nickname: authors.nickname,
      firstName: authors.firstName,
      lastName: authors.lastName,
      image: authors.image,
      email: authors.email,
    })
    .from(authors)
    .orderBy(authors.id);
}

export async function deleteAuthor(id: number) {
  return db.delete(authors).where(eq(authors.id, id));
}
