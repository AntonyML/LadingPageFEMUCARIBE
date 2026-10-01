import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`navbar is reachable without JS and without overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(nav).toBeVisible();
    await expect(nav.locator('[aria-current="page"]')).toHaveText('Inicio');
    await expect(
      nav.getByRole('link', { name: 'FEMUCARIBE, Inicio' }),
    ).toHaveAttribute('href', '/');
    const expected = [
      '/',
      '/nosotros',
      '/municipalidades',
      '/proyectos',
      '/transparencia',
      '/noticias',
    ];
    expect(
      await nav
        .locator('.links a')
        .evaluateAll((links) => links.map((a) => a.getAttribute('href'))),
    ).toEqual(expected);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    expect(
      await nav
        .locator('img')
        .evaluate((img) => (img as HTMLImageElement).naturalWidth),
    ).toBeGreaterThan(0);
    for (const a of await nav.getByRole('link').all()) {
      await expect(a).toBeVisible();
      const box = await a.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(width < 1400 ? 44 : 24);
    }
    if (width === 1440) expect((await nav.boundingBox())?.height).toBe(72);
    await page.evaluate(() => document.fonts.ready);
    await nav.screenshot({
      path: test.info().outputPath(`navbar-${width}.png`),
    });
  });
}

test('keyboard focus remains visible in the primary navigation', async ({
  page,
}) => {
  await page.goto('/');
  const brand = page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: 'FEMUCARIBE, Inicio' });
  await brand.focus();
  await page.keyboard.press('Tab');
  const active = page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: 'Inicio', exact: true });
  await expect(active).toBeFocused();
  expect(await active.evaluate((a) => getComputedStyle(a).outlineStyle)).toBe(
    'solid',
  );
});

test('long text and enlarged text reflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  await page.locator('.public-navbar').evaluate((nav) => {
    for (const a of nav.querySelectorAll('.links a')) {
      (a as HTMLElement).style.fontSize = '27px';
      a.textContent = `${a.textContent}ConContenidoExtenso`;
    }
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
