import { expect, test, type Locator } from '@playwright/test';

test.use({ javaScriptEnabled: false });

async function expectVisibleFocus(target: Locator) {
  await expect(target).toBeFocused();
  const outline = await target.evaluate((node) => {
    const style = getComputedStyle(node);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
  expect(outline.style).toBe('solid');
  expect(outline.width).toBeGreaterThanOrEqual(2);
}

test('accessibility guidance and institutional contact work without JavaScript', async ({
  page,
}) => {
  await page.goto('/accesibilidad');

  await expect(
    page.getByRole('heading', { name: 'Accesibilidad', level: 1 }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Información del sitio' })
      .getByRole('link', { name: 'Accesibilidad', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    page.getByRole('heading', {
      name: 'Salta al contenido principal',
      level: 3,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Navega con el teclado', level: 3 }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Ajusta el tamaño de lectura',
      level: 3,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Escribir a FEMUCARIBE' }),
  ).toHaveAttribute('href', 'mailto:info@femucaribe.go.cr');
  await expect(
    page
      .getByRole('navigation', { name: 'Información legal, pie de página' })
      .getByRole('link', { name: 'Accesibilidad', exact: true }),
  ).toHaveAttribute('href', '/accesibilidad');

  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', {
    name: 'Pasar al contenido principal',
  });
  await expectVisibleFocus(skipLink);
  await page.keyboard.press('Enter');
  await expectVisibleFocus(page.getByRole('main'));
});

for (const width of [
  280, 320, 375, 767, 768, 1024, 1199, 1200, 1440, 1920, 3840,
]) {
  test(`accessibility page reflows at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/accesibilidad');
    await page.evaluate(() => document.fonts.ready);

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const bounds = await page
      .getByRole('main')
      .locator('h1, h2, h3, p, li, a, section')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            overflow: node.scrollWidth - node.clientWidth,
          };
        }),
      );
    expect(bounds.length).toBeGreaterThan(0);
    for (const bound of bounds) {
      expect(bound.left).toBeGreaterThanOrEqual(0);
      expect(bound.right).toBeLessThanOrEqual(width + 1);
      expect(bound.overflow).toBeLessThanOrEqual(1);
    }
  });
}

test('accessibility page reflows in landscape orientation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/accesibilidad');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(844);
});

for (const width of [320, 768, 1440]) {
  test(`accessibility page reflows with 200% text at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/accesibilidad');
    await page.evaluate(() => {
      const textNodes = document.querySelectorAll<HTMLElement>(
        'h1, h2, h3, p, li, a',
      );
      for (const node of textNodes) {
        const size = parseFloat(getComputedStyle(node).fontSize);
        node.style.fontSize = `${size * 2}px`;
      }
    });

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });
}
