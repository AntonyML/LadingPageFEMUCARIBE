import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:4323', javaScriptEnabled: false });

test('keyboard skip link, visible focus and supplied destinations work without JS', async ({
  page,
}) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Enlaces institucionales' });
  await expect(nav.getByRole('link')).toHaveCount(4);
  await page.keyboard.press('Tab');
  const skip = nav.getByRole('link', { name: 'Pasar al contenido principal' });
  await expect(skip).toBeFocused();
  expect(await skip.evaluate((a) => getComputedStyle(a).outlineStyle)).toBe(
    'solid',
  );
  await page.keyboard.press('Enter');
  await expect(page.locator('#contenido')).toBeFocused();
  const targets: Array<[string, string]> = [
    ['Accesibilidad', 'accesibilidad'],
    ['Contraloría de Servicios', 'contraloria'],
    ['Ley 7600', 'ley-7600'],
  ];
  for (const [label, id] of targets) {
    await nav.getByRole('link', { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeFocused();
  }
});

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`no overflow and reachable targets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.identity img')).toBeVisible();
    expect(
      await page
        .locator('.identity img')
        .evaluate(
          (img) => img instanceof HTMLImageElement && img.naturalWidth > 0,
        ),
    ).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    for (const link of await page
      .getByRole('navigation')
      .getByRole('link')
      .all()) {
      const box = await link.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(width < 1100 ? 44 : 24);
    }
    if (width === 1440) {
      expect(
        (await page.locator('.government-bar').boundingBox())?.height,
      ).toBe(48);
      expect(
        await page
          .locator('.government-bar')
          .evaluate((bar) => getComputedStyle(bar).backgroundColor),
      ).toBe('rgb(30, 58, 95)');
    }
    await page.locator('.government-bar').screenshot({
      path: test.info().outputPath(`topbar-${width}.png`),
    });
  });
}

test('long content and 200% text remain visible without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  await page.locator('.government-bar').evaluate((bar) => {
    (bar as HTMLElement).style.fontSize = '26px';
    const label = bar.querySelector('.comptroller');
    if (label) label.textContent = 'ContraloríaDeServicios'.repeat(5);
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await expect(page.getByRole('link', { name: 'Ley 7600' })).toBeVisible();
});
