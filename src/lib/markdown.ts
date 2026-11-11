import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHighlight from 'remark-highlight';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import remarkToc from 'remark-toc';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';

// GitHub-style sanitization that also keeps classes (`==mark==` spans, math, raw HTML).
// remark-rehype already prefixes footnote ids: only `name` (which can clobber `document`) is prefixed.
const sanitizeSchema = {
  ...defaultSchema,
  clobber: ['name'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
  },
};

/**
 * Renders post markdown to sanitized HTML. Plugins after `rehypeSanitize` only add trusted markup
 * (KaTeX, highlighting, heading anchors).
 */
export function renderMarkdown(content: string, useMath: boolean, useToc: boolean) {
  const processor = remark()
    .use(remarkHighlight)
    .use(remarkGfm)
    .use(useToc ? [remarkToc] : [])
    .use(useMath ? [remarkMath] : [])
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(useMath ? [rehypeKatex] : [])
    .use(rehypeHighlight)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify);

  // `{#id}` attribute blocks are not supported: drop them.
  return String(processor.processSync(content.replaceAll(/\{#[^}]*\}/g, '')));
}
