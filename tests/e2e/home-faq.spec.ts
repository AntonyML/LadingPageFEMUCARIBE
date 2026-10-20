import { expect, test, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const heading = 'Preguntas Frecuentes sobre la Gestión y los Estatutos';
const faqs = [
  {
    question: '¿Cómo se financia FEMUCARIBE?',
    answer:
      'Se financia mediante los aportes estatutarios ordinarios de cada municipalidad miembro y transferencias para proyectos específicos de inversión pública (Arts. 24-28 Estatutos).',
  },
  {
    question: '¿Quién fiscaliza los fondos de la federación?',
    answer:
      'La Contraloría General de la República (CGR), la auditoría interna federativa y los concejos municipales de cada cantón federado.',
  },
  {
    question: '¿Cómo ingresa una nueva municipalidad a la federación?',
    answer:
      'Mediante acuerdo firme de su concejo municipal y posterior ratificación por parte de la Asamblea General de FEMUCARIBE.',
  },
  {
    question: '¿Qué papel cumple la UGP en las obras cantonales?',
    answer:
      'Actúa como brazo técnico especializado que formula carpetas técnicas, gestiona avales sectoriales y Promueve la mancumunidad atraves de sus municipios asociados para el cumplimientos de los objetivos comunales.',
  },
] as const;

function homeFaq(page: Page) {
  return page.getByRole('region', { name: heading, exact: true });
}

async function expectFaqContent(page: Page) {
  const region = homeFaq(page);
  await expect(region).toBeVisible();
  await expect(
    region.getByRole('heading', { level: 2, exact: true }),
  ).toHaveText(heading);

  const items = region.getByRole('listitem');
  await expect(items).toHaveCount(faqs.length);

  for (const [index, { question, answer }] of faqs.entries()) {
    const card = items.nth(index);
    await expect(
      card.getByRole('heading', { level: 3, name: question, exact: true }),
    ).toBeVisible();
    await expect(card.getByText(answer, { exact: true })).toBeVisible();
    expect((await card.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
}

async function expectFaqReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  await expectFaqContent(page);
  const region = homeFaq(page);
  const bounds = await region
    .locator('h2, h3, p, .card, ul, li')
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

test('renders 4 statutory FAQs with questions and answers without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await expectFaqContent(page);
});

for (const width of [280, 320, 360, 480, 768, 1024, 1280, 1440]) {
  test(`maintains reflow and readable FAQ cards at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expectFaqReflow(page, width);
  });
}

test('maintains reflow in landscape mode (844x390)', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await expectFaqReflow(page, 844);
});

test('adapts to 200% text zoom at 320px without horizontal scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px';
  });
  await expectFaqReflow(page, 320);
});
