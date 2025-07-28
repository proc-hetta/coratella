import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { authors } from '$lib/server/db/schema';

export async function updateAuthor(
  id: number,
  email?: string,
  nickname?: string,
  firstName?: string,
  lastName?: string,
  image?: string,
) {
  const updateSet: {
    nickname?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    image?: string | null;
  } = {};
  if (nickname) {
    updateSet.nickname = nickname;
  }
  if (email) {
    updateSet.email = email;
  }
  if (firstName) {
    updateSet.firstName = firstName;
  }
  if (lastName) {
    updateSet.lastName = lastName;
  }
  if (image !== undefined) {
    updateSet.image = image;
  }

  await db.update(authors).set(updateSet).where(eq(authors.id, id));
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
      firstName,
      lastName,
      image,
      email,
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
