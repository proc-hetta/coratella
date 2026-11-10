import DOMPurify from 'isomorphic-dompurify';
import { getMarkdownProcessors } from '$lib/marked';

/** Mirrors the rendering performed by `src/routes/(non-admin)/posts/[id=number]/+page.svelte`. */
export function renderPost(content: string, math: boolean, toc: boolean) {
  const { preprocess, marked, remark, rehype } = getMarkdownProcessors(math, toc);
  const processed = marked.parse(String(remark.processSync(preprocess(content))));
  const renderedHtml = String(rehype.processSync(processed as string));
  return DOMPurify.sanitize(renderedHtml);
}
