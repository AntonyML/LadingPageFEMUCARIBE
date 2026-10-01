import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

for (const width of [1280, 1366, 1816]) {
  test(`navbar keeps a single balanced row when content fits at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 768 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const groups = await page.locator('.navbar-content').evaluate((node) =>
      [...node.children].map((child) => {
        const rect = child.getBoundingClientRect();
        return { x: rect.x, center: rect.y + rect.height / 2 };
      }),
    );
    expect(
      Math.max(...groups.map((group) => group.center)) -
        Math.min(...groups.map((group) => group.center)),
    ).toBeLessThanOrEqual(1);
    expect(groups[0]!.x).toBeLessThan(groups[1]!.x);
    expect(groups[1]!.x).toBeLessThan(groups[2]!.x);
    await expect(
      page.getByRole('navigation', { name: 'Navegación principal' }),
    ).toBeVisible();
    await page.locator('.public-navbar').screenshot({
      path: test.info().outputPath(`balanced-navbar-${width}.png`),
    });
  });
}

test('navbar uses the available container width even in a wide window', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1816, height: 768 });
  await page.goto('/');
  await page.locator('html').evaluate((node) => {
    node.style.fontSize = '12px';
  });
  await page.evaluate(() => document.fonts.ready);
  const brand = await page.locator('.public-navbar .brand').boundingBox();
  const links = await page.locator('.public-navbar .links').boundingBox();
  const actions = await page.locator('.public-navbar .actions').boundingBox();
  expect(links!.y).toBeGreaterThanOrEqual(brand!.y + brand!.height);
  expect(
    Math.abs(links!.y + links!.height / 2 - actions!.y - actions!.height / 2),
  ).toBeLessThanOrEqual(1);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(1816);
});

test('compact navbar maintains reading order and fills the second row', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  const brand = nav.getByRole('link', { name: 'FEMUCARIBE, Inicio' });
  await brand.focus();
  await page.keyboard.press('Tab');
  await expect(
    nav.getByRole('link', { name: 'Inicio', exact: true }),
  ).toBeFocused();
  const links = await nav.locator('.links').boundingBox();
  const actions = await nav.locator('.actions').boundingBox();
  expect(
    Math.abs(links!.y + links!.height / 2 - actions!.y - actions!.height / 2),
  ).toBeLessThanOrEqual(1);
  const container = await nav.locator('.site-container').boundingBox();
  expect(actions!.x + actions!.width).toBeCloseTo(
    container!.x + container!.width,
    0,
  );
  await nav.screenshot({
    path: test.info().outputPath('balanced-navbar-1024.png'),
  });
});
