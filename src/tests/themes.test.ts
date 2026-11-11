import { describe, expect, it } from 'vitest';
import { modeOrDefault, themeOrDefault } from '#lib/themes.ts';

describe('theme and mode allow-lists', () => {
  it('keeps known values', () => {
    expect(themeOrDefault('rose')).toBe('rose');
    expect(modeOrDefault('dark')).toBe('dark');
  });

  it.each([undefined, null, '', 'unknown', 'Rose', 'x"><script>alert(1)</script>'])(
    'falls back to the default for %j',
    (value) => {
      expect(themeOrDefault(value)).toBe('wintry');
      expect(modeOrDefault(value)).toBe('dark');
    },
  );
});
