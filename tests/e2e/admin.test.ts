import type { Page } from '@playwright/test';
import { test, expect, login, admin, seedPost } from './fixtures';

const toast = (page: Page, text: string) =>
  expect(page.getByText(text, { exact: true }).first()).toBeVisible();

const dialog = (page: Page) => page.getByRole('dialog');

async function confirm(page: Page) {
  await dialog(page).getByRole('button', { name: 'Confirm' }).click();
}

/** Form dialogs stay open after a successful submission: dismiss them. */
async function dismiss(page: Page) {
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toHaveCount(0);
}

test('login rejects wrong credentials', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'E2E Title dashboard login' })).toBeVisible();
  await page.getByPlaceholder('Username').fill(admin.username);
  await page.getByPlaceholder('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();
  await toast(page, 'Incorrect username or password');
  await expect(page).toHaveURL('/login');
});

test('dashboard shows counters and logout ends the session', async ({ page }) => {
  await seedPost({ title: 'p', content: 'c' });
  await login(page);
  await expect(page.getByRole('heading', { name: 'E2E Title dashboard' })).toBeVisible();
  for (const name of ['Posts', 'Tags', 'Categories', 'Users', 'Authors', 'Visitors']) {
    await expect(page.getByRole('heading', { level: 5, name })).toBeVisible();
  }
  await page.getByRole('link', { name: admin.username }).click();
  await expect(page).toHaveURL('/admin/profile');
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/login');
  await page.goto('/admin');
  await expect(page).toHaveURL('/login');
});

test('tags: create, edit, delete', async ({ page }) => {
  await login(page);
  await page.goto('/admin/tags');
  const rows = page.locator('tbody tr');

  await page.locator('h4', { hasText: 'Tags' }).locator('..').getByRole('button').click();
  await expect(dialog(page).getByText('Create tag')).toBeVisible();
  await dialog(page).locator('input[name=name]').fill('svelte');
  await confirm(page);
  await toast(page, 'Tag successfully created');
  await dismiss(page);
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('svelte');

  await rows.first().getByRole('button').first().click();
  await expect(dialog(page).getByText('Edit tag')).toBeVisible();
  await dialog(page).locator('input[name=name]').fill('kit');
  await confirm(page);
  await toast(page, 'Modify success');
  await dismiss(page);
  await expect(rows.first()).toContainText('kit');

  await rows.first().getByRole('button').last().click();
  await expect(dialog(page).getByText('Do you want to delete kit?')).toBeVisible();
  await confirm(page);
  await toast(page, 'Tag deleted');
  await expect(rows).toHaveCount(0);
});

test('tags: empty name is rejected', async ({ page }) => {
  await login(page);
  await page.goto('/admin/tags');
  await page.locator('h4', { hasText: 'Tags' }).locator('..').getByRole('button').click();
  await confirm(page);
  await toast(page, 'Missing required parameters: Name');
});

test('categories: create with color and delete', async ({ page }) => {
  await login(page);
  await page.goto('/admin/categories');
  const rows = page.locator('tbody tr');
  await page.locator('h4', { hasText: 'Categories' }).locator('..').getByRole('button').click();
  // Current labels reuse the tag messages
  await expect(dialog(page).getByText('Create tag')).toBeVisible();
  await dialog(page).locator('input[name=name]').fill('news');
  await dialog(page).locator('input[name=color]').fill('#00ff00');
  await confirm(page);
  await toast(page, 'Tag successfully created');
  await dismiss(page);
  await expect(rows.first()).toContainText('news');
  await expect(rows.first().locator('svg').first()).toHaveAttribute('fill', '#00ff00');

  await rows.first().getByRole('button').last().click();
  await confirm(page);
  await toast(page, 'Category deleted');
  await expect(rows).toHaveCount(0);
});

test('authors: create, validate email, delete', async ({ page }) => {
  await login(page);
  await page.goto('/admin/authors');
  const rows = page.locator('tbody tr');
  const open = () =>
    page.locator('h4', { hasText: 'Authors' }).locator('..').getByRole('button').click();

  await open();
  await expect(dialog(page).getByText('Create author')).toBeVisible();
  await dialog(page).locator('input[name=nickname]').fill('ada');
  await dialog(page).locator('input[name=email]').fill('not-an-email');
  await confirm(page);
  // The browser refuses to submit an invalid e-mail
  await expect(dialog(page).locator('input[name=email]:invalid')).toHaveCount(1);
  await dismiss(page);
  await open();
  await dialog(page).locator('input[name=nickname]').fill('ada');
  await dialog(page).locator('input[name=email]').fill('ada@example.com');
  await dialog(page).locator('input[name=firstName]').fill('Ada');
  await dialog(page).locator('input[name=lastName]').fill('Lovelace');
  await confirm(page);
  await toast(page, 'Author successfully created');
  await dismiss(page);
  await expect(rows.first()).toContainText('ada@example.com');
  await expect(rows.first()).toContainText('Lovelace');

  await rows.first().getByRole('button').last().click();
  await confirm(page);
  await toast(page, 'Author deleted');
  await expect(rows).toHaveCount(0);
});

// Without Torcolo credentials, a received image is reported as such
test('authors: create with an image sends the file', async ({ page }) => {
  await login(page);
  await page.goto('/admin/authors');
  await page.locator('h4', { hasText: 'Authors' }).locator('..').getByRole('button').click();
  await dialog(page).locator('input[name=nickname]').fill('grace');
  await dialog(page).locator('input[name=email]').fill('grace@example.com');
  await dialog(page)
    .locator('input[type=file]')
    .setInputFiles({ name: 'grace.png', mimeType: 'image/png', buffer: Buffer.from('png') });
  await expect(dialog(page).getByRole('img')).toBeVisible();
  await confirm(page);
  await toast(page, 'Error: Torcolo credentials are either invalid or not provided');
  await expect(page.locator('tbody tr')).toHaveCount(0);
});

test('users: create and delete, own user cannot be deleted', async ({ page }) => {
  await login(page);
  await page.goto('/admin/users');
  const rows = page.locator('tbody tr');
  await expect(rows.first().getByRole('button').last()).toBeDisabled();

  await page.locator('h4', { hasText: 'Users' }).locator('..').getByRole('button').click();
  await dialog(page).locator('input[name=username]').fill('bob');
  await dialog(page).locator('input[name=password]').fill('bob-password');
  await confirm(page);
  await toast(page, 'User created successfully');
  await dismiss(page);
  const bob = rows.filter({ hasText: 'bob' });
  await expect(bob).toHaveCount(1);

  await bob.getByRole('button').last().click();
  await confirm(page);
  await toast(page, 'User deleted');
  await expect(bob).toHaveCount(0);
});

test('profile: password mismatch is rejected', async ({ page }) => {
  await login(page);
  await page.goto('/admin/profile');
  await page.locator('input[name=password]').fill('a');
  await page.locator('input[name=repeatPassword]').fill('b');
  await page.getByRole('button', { name: 'Save' }).click();
  await toast(page, "Password doesn't match");
});

test('posts: create, preview, edit', async ({ page }) => {
  await seedPost({ title: 'existing', content: 'x' });
  await login(page);
  await page.goto('/admin/posts');
  await page.locator('h4', { hasText: 'Posts' }).locator('..').getByRole('button').click();
  await expect(page).toHaveURL('/admin/posts/new');

  await page.locator('input[name=title]').fill('fresh post');
  await page.getByPlaceholder('Content').fill('# Hello\n\n**strong** text');
  await page.getByLabel('cat-existing').check();
  await page.getByLabel('author-existing').check();
  await page.getByLabel('tag-existing').check();

  await page.getByRole('tab', { name: 'Preview' }).click();
  const prose = page.locator('.prose');
  await expect(prose.getByRole('heading', { level: 1, name: 'Hello' })).toBeVisible();
  await expect(prose.locator('strong')).toHaveText('strong');
  await page.getByRole('tab', { name: 'Editor' }).click();

  await page.getByRole('button', { name: 'Save as draft' }).click();
  await toast(page, 'Post saved');
  await expect(page).toHaveURL('/admin/posts');
  const row = page.locator('tbody tr', { hasText: 'fresh post' });
  await expect(row).toContainText('author-existing');
  await expect(row).toContainText('cat-existing');
  await expect(row).toContainText('tag-existing');
  await expect(row.locator('td').nth(5).locator('svg')).toHaveCount(1);

  await row.getByRole('button').first().click();
  await expect(page).toHaveURL(/\/admin\/posts\/\d+$/);
  await expect(page.locator('input[name=title]')).toHaveValue('fresh post');
  await page.locator('input[name=title]').fill('renamed post');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await toast(page, 'Post saved');
  const renamed = page.locator('tbody tr', { hasText: 'renamed post' });
  await expect(renamed.locator('td').nth(5).locator('svg')).toHaveCount(0);
  // The post is updated in place
  await expect(page.locator('tbody tr', { hasText: 'fresh post' })).toHaveCount(0);
});

test('posts: saving without authors or categories fails', async ({ page }) => {
  await login(page);
  await page.goto('/admin/posts/new');
  await page.locator('input[name=title]').fill('orphan');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await toast(page, 'Error while saving');
  await expect(page).toHaveURL('/admin/posts/new');
});

test('posts: delete from the list', async ({ page }) => {
  await seedPost({ title: 'sticky', content: 'x' });
  await login(page);
  await page.goto('/admin/posts');
  const row = page.locator('tbody tr', { hasText: 'sticky' });
  await row.getByRole('button').last().click();
  await expect(dialog(page).getByText('Do you want to delete sticky?')).toBeVisible();
  await confirm(page);
  await toast(page, 'Post deleted');
  await expect(row).toHaveCount(0);
});

test('theme switcher updates attributes and cookies', async ({ page, context }) => {
  await login(page);
  await page.locator('header').getByRole('button').first().click();
  await page.getByRole('button', { name: 'rose', exact: true }).click();
  await page.getByRole('button', { name: 'dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'rose');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  const cookies = Object.fromEntries((await context.cookies()).map((c) => [c.name, c]));
  const inAYear = Date.now() / 1000 + 360 * 24 * 60 * 60;
  for (const [name, value] of [
    ['theme', 'rose'],
    ['mode', 'dark'],
  ]) {
    expect(cookies[name]).toMatchObject({ value, sameSite: 'Lax', path: '/' });
    expect(cookies[name].expires).toBeGreaterThan(inAYear);
  }

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'rose');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
});
