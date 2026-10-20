import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('renders empty municipalidades page with public shell without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/municipalidades');
  expect(response?.ok()).toBe(true);

  await expect(page).toHaveTitle('Municipalidades | FEMUCARIBE');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Municipalidades', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('main#contenido-principal')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
});
