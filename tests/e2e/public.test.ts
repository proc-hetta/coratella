import { test, expect, seedPost, visitsOf } from './fixtures';

test('fills html placeholders from defaults', async ({ page }) => {
  const response = await page.request.get('/');
  const html = await response.text();
  expect(html).toContain('<html data-theme="wintry" data-mode="dark" lang="en">');
  expect(html).toContain('<title>E2E Title</title>');
});

test('fills html placeholders from cookies', async ({ page }) => {
  const response = await page.request.get('/', {
    headers: { cookie: 'theme=rose; mode=dark; PARAGLIDE_LOCALE=it' },
  });
  expect(await response.text()).toContain('<html data-theme="rose" data-mode="dark" lang="it">');
});

test('tampered theme and mode cookies fall back to the defaults', async ({ page }) => {
  const payload = encodeURIComponent('x"><script>window.__injected=1</script><x y="');
  const response = await page.request.get('/', {
    headers: { cookie: `theme=${payload}; mode=${payload}` },
  });
  const html = await response.text();
  expect(html).toContain('<html data-theme="wintry" data-mode="dark" lang="en">');
  expect(html).not.toContain('__injected');

  await page.context().addCookies([
    { name: 'theme', value: payload, url: 'http://localhost:4173' },
    { name: 'mode', value: payload, url: 'http://localhost:4173' },
  ]);
  await page.goto('/admin/tags');
  expect(await page.evaluate(() => (window as { __injected?: number }).__injected)).toBeUndefined();
});

test('home shows post dates as DD/MM/YYYY', async ({ page }) => {
  await seedPost({ title: 'dated', content: 'a', ctime: '2024-06-09T12:00:00Z' });
  await page.goto('/');
  await expect(page.getByText('Created at: 09/06/2024')).toBeVisible();
});

test('home lists only published posts, newest first', async ({ page }) => {
  await seedPost({ title: 'older', content: 'a', ctime: '2024-01-01T00:00:00Z' });
  await seedPost({ title: 'newer', content: 'b', ctime: '2024-06-01T00:00:00Z' });
  await seedPost({ title: 'hidden', content: 'c', draft: true });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('E2E Title');
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['newer', 'older']);
  await expect(page.getByText('#tag-newer').first()).toBeAttached();
  await expect(page.getByText('cat-newer').first()).toBeAttached();
  // Author chips show the nickname only
  await expect(page.getByText('author-newer').first()).toBeAttached();
  await expect(page.getByText('Lovelace')).toHaveCount(0);
});

test('home page data never contains passwords, drafts or content', async ({ page }) => {
  await seedPost({ title: 'locked', content: 'secret-body', password: 'secret-pw' });
  await seedPost({ title: 'secret-draft', content: 'draft-body', draft: true });
  for (const path of ['/', '/__data.json']) {
    const body = await (await page.request.get(path)).text();
    expect(body).toContain('locked');
    for (const secret of ['secret-pw', 'secret-body', 'secret-draft', 'draft-body']) {
      expect(body, `${path} leaks ${secret}`).not.toContain(secret);
    }
  }
});

test('draft posts answer 404', async ({ page }) => {
  const id = await seedPost({ title: 'unfinished', content: 'wip', draft: true });
  const response = await page.goto(`/posts/${id}`);
  expect(response?.status()).toBe(404);
  await expect(page.getByText('wip')).toHaveCount(0);
});

test('renders a post and counts the visit', async ({ page }) => {
  const id = await seedPost({
    title: 'rendered',
    content:
      '# Heading\n\n## Table of contents\n\n## Sub\n\nSome **bold** and $x^2$.\n\n```ts\nconst a = 1;\n```',
  });
  await page.goto(`/posts/${id}`);
  await expect(page.getByRole('heading', { level: 2, name: 'rendered' })).toBeVisible();
  const prose = page.locator('.prose');
  await expect(prose.getByRole('heading', { level: 1, name: 'Heading' })).toBeVisible();
  await expect(prose.locator('strong')).toHaveText('bold');
  await expect(prose.locator('.katex').first()).toBeAttached();
  await expect(prose.locator('code.hljs.language-ts .hljs-keyword')).toHaveText('const');
  await expect(prose.getByRole('link', { name: 'Sub' })).toHaveAttribute('href', '#sub');
  await expect(page.getByRole('link', { name: 'rendered@example.com' })).toHaveAttribute(
    'href',
    'mailto:rendered@example.com',
  );
  await expect(page.getByText('#tag-rendered')).toBeVisible();
  expect(await visitsOf(id)).toBeGreaterThanOrEqual(1);
});

test('protects posts with a password', async ({ page }) => {
  const id = await seedPost({ title: 'secret', content: 'hidden body', password: 'pw' });
  await page.goto(`/posts/${id}`);
  await expect(page).toHaveURL(`/password?post=${id}`);
  await page.getByPlaceholder('Password').fill('wrong');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Incorrect password')).toBeVisible();
  await page.getByPlaceholder('Password').fill('pw');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(`/posts/${id}`);
  await expect(page.getByText('hidden body')).toBeVisible();
  // The password never appears in the URL, and the post stays unlocked
  await page.reload();
  await expect(page.getByText('hidden body')).toBeVisible();
});

test('hovering a post link does not count a visit', async ({ page }) => {
  const id = await seedPost({ title: 'hovered', content: 'x' });
  await page.goto('/');
  await page.getByRole('heading', { name: 'hovered' }).hover();
  await page.waitForTimeout(500);
  expect(await visitsOf(id)).toBe(0);
});

test('dark mode is the default, system mode follows the operating system', async ({
  page,
  context,
}) => {
  const colorScheme = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  expect(await colorScheme()).toBe('dark');

  await context.addCookies([{ name: 'mode', value: 'system', url: 'http://localhost:4173' }]);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'system');
  expect(await colorScheme()).toBe('dark');
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await colorScheme()).toBe('light');
});

test('password page without post redirects home', async ({ page }) => {
  await page.goto('/password');
  await expect(page).toHaveURL('/');
});

test('missing post answers 404', async ({ page }) => {
  const response = await page.goto('/posts/999');
  expect(response?.status()).toBe(404);
});

test('admin requires a session', async ({ page }) => {
  await page.goto('/admin/tags');
  await expect(page).toHaveURL('/login');
});

test('the logo follows the color mode', async ({ page, context }) => {
  // Index of the visible logo: 0 for light, 1 for dark
  const visibleLogo = async () => {
    const logos = page.locator('img[alt="Coratella Logo"]');
    await expect(logos).toHaveCount(2);
    return (await logos.evaluateAll((imgs) => imgs.map((img) => img.checkVisibility()))).indexOf(
      true,
    );
  };
  await page.emulateMedia({ colorScheme: 'dark' });
  for (const [mode, expected] of [
    ['light', 0],
    ['dark', 1],
    ['system', 1],
  ] as const) {
    await context.addCookies([{ name: 'mode', value: mode, url: 'http://localhost:4173' }]);
    await page.goto('/');
    expect(await visibleLogo(), mode).toBe(expected);
  }
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await visibleLogo(), 'system, light OS').toBe(0);
});
