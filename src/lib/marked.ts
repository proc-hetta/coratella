import { Marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { remark } from 'remark';
import { unified } from 'unified';
import remarkToc from 'remark-toc';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import rehypeStringify from 'rehype-stringify';
import rehypeKatex from 'rehype-katex';

export function getMarkdownProcessors(useLatex: boolean, useToc: boolean) {
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
  if (useLatex) {
    marked.use(
      markedKatex({
        throwOnError: false,
      }),
    );
  }
  let textProcessor = remark().use(remarkGfm);
  if (useToc) {
    textProcessor.use(remarkToc);
  }
  if (useLatex) {
    textProcessor.use(remarkMath).use(remarkRehype).use(rehypeKatex).use(rehypeStringify);
  }

  return {
    marked: marked,
    remark: textProcessor,
  };
}
