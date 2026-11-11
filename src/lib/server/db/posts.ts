import { asc, desc, eq, sql, sum } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { posts, postsToAuthors, postsToCategories, postsToTags } from '#lib/server/db/schema.ts';
import type { Author, Category, Post, Tag } from '#lib/server/db/schema.ts';

export type FullPost = Post & {
  tags: Tag[];
  categories: Category[];
  authors: Author[];
};

/** The fields `updateOrCreatePost` stores; `id: -1` creates a new post. */
export type PostInput = Pick<
  Post,
  'id' | 'title' | 'content' | 'password' | 'draft' | 'toc' | 'math' | 'ctime' | 'visits'
> & {
  tags: { id: number }[];
  categories: { id: number }[];
  authors: { id: number }[];
};

export async function totalVisits() {
  const result = await db.select({ totalVisits: sum(posts.visits).mapWith(Number) }).from(posts);
  return result.pop()?.totalVisits ?? 0;
}

const withRelations = {
  postsToTags: { with: { tag: true } },
  postsToCategories: { with: { category: true } },
  postsToAuthors: { with: { author: true } },
} as const;

type PostWithRelations = Post & {
  postsToTags: { tag: Tag }[];
  postsToCategories: { category: Category }[];
  postsToAuthors: { author: Author }[];
};

function flattenRelations<T extends PostWithRelations>(post: T) {
  return {
    ...post,
    tags: post.postsToTags.map(({ tag }) => tag),
    categories: post.postsToCategories.map(({ category }) => category),
    authors: post.postsToAuthors.map(({ author }) => author),
  };
}

export async function getPosts() {
  const rows = await db.query.posts.findMany({ with: withRelations });
  return rows.map(flattenRelations);
}

export async function getPost(id: number) {
  const row = await db.query.posts.findFirst({ where: eq(posts.id, id), with: withRelations });
  return row ? flattenRelations(row) : null;
}

/**
 * Published posts for the public listing, newest first, with only the fields the listing shows.
 * Drafts, content and passwords never leave the database.
 */
export async function getPublishedPostSummaries() {
  const rows = await db.query.posts.findMany({
    columns: { id: true, title: true, ctime: true },
    where: eq(posts.draft, false),
    orderBy: [desc(posts.ctime), asc(posts.id)],
    with: {
      postsToTags: { columns: {}, with: { tag: { columns: { id: true, name: true } } } },
      postsToCategories: {
        columns: {},
        with: { category: { columns: { id: true, name: true, color: true } } },
      },
      postsToAuthors: {
        columns: {},
        with: {
          author: {
            columns: { id: true, nickname: true, firstName: true, lastName: true, image: true },
          },
        },
      },
    },
  });
  return rows.map(({ postsToTags, postsToCategories, postsToAuthors, ...post }) => ({
    ...post,
    tags: postsToTags.map(({ tag }) => tag),
    categories: postsToCategories.map(({ category }) => category),
    authors: postsToAuthors.map(({ author }) => author),
  }));
}

/** Removes a post and its author/tag/category links inside the given transaction. */
async function removePost(tx: Pick<typeof db, 'delete'>, id: number) {
  await tx.delete(postsToAuthors).where(eq(postsToAuthors.postId, id));
  await tx.delete(postsToTags).where(eq(postsToTags.postId, id));
  await tx.delete(postsToCategories).where(eq(postsToCategories.postId, id));
  await tx.delete(posts).where(eq(posts.id, id));
}

export async function updateOrCreatePost(fullpost: PostInput) {
  if (fullpost.authors.length === 0 || fullpost.categories.length === 0) {
    throw new Error('Authors or Categories are empty!');
  }

  const postId = await db.transaction(async (tx) => {
    const isNew = fullpost.id === -1;
    if (!isNew) {
      await removePost(tx, fullpost.id);
    }
    const [newPost] = await tx
      .insert(posts)
      .values({
        id: isNew ? undefined : fullpost.id,
        title: fullpost.title,
        content: fullpost.content,
        password: fullpost.password || undefined,
        draft: fullpost.draft,
        toc: fullpost.toc,
        math: fullpost.math,
        ctime: isNew ? undefined : new Date(fullpost.ctime),
        visits: fullpost.visits,
      })
      .returning();
    const postId = newPost.id;
    await tx
      .insert(postsToAuthors)
      .values(fullpost.authors.map((author) => ({ postId, authorId: author.id })));
    if (fullpost.tags.length > 0) {
      await tx.insert(postsToTags).values(fullpost.tags.map((tag) => ({ postId, tagId: tag.id })));
    }
    await tx
      .insert(postsToCategories)
      .values(fullpost.categories.map((category) => ({ postId, categoryId: category.id })));
    return postId;
  });
  return getPost(postId);
}

export async function deletePost(id: number) {
  await db.transaction((tx) => removePost(tx, id));
}

export async function incrementVisits(id: number) {
  await db
    .update(posts)
    .set({
      visits: sql`${posts.visits} + 1`,
    })
    .where(eq(posts.id, id));
}
