import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('public layout shows shared navigation and empty content with approved links', async ({
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
  await expect(page).toHaveTitle('Inicio | FEMUCARIBE');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  const nav = page.getByRole('navigation', { name: 'Enlaces institucionales' });
  await expect(
    nav.getByRole('link', { name: 'Accesibilidad' }),
  ).toHaveAttribute('href', '/accesibilidad');
  await expect(
    nav.getByRole('link', { name: 'Contraloría de Servicios' }),
  ).toHaveAttribute(
    'href',
    'https://www.mideplan.go.cr/contralorias-de-servicios',
  );
  await expect(nav.getByRole('link', { name: 'Ley 7600' })).toHaveAttribute(
    'href',
    'https://sinalevi.go.cr/ResultadosNormativa/Informacion?param1=23261&param2=96047&param3=1&param4=',
  );
  const main = page.getByRole('main');
  await expect(main.locator('.page-content')).toBeEmpty();
  await expect(main).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(
    nav.getByRole('link', { name: 'Pasar al contenido principal' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(main).toBeFocused();
  await expect(
    page.locator('meta[name="generator"], link[rel="icon"]'),
  ).toHaveCount(0);
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

for (const route of ['/', '/creditos']) {
  test(`public metadata identifies the creator and publisher at ${route}`, async ({
    page,
  }) => {
    await page.goto(route);
    await expect(page.locator('head meta[name="author"]')).toHaveCount(1);
    await expect(page.locator('head meta[name="author"]')).toHaveAttribute(
      'content',
      'Antony Monge López',
    );
    const metadata = page.locator('head script[type="application/ld+json"]');
    await expect(metadata).toHaveCount(1);
    await expect(page.locator('script')).toHaveCount(1);
    await expect(metadata).not.toHaveAttribute('src');
    await expect(
      page.locator('script:not([type="application/ld+json"])'),
    ).toHaveCount(0);
    const website = JSON.parse((await metadata.textContent()) ?? '');
    expect(website).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'FEMUCARIBE',
      inLanguage: 'es',
      creator: {
        '@type': 'Person',
        name: 'Antony Monge López',
        email: 'antonyml2016@gmail.com',
        url: 'https://www.tonyml.com',
      },
      publisher: { '@type': 'Organization', name: 'FEMUCARIBE' },
    });
    expect(website).not.toHaveProperty('url');
    expect(website.publisher).not.toHaveProperty('url');
  });
}
