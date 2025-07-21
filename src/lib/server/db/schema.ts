import { table } from 'console';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  nickname: text('nickname').notNull().unique(),
  image: text('image'),
});

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  color: text('color'),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  password: text('password'),
  draft: boolean('draft').notNull(),
  toc: boolean('toc').notNull(),
  math: boolean('math').notNull(),

  mtime: timestamp('mtime')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date(Date.now())),
  ctime: timestamp('ctime').defaultNow().notNull(),
  visits: integer('visits').notNull().default(0),
});

export const postsToTags = pgTable(
  'posts_to_tags',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.postId, t.tagId] })],
);

export const postsToCategories = pgTable(
  'posts_to_categories',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id),
  },
  (t) => [primaryKey({ columns: [t.postId, t.categoryId] })],
);

export const postsToAuthors = pgTable(
  'posts_to_authors',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id),
    authorId: integer('author_id')
      .notNull()
      .references(() => authors.id),
  },
  (t) => [primaryKey({ columns: [t.postId, t.authorId] })],
);

export const postsRelations = relations(posts, ({ many }) => ({
  postsToTags: many(postsToTags),
  postsToCategories: many(postsToCategories),
  postsToAuthors: many(postsToAuthors),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postsToTags: many(postsToTags),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  postsToCategories: many(postsToCategories),
}));

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsToTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postsToTags.tagId],
    references: [tags.id],
  }),
}));

export const postsToCategoriesRelations = relations(postsToCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postsToCategories.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postsToCategories.categoryId],
    references: [categories.id],
  }),
}));

export const postsToAuthorsRelations = relations(postsToAuthors, ({ one }) => ({
  post: one(posts, {
    fields: [postsToAuthors.postId],
    references: [posts.id],
  }),
  author: one(authors, {
    fields: [postsToAuthors.authorId],
    references: [authors.id],
  }),
}));

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export type Author = typeof authors.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostToTag = typeof postsToTags.$inferSelect;
export type PostToCategory = typeof postsToCategories.$inferSelect;
export type PostToAuthor = typeof postsToAuthors.$inferSelect;
export type User = typeof users.$inferSelect;
