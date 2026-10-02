import { expect, test } from '@playwright/test';

test('mobile header starts compact and offers a touch sized menu', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  const menu = nav.getByText('Menú', { exact: true });
  await expect(menu).toBeVisible();
  await expect(
    nav.getByRole('link', { name: 'Noticias', exact: true }),
  ).toBeHidden();
  expect((await page.getByRole('banner').boundingBox())!.height).toBeLessThan(
    180,
  );
  await menu.click();
  await expect(
    nav.getByRole('link', { name: 'Noticias', exact: true }),
  ).toBeVisible();
  for (const link of await nav.locator('.links a').all()) {
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(48);
    expect(
      await link.evaluate((node) =>
        parseFloat(getComputedStyle(node).fontSize),
      ),
    ).toBeGreaterThanOrEqual(16);
  }
});

test('desktop navigation keeps all six links on one row', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const rows = await page
    .locator('.public-navbar .links a')
    .evaluateAll((links) =>
      links.map((link) => link.getBoundingClientRect().y),
    );
  expect(Math.max(...rows) - Math.min(...rows)).toBeLessThanOrEqual(1);
  expect(
    (await page.locator('.public-navbar').boundingBox())!.height,
  ).toBeLessThanOrEqual(88);
});

for (const width of [280, 320, 390, 768, 1024, 1199]) {
  test(`mobile menu uses the full container and can close at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    const control = nav.locator('summary');
    await expect(nav.locator('details')).not.toHaveAttribute('open');
    await control.focus();
    await page.keyboard.press('Enter');
    await expect(
      nav.getByRole('link', { name: 'Noticias', exact: true }),
    ).toBeVisible();
    const panel = await nav.locator('.navigation-panel').boundingBox();
    const container = await nav.locator('.site-container').boundingBox();
    expect(panel!.width).toBeCloseTo(container!.width, 0);
    await expect(control).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(
      nav.getByRole('link', { name: 'Inicio', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(control).toBeFocused();
    await expect(nav.locator('.links')).toBeHidden();
    await page.keyboard.press('Space');
    await expect(nav.locator('.links')).toBeVisible();
    await control.click();
    await expect(nav.locator('.links')).toBeHidden();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });
}

test('institutional utilities and footer groups can be opened and closed by touch', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const utility = page.locator('.utility-disclosure');
  await utility.locator('summary').click();
  await expect(utility.getByRole('link', { name: 'Ley 7600' })).toBeVisible();
  expect(
    (await utility.locator('.utility-links').boundingBox())!.width,
  ).toBeCloseTo(
    (await page.locator('.navbar-container').boundingBox())!.width,
    0,
  );
  await expect(utility.locator('summary')).toBeVisible();
  await utility.locator('summary').click();
  await expect(utility.getByRole('link', { name: 'Ley 7600' })).toBeHidden();
  const footer = page.getByRole('contentinfo');
  for (const details of await footer.locator('details').all()) {
    const summary = details.locator('summary');
    await summary.click();
    await expect(details).toHaveAttribute('open');
    await expect(summary).toBeVisible();
    await summary.click();
    await expect(details).not.toHaveAttribute('open');
  }
  await expect(
    footer.getByRole('link', { name: '(+506) 2768-2000' }),
  ).toBeVisible();
});

test('resize restores desktop navigation and returns focus when compacting', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await nav.locator('summary').focus();
  await page.setViewportSize({ width: 1366, height: 768 });
  await expect(nav.locator('.links')).toBeVisible();
  await expect(nav.locator('summary')).toBeHidden();
  await expect(
    nav.getByRole('link', { name: 'Inicio', exact: true }),
  ).toBeFocused();
  await nav.getByRole('link', { name: 'Noticias', exact: true }).focus();
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(nav.locator('.links')).toBeHidden();
  await expect(nav.locator('summary')).toBeFocused();
});

test('outside clicks close navigation without losing keyboard focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const homeURL = page.url();
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await nav.locator('summary').click();
  await nav.getByRole('link', { name: 'Noticias', exact: true }).focus();
  await page.getByRole('main').getByRole('heading', { level: 1 }).click();
  await expect(page).toHaveURL(homeURL);
  await expect(nav).toBeVisible();
  await expect(nav.locator('.links')).toBeHidden();
  expect(
    await page.evaluate(() =>
      ['SUMMARY', 'MAIN'].includes(document.activeElement?.tagName ?? ''),
    ),
  ).toBe(true);
});

for (const width of [320, 768, 1366]) {
  test(`200% root text and long labels fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('html').evaluate((node) => {
      node.style.fontSize = '200%';
    });
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    await nav.locator('summary').click();
    await nav
      .locator('.links a')
      .last()
      .evaluate((node) => {
        node.textContent = 'NoticiasInstitucionalesConContenidoExtenso';
      });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await expect(nav.locator('.links a').last()).toBeVisible();
  });
}

test('native disclosures remain operable when JavaScript is disabled', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 812 },
  });
  const page = await context.newPage();
  await page.goto(baseURL ?? 'http://127.0.0.1:4322');
  for (const details of await page.locator('details').all()) {
    const summary = details.locator('summary');
    await expect(summary).toBeVisible();
    await expect(details).toHaveAttribute('open');
    await summary.click();
    await expect(details).not.toHaveAttribute('open');
    await summary.click();
    await expect(details).toHaveAttribute('open');
  }
  await page.setViewportSize({ width: 1366, height: 768 });
  await expect(page.locator('.public-navbar .links')).toBeVisible();
  await context.close();
});
