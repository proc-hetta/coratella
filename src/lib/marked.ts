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

export function getMarkdownProcessors(useMath: boolean, useToc: boolean) {
  const marked = new Marked(
    markedHighlight({
      emptyLangClass: 'hljs',
      langPrefix: 'hljs language-',
      highlight(code, lang, _info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
    }),
  );

  marked.use({
    async: false,
    gfm: true,
  });

  let textPreprocessor = (text: String) => {
    return text.replaceAll(/\{\#.+\}/g, '').toString();
  };

  let textProcessor = remark().use(remarkHighlight).use(remarkGfm);

  let htmlProcessor = rehype()
    .data('settings', { fragment: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings);

  if (useToc) {
    textProcessor.use(remarkToc);
  }
  if (useMath) {
    textProcessor.use(remarkMath).use(remarkRehype).use(rehypeKatex).use(rehypeStringify);
  }

  return {
    preprocess: textPreprocessor,
    marked: marked,
    remark: textProcessor,
    rehype: htmlProcessor,
  };
}
