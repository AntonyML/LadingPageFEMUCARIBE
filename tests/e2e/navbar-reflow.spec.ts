import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

for (const width of [1280, 1366, 1816]) {
  test(`navbar keeps a single balanced row when content fits at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 768 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const groups = await page
      .locator(
        '.public-navbar .brand, .public-navbar .links, .public-navbar .actions',
      )
      .evaluateAll((nodes) =>
        nodes.map((child) => {
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
    node.style.fontSize = '200%';
  });
  await page.evaluate(() => document.fonts.ready);
  const brand = await page.locator('.public-navbar .brand').boundingBox();
  const links = await page.locator('.public-navbar .links').boundingBox();
  const actions = await page.locator('.public-navbar .actions').boundingBox();
  expect(links!.y).toBeGreaterThanOrEqual(brand!.y + brand!.height);
  expect(actions!.y).toBeGreaterThanOrEqual(links!.y + links!.height);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(1816);
});

test('compact navbar maintains reading order and offers the menu before links', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  const brand = nav.getByRole('link', { name: 'FEMUCARIBE, Inicio' });
  await brand.focus();
  await page.keyboard.press('Tab');
  await expect(nav.locator('summary')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    nav.getByRole('link', { name: 'Inicio', exact: true }),
  ).toBeFocused();
  const links = await nav.locator('.links').boundingBox();
  const actions = await nav.locator('.actions').boundingBox();
  expect(actions!.y).toBeGreaterThanOrEqual(links!.y + links!.height);
  const container = await nav.locator('.site-container').boundingBox();
  expect(actions!.x + actions!.width).toBeCloseTo(
    container!.x + container!.width,
    0,
  );
  await nav.screenshot({
    path: test.info().outputPath('balanced-navbar-1024.png'),
  });
});
