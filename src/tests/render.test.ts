import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderPost } from './render';

const fixture = readFileSync(new URL('./fixtures/post.md', import.meta.url), 'utf-8');

describe('post rendering', () => {
  for (const math of [false, true]) {
    for (const toc of [false, true]) {
      it(`renders the fixture with math=${math} toc=${toc}`, async () => {
        await expect(renderPost(fixture, math, toc)).toMatchFileSnapshot(
          `./__snapshots__/post-math-${math}-toc-${toc}.html`,
        );
      });
    }
  }

  it('strips {#...} attribute blocks before rendering', () => {
    expect(renderPost('# Title {#id}\n\ntext {#x} more', false, false)).toBe(
      '<h1><a aria-hidden="true" tabindex="-1" href="#title"><span class="icon icon-link"></span></a>Title</h1>\n<p>text  more</p>\n',
    );
  });

  it('removes scripts and event handlers', () => {
    const html = renderPost(
      '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">',
      false,
      false,
    );
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
  });

  it('renders an empty post', () => {
    expect(renderPost('', true, true)).toBe('');
  });
});
