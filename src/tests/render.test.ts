import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '#lib/markdown.ts';

const fixture = readFileSync(new URL('./fixtures/post.md', import.meta.url), 'utf-8');

describe('post rendering', () => {
  for (const math of [false, true]) {
    for (const toc of [false, true]) {
      it(`renders the fixture with math=${math} toc=${toc}`, async () => {
        await expect(renderMarkdown(fixture, math, toc)).toMatchFileSnapshot(
          `./__snapshots__/post-math-${math}-toc-${toc}.html`,
        );
      });
    }
  }

  it('strips {#...} attribute blocks before rendering', () => {
    expect(renderMarkdown('# Title {#id}\n\ntext {#x} more {#y} end', false, false)).toBe(
      '<h1 id="title"><a aria-hidden="true" tabindex="-1" href="#title"><span class="icon icon-link"></span></a>Title</h1>\n<p>text  more  end</p>',
    );
  });

  it('highlights code also when math is enabled', () => {
    expect(renderMarkdown('```ts\nconst a = 1;\n```', true, false)).toContain(
      '<code class="hljs language-ts"><span class="hljs-keyword">const</span>',
    );
  });

  it('renders ==text== as a highlight', () => {
    expect(renderMarkdown('a ==b== c', false, false)).toBe(
      '<p>a <span class="highlight">b</span> c</p>',
    );
  });

  it('removes scripts and event handlers', () => {
    const html = renderMarkdown(
      '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">',
      false,
      false,
    );
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
  });

  it('renders an empty post', () => {
    expect(renderMarkdown('', true, true)).toBe('');
  });
});
