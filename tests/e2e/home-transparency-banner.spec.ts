import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const heading = 'Portal de Transparencia Activa y Rendición de Cuentas';
const description =
  'Consulte en línea presupuestos, actas de asamblea y consejo, compras en SICOP y preguntas frecuentes normativas.';
const linkText = 'Ver Transparencia (05)';

function transparencyBanner(page: Page) {
  return page.getByRole('region', { name: heading, exact: true });
}

async function expectVisibleFocus(target: Locator) {
  await expect(target).toBeFocused();
  const outline = await target.evaluate((node) => {
    const style = getComputedStyle(node);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
  expect(outline.style).toBe('solid');
  expect(outline.width).toBeGreaterThanOrEqual(2);
}

async function expectBannerReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  const region = transparencyBanner(page);
  await expect(region).toBeVisible();
  const bounds = await region.locator('h2, p, a').evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        overflow: node.scrollWidth - node.clientWidth,
      };
    }),
  );

  expect(bounds).toHaveLength(3);
  for (const bound of bounds) {
    expect(bound.left).toBeGreaterThanOrEqual(0);
    expect(bound.right).toBeLessThanOrEqual(width + 1);
    expect(bound.overflow).toBeLessThanOrEqual(1);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width);
}

test('renders the transparency banner and link without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);

  const region = transparencyBanner(page);
  await expect(
    region.getByRole('heading', { level: 2, exact: true }),
  ).toHaveText(heading);
  await expect(region.getByText(description, { exact: true })).toBeVisible();

  const link = region.getByRole('link', { name: linkText, exact: true });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', '/transparencia');
  expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

test('supports keyboard navigation with visible focus on the transparency link', async ({
  page,
}) => {
  await page.goto('/');
  const link = transparencyBanner(page).getByRole('link', {
    name: linkText,
    exact: true,
  });
  await link.focus();
  await expectVisibleFocus(link);
});

for (const width of [
  280, 320, 360, 480, 640, 767, 768, 1024, 1280, 1440, 1920, 3840,
]) {
  test(`maintains reflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expectBannerReflow(page, width);
  });
}

test('maintains reflow in landscape mode (844x390)', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await expectBannerReflow(page, 844);
});

for (const width of [320, 768, 1440]) {
  test(`adapts to 200% text zoom at ${width}px without horizontal scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });
    await expectBannerReflow(page, width);
  });
}
