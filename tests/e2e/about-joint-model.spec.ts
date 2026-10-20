import { expect, test, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const heading = 'El Valor de la Unión Regional';
const overlineText = 'MODELO MANCOMUNADO';
const cards = [
  {
    number: '01',
    category: 'ECONOMÍA DE ESCALA',
    title: 'Costos Compartidos',
    soloText:
      'Municipio solo: Presupuesto y recursos limitados individualmente.',
    juntoText:
      'FEMUCARIBE: Ejecuta proyectos mancomunados dividiendo costos entre 6 cantones.',
  },
  {
    number: '02',
    category: 'PODER DE GESTIÓN',
    title: 'Voz Unificada',
    soloText:
      'Municipio solo: Negociaciones y trámites aislados ante Hacienda.',
    juntoText:
      'FEMUCARIBE: Representa a toda la región en bloque con alto peso institucional.',
  },
  {
    number: '03',
    category: 'ASESORÍA TÉCNICA',
    title: 'Programa PICC',
    soloText: 'Municipio solo: Contrata consultorías a costo total por cantón.',
    juntoText:
      'FEMUCARIBE: Asesoría técnica especializada a costo institucional distribuido.',
  },
  {
    number: '04',
    category: 'ALCANCE REGIONAL',
    title: 'Impacto Caribe',
    soloText:
      'Municipio solo: Alcance limitado a su propio perímetro cantonal.',
    juntoText:
      'FEMUCARIBE: Obras de infraestructura estratégica para toda la región Caribe.',
  },
] as const;

function aboutJointModel(page: Page) {
  return page.getByRole('region', { name: heading, exact: true });
}

async function expectJointModelContent(page: Page) {
  const region = aboutJointModel(page);
  await expect(region).toBeVisible();
  await expect(
    region.getByRole('heading', { level: 2, exact: true }),
  ).toHaveText(heading);
  await expect(region.getByText(overlineText, { exact: true })).toBeVisible();

  const items = region.getByRole('listitem');
  await expect(items).toHaveCount(cards.length);

  for (const [
    index,
    { number, category, title, soloText, juntoText },
  ] of cards.entries()) {
    const item = items.nth(index);
    await expect(
      item.getByText(`${number} · ${category}`, { exact: true }),
    ).toBeVisible();
    await expect(
      item.getByRole('heading', { level: 3, name: title, exact: true }),
    ).toBeVisible();
    await expect(item.getByText(soloText, { exact: true })).toBeVisible();
    await expect(item.getByText(juntoText, { exact: true })).toBeVisible();

    const cardBox = await item.locator('.card').boundingBox();
    expect(cardBox).not.toBeNull();
    expect(cardBox!.height).toBeGreaterThanOrEqual(250);
  }
}

async function expectJointModelReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  await expectJointModelContent(page);
  const region = aboutJointModel(page);
  const bounds = await region
    .locator(
      'h2, h3, p, ol, li, article, .accent-bar, .card-header, .comparative-block, .solo-box, .junto-box, span',
    )
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

test('renders 4 joint model comparative cards on /nosotros without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/nosotros');
  expect(response?.ok()).toBe(true);
  await expectJointModelContent(page);
});

for (const width of [
  280, 320, 360, 480, 767, 768, 1024, 1199, 1200, 1280, 1440,
]) {
  test(`maintains reflow and readable comparative cards at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/nosotros');
    await expectJointModelReflow(page, width);
    const columns = await page
      .locator('.about-joint-model .cards-list')
      .evaluate(
        (node) => getComputedStyle(node).gridTemplateColumns.split(' ').length,
      );
    if (width >= 1200) {
      expect(columns).toBe(4);
    } else if (width >= 820) {
      expect(columns).toBe(2);
    }
  });
}

test('maintains reflow in landscape mode (844x390)', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/nosotros');
  await expectJointModelReflow(page, 844);
});

for (const width of [320, 768, 1440]) {
  test(`adapts to 200% text zoom at ${width}px without horizontal scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/nosotros');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });
    await expectJointModelReflow(page, width);
  });
}
