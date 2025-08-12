import { Marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { remark } from 'remark';
import remarkToc from 'remark-toc';

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
    marked.use(markedKatex({
      throwOnError: false,
    }));
  }
  let textProcessor = useToc ? remark().use(remarkToc) : remark();

  return {
    marked: marked,
    remark: textProcessor,
  };
}
