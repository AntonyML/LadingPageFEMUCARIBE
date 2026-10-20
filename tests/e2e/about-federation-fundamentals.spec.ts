import { expect, test, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const heading = '¿Qué es una Federación Municipal?';
const overline = 'FUNDAMENTOS INSTITUCIONALES';
const legalBase =
  'Base Legal: Arts. 9-11 Código Municipal (Ley N.º 7794) · La Gaceta N.° 108.';
const fundamentals = [
  {
    title: 'Entidad Pública Propia',
    description:
      'Persona jurídica pública independiente con patrimonio propio y plena capacidad legal para contratar y gestionar fondos.',
    reference: 'Art. 3 — Estatutos',
  },
  {
    title: 'Fuerza Legal Vinculante',
    description:
      'Convenios intermunicipales con fuerza de ley entre las partes para garantizar el cumplimiento de acuerdos regionales.',
    reference: 'Ley 7794 — Arts. 9, 10 y 11',
  },
  {
    title: 'Desarrollo Regional',
    description:
      'Articulación técnica y fomento de iniciativas conjuntas que impulsan la descentralización efectiva del Estado.',
    reference: 'Introducción Estatutaria',
  },
  {
    title: 'Horizonte de Largo Plazo',
    description:
      'Duración indefinida que asegura continuidad institucional y estabilidad en grandes inversiones territoriales.',
    reference: 'Art. 4 — Estatutos',
  },
] as const;

function federationFundamentals(page: Page) {
  return page.getByRole('region', { name: heading, exact: true });
}

async function expectFundamentalsContent(page: Page) {
  const region = federationFundamentals(page);
  await expect(region).toBeVisible();
  await expect(
    region.getByRole('heading', { level: 2, name: heading, exact: true }),
  ).toBeVisible();
  await expect(region.getByText(overline, { exact: true })).toBeVisible();
  await expect(region.getByText(legalBase, { exact: true })).toBeVisible();

  const items = region.getByRole('listitem');
  await expect(items).toHaveCount(fundamentals.length);

  for (const [
    index,
    { title, description, reference },
  ] of fundamentals.entries()) {
    const item = items.nth(index);
    await expect(
      item.getByRole('heading', { level: 3, name: title, exact: true }),
    ).toBeVisible();
    await expect(item.getByText(description, { exact: true })).toBeVisible();
    await expect(item.getByText(reference, { exact: true })).toBeVisible();
  }

  await expect(region.getByRole('link')).toHaveCount(0);
  await expect(region.locator('svg[aria-hidden="true"]')).toHaveCount(5);
}

async function expectFundamentalsReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  await expectFundamentalsContent(page);

  const region = federationFundamentals(page);
  const bounds = await region
    .locator('h2, h3, p, li, svg, [data-fundamentals-layout]')
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

test('renders all four federation fundamentals on /nosotros without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/nosotros');
  expect(response?.ok()).toBe(true);
  await expectFundamentalsContent(page);
});

for (const width of [
  280, 320, 375, 480, 767, 768, 1024, 1119, 1120, 1199, 1200, 1280, 1440, 1920,
  3840,
]) {
  test(
    'reflows federation fundamentals without horizontal overflow at ' +
      width +
      'px',
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/nosotros');
      await expectFundamentalsReflow(page, width);

      const region = federationFundamentals(page);
      const sectionWidth = await region.evaluate(
        (node) => node.getBoundingClientRect().width,
      );
      const layoutColumns = await region
        .locator('[data-fundamentals-layout]')
        .evaluate(
          (node) =>
            getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/)
              .length,
        );
      const cardColumns = await region
        .getByRole('list')
        .evaluate(
          (node) =>
            getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/)
              .length,
        );

      expect(layoutColumns).toBe(sectionWidth >= 70 * 16 ? 2 : 1);
      expect(cardColumns).toBe(sectionWidth >= 42 * 16 ? 2 : 1);
    },
  );
}

test('reflows federation fundamentals in landscape mode (844x390)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/nosotros');
  await expectFundamentalsReflow(page, 844);
});

for (const width of [320, 768, 1440]) {
  test(
    'supports 200% text zoom without horizontal overflow at ' + width + 'px',
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/nosotros');
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '32px';
      });
      await expectFundamentalsReflow(page, width);
    },
  );
}
