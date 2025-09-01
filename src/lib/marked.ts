import { Marked } from 'marked';
import markedKatexExt from 'marked-katex-extension';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { remark } from 'remark';
import remarkToc from 'remark-toc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkHighlight from 'remark-highlight';

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
      markedKatexExt({
        throwOnError: false,
      }),
    );
  }
  let textProcessor = remark().use(remarkHighlight).use(remarkGfm);
  if (useToc) {
    textProcessor.use(remarkToc);
  }
  if (useLatex) {
    textProcessor.use(remarkMath);
  }

  return {
    marked: marked,
    remark: textProcessor,
  };
}
