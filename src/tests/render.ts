import DOMPurify from 'isomorphic-dompurify';
import { renderMarkdown } from '#lib/marked.ts';

/** Mirrors the rendering performed by `src/routes/(non-admin)/posts/[id=number]/+page.svelte`. */
export function renderPost(content: string, math: boolean, toc: boolean) {
  return DOMPurify.sanitize(renderMarkdown(content, math, toc));
}
