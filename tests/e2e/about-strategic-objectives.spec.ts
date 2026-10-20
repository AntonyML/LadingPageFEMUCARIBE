import { expect, test, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const heading = 'Objetivos Estratégicos';
const overlineText = 'MARCO ESTRATÉGICO INSTITUCIONAL';
const objectives = [
  {
    number: '01',
    title: 'Desarrollo Integral',
    description:
      'Propiciar el desarrollo integral y fortalecer la gestión técnica, administrativa y de servicios públicos locales (Art. 5.1).',
  },
  {
    number: '02',
    title: 'Descentralización',
    description:
      'Promover la descentralización del Estado y la autonomía municipal mediante reformas y proyectos de ley (Art. 5.2 y 5.8).',
  },
  {
    number: '03',
    title: 'Medio Ambiente',
    description:
      'Apoyar la gestión municipal para la protección de los recursos naturales y la sostenibilidad ambiental regional (Art. 5.6).',
  },
  {
    number: '04',
    title: 'Inversión Regional',
    description:
      'Gestionar proyectos con canon de concesión portuaria e inversión productiva para el desarrollo socioeconómico (Art. 5.4 y 5.9).',
  },
] as const;

function aboutStrategicObjectives(page: Page) {
  return page.getByRole('region', { name: heading, exact: true });
}

async function expectStrategicObjectivesContent(page: Page) {
  const region = aboutStrategicObjectives(page);
  await expect(region).toBeVisible();
  await expect(
    region.getByRole('heading', { level: 2, exact: true }),
  ).toHaveText(heading);
  await expect(region.getByText(overlineText, { exact: true })).toBeVisible();

  const items = region.getByRole('listitem');
  await expect(items).toHaveCount(objectives.length);

  for (const [index, { number, title, description }] of objectives.entries()) {
    const item = items.nth(index);
    await expect(item.locator('.num-tag')).toHaveText(number);
    await expect(
      item.getByRole('heading', { level: 3, name: title, exact: true }),
    ).toBeVisible();
    await expect(item.getByText(description, { exact: true })).toBeVisible();
    const cardBox = await item.locator('.card').boundingBox();
    expect(cardBox).not.toBeNull();
    expect(cardBox!.height).toBeGreaterThanOrEqual(280);
  }
}

async function expectStrategicObjectivesReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  await expectStrategicObjectivesContent(page);
  const region = aboutStrategicObjectives(page);
  const bounds = await region
    .locator(
      'h2, h3, p, ol, li, article, .card-top-row, .icon-box, .num-tag, span',
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

test('renders 4 strategic objectives on /nosotros without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/nosotros');
  expect(response?.ok()).toBe(true);
  await expectStrategicObjectivesContent(page);
});

for (const width of [
  280, 320, 360, 480, 767, 768, 1024, 1199, 1200, 1280, 1440,
]) {
  test(`maintains reflow and readable strategic objective cards at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/nosotros');
    await expectStrategicObjectivesReflow(page, width);
    const columns = await page
      .locator('.about-strategic-objectives .cards-list')
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
  await expectStrategicObjectivesReflow(page, 844);
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
    await expectStrategicObjectivesReflow(page, width);
  });
}
