import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const heading = 'Directorio de Gobiernos Locales Miembro';
const directoryLinkText = 'Ver directorio detallado (03 · Municipalidades)';
const cantons = [
  'Limón',
  'Talamanca',
  'Matina',
  'Guácimo',
  'Pococí',
  'Parrita',
] as const;

function localGovernments(page: Page) {
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

async function expectLocalGovernmentsContent(page: Page) {
  const region = localGovernments(page);
  await expect(region).toBeVisible();
  await expect(
    region.getByRole('heading', { level: 2, exact: true }),
  ).toHaveText(heading);

  const link = region.getByRole('link', {
    name: directoryLinkText,
    exact: true,
  });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', '/municipalidades');

  const items = region.getByRole('listitem');
  await expect(items).toHaveCount(cantons.length);

  for (const [index, name] of cantons.entries()) {
    const card = items.nth(index);
    await expect(
      card.getByRole('heading', { level: 3, name, exact: true }),
    ).toBeVisible();
    await expect(
      card.getByText('Municipalidad', { exact: true }),
    ).toBeVisible();
    expect((await card.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
}

async function expectLocalGovernmentsReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  await expectLocalGovernmentsContent(page);
  const region = localGovernments(page);
  const bounds = await region
    .locator('h2, h3, a, span, .card, ul, li')
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
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width);
}

test('renders directory of 6 local governments with link and accessible headings without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await expectLocalGovernmentsContent(page);
});

test('supports keyboard navigation with visible focus on directory link', async ({
  page,
}) => {
  await page.goto('/');
  const link = localGovernments(page).getByRole('link', {
    name: directoryLinkText,
    exact: true,
  });
  await link.focus();
  await expectVisibleFocus(link);
});

for (const width of [280, 320, 360, 480, 768, 1024, 1280, 1440]) {
  test(`maintains reflow and readable cards at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expectLocalGovernmentsReflow(page, width);
  });
}

test('maintains reflow in landscape mode (844x390)', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await expectLocalGovernmentsReflow(page, 844);
});

test('adapts to 200% text zoom at 320px without horizontal scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px';
  });
  await expectLocalGovernmentsReflow(page, 320);
});
