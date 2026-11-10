import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkToc from 'remark-toc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkHighlight from 'remark-highlight';
import { rehype } from 'rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';

/** Strips `{#...}` attribute blocks, which the renderers below do not support. */
function preprocess(text: string) {
  return text.replaceAll(/\{#.+\}/g, '');
}

/**
 * Renders post markdown to HTML. The content goes through, in order:
 * `preprocess` -> remark (GFM, optional TOC and math) -> marked (code highlighting) -> rehype
 * (heading slugs and anchors). The result is not sanitized.
 */
export function renderMarkdown(content: string, useMath: boolean, useToc: boolean) {
  const remarkProcessor = remark().use(remarkHighlight).use(remarkGfm);
  if (useToc) {
    remarkProcessor.use(remarkToc);
  }
  if (useMath) {
    remarkProcessor.use(remarkMath).use(remarkRehype).use(rehypeKatex).use(rehypeStringify);
  }

  const marked = new Marked(
    markedHighlight({
      emptyLangClass: 'hljs',
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
    }),
  );
  marked.use({ async: false, gfm: true });

  const rehypeProcessor = rehype()
    .data('settings', { fragment: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings);

  const markdown = String(remarkProcessor.processSync(preprocess(content)));
  const html = marked.parse(markdown) as string;
  return String(rehypeProcessor.processSync(html));
}
