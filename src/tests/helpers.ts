import type { Cookies } from '@sveltejs/kit';
import type { FullPost } from '$lib/server/db/posts';

export function formRequest(fields: Record<string, string>, url = 'http://localhost/') {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.append(key, value);
  return new Request(url, { method: 'POST', body });
}

export function jsonRequest(method: string, payload: unknown, url = 'http://localhost/') {
  return new Request(url, { method, body: JSON.stringify(payload) });
}

export type CookieOperation =
  | { op: 'set'; name: string; value: string; options: object }
  | { op: 'delete'; name: string; options: object };

export function cookieJar(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  const operations: CookieOperation[] = [];
  const cookies = {
    get: (name: string) => store.get(name),
    getAll: () => [...store].map(([name, value]) => ({ name, value })),
    set: (name: string, value: string, options: object) => {
      store.set(name, value);
      operations.push({ op: 'set', name, value, options });
    },
    delete: (name: string, options: object) => {
      store.delete(name);
      operations.push({ op: 'delete', name, options });
    },
    serialize: () => '',
  } as unknown as Cookies;
  return { cookies, operations };
}

/** Calls a SvelteKit load/action/handler with a partial event. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function call<T>(fn: (...args: any[]) => T, event: object): T {
  return fn(event);
}

/** Runs a function expected to throw (redirect/error) and returns what it threw. */
export async function thrown(fn: () => unknown) {
  try {
    await fn();
  } catch (e) {
    return e;
  }
  throw new Error('expected a throw');
}

export function newPost(overrides: Partial<FullPost> = {}): FullPost {
  return {
    id: -1,
    title: 'Title',
    content: '# Content',
    password: null,
    draft: false,
    toc: false,
    math: false,
    mtime: new Date('2024-01-01T00:00:00Z'),
    ctime: new Date('2024-01-01T00:00:00Z'),
    visits: 0,
    tags: [],
    categories: [],
    authors: [],
    ...overrides,
  };
}
