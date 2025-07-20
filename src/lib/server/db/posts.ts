import { eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { posts, postsToAuthors, postsToCategories, postsToTags } from '$lib/server/db/schema';
import type { Author, Category, Post, Tag } from '$lib/server/db/schema.js';
import { sum } from 'drizzle-orm';

export type FullPost = Post & {
  tags: Tag[];
  categories: Category[];
  authors: Author[];
};

export async function totalVisits() {
  const result = await db.select({ totalVisits: sum(posts.visits) }).from(posts);
  return result.pop()?.totalVisits ?? 0;
}

export async function getPosts() {
  const postsWithRelations = await db.query.posts.findMany({
    with: {
      postsToTags: {
        with: {
          tag: true || false,
        },
      },
      postsToCategories: {
        with: {
          category: true,
        },
      },
      postsToAuthors: {
        with: {
          author: true,
        },
      },
    },
  });

  if (!postsWithRelations) return null;

  const posts = postsWithRelations.map((post) => ({
    ...post,
    tags: post.postsToTags.map((pt) => pt.tag),
    categories: post.postsToCategories.map((pc) => pc.category),
    authors: post.postsToAuthors.map((pa) => pa.author),
  }));

  return posts;
}

export async function getPost(id: number) {
  const postWithRelations = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      postsToTags: {
        with: {
          tag: true,
        },
      },
      postsToCategories: {
        with: {
          category: true,
        },
      },
      postsToAuthors: {
        with: {
          author: true,
        },
      },
    },
  });

  if (!postWithRelations) return null;

  const post = {
    ...postWithRelations,
    tags: postWithRelations.postsToTags.map((pt) => pt.tag),
    categories: postWithRelations.postsToCategories.map((pc) => pc.category),
    authors: postWithRelations.postsToAuthors.map((pa) => pa.author),
  };

  return post;
}

export async function updateOrCreatePost(fullpost: FullPost) {
  if (fullpost.authors.length === 0 || fullpost.categories.length === 0) {
    throw new Error('Authors or Categories are empty!');
  }

  const postId = await db.transaction(async (tx) => {
    if (fullpost.id !== -1) {
      await tx.delete(postsToAuthors).where(eq(postsToAuthors.postId, fullpost.id));
      await tx.delete(postsToTags).where(eq(postsToTags.postId, fullpost.id));
      await tx.delete(postsToCategories).where(eq(postsToCategories.postId, fullpost.id));
      await tx.delete(posts).where(eq(posts.id, fullpost.id));
    }
    const newPost = await tx
      .insert(posts)
      .values({
        id: fullpost.id === -1 ? undefined : fullpost.id,
        title: fullpost.title,
        content: fullpost.content,
        password: fullpost.password ? fullpost.password : undefined,
        draft: fullpost.draft,
        toc: fullpost.toc,
        math: fullpost.math,
        ctime: fullpost.id === -1 ? undefined : new Date(fullpost.ctime),
        visits: fullpost.visits,
      })
      .returning();
    const postId = newPost[0].id;
    const newAuthorRelations = fullpost.authors.map((author) => ({ postId, authorId: author.id }));
    const newTagRelations = fullpost.tags.map((tag) => ({ postId, tagId: tag.id }));
    const newCategoryRelations = fullpost.categories.map((category) => ({
      postId,
      categoryId: category.id,
    }));
    await tx.insert(postsToAuthors).values(newAuthorRelations);
    if (newTagRelations.length > 0) {
      await tx.insert(postsToTags).values(newTagRelations);
    }
    await tx.insert(postsToCategories).values(newCategoryRelations);
    return postId;
  });
  return getPost(postId);
}

export async function deletePost(id: number) {
  await db.transaction(async (tx) => {
    await tx.delete(postsToAuthors).where(eq(postsToAuthors.postId, id));
    await tx.delete(postsToTags).where(eq(postsToTags.postId, id));
    await tx.delete(postsToCategories).where(eq(postsToCategories.postId, id));
    await tx.delete(posts).where(eq(posts.id, id));
  });
}

export async function incrementVisits(id: number) {
  await db
    .update(posts)
    .set({
      visits: sql`${posts.visits} + 1`,
    })
    .where(eq(posts.id, id));
}
