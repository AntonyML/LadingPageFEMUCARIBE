import { expect, test } from '@playwright/test';

test('built starter serves HTML and its local assets without browser errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (
      new URL(response.url()).origin === 'http://127.0.0.1:4322' &&
      response.status() >= 400
    ) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
  await expect(page.locator('main')).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});
