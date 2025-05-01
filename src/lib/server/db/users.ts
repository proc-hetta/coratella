import { users } from './schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '$lib/server/db';
import { hash } from '@node-rs/argon2';
import { argonOptions } from '$lib/server/db/utils';

export async function updateUser(id: string, username?: string, password?: string) {
  const updateSet: {
    username?: string;
    password?: string;
  } = {};
  if (password) {
    updateSet.password = await hash(password, argonOptions);
  }
  if (username) {
    updateSet.username = username;
  }
  await db.update(users).set(updateSet).where(eq(users.id, id));
}

export async function createUser(username: string, password: string) {
  const hashedPassword = await hash(password, argonOptions);
  return await db
    .insert(users)
    .values({
      id: uuidv4(),
      username,
      password: hashedPassword,
    })
    .returning();
}

export async function getUsers() {
  return db
    .select({
      id: users.id,
      username: users.username,
    })
    .from(users)
    .orderBy(users.id);
}

export async function deleteUser(id: string) {
  return db.delete(users).where(eq(users.id, id));
}
