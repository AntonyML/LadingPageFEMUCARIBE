import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const heading = 'Proyectos Estratégicos en Marcha';
const projectsLinkText = 'Ver cartera completa de proyectos (04 · Proyectos)';
const projects = [
  {
    title: 'Unidad Gestora de Proyectos (UGP)',
    category: 'Formulación y Ejecución',
    status: 'En ejecución',
  },
  {
    title: 'Electrolinera',
    category: 'Movilidad Eléctrica y Energía',
    status: 'En operación',
  },
  {
    title: 'Parque Tecnológico y Productivo',
    category: 'Innovación y Conocimiento',
    status: 'En formulación',
  },
  {
    title: 'Planta Recicladora',
    category: 'Gestión Ambiental y Circular',
    status: 'En operación',
  },
] as const;

function homeProjects(page: Page) {
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

async function expectProjectsContent(page: Page) {
  const region = homeProjects(page);
  await expect(region).toBeVisible();
  await expect(
    region.getByRole('heading', { level: 2, exact: true }),
  ).toHaveText(heading);

  const link = region.getByRole('link', {
    name: projectsLinkText,
    exact: true,
  });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', '/proyectos');

  const items = region.getByRole('listitem');
  await expect(items).toHaveCount(projects.length);

  for (const [index, { title, category, status }] of projects.entries()) {
    const card = items.nth(index);
    await expect(
      card.getByRole('heading', { level: 3, name: title, exact: true }),
    ).toBeVisible();
    await expect(card.getByText(category, { exact: true })).toBeVisible();
    await expect(card.getByText(status, { exact: true })).toBeVisible();
    expect((await card.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
}

async function expectProjectsReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  await expectProjectsContent(page);
  const region = homeProjects(page);
  const bounds = await region
    .locator('h2, h3, a, span, p, .card, ul, li')
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

test('renders 4 strategic projects with status badges and link without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await expectProjectsContent(page);
});

test('supports keyboard navigation with visible focus on projects link', async ({
  page,
}) => {
  await page.goto('/');
  const link = homeProjects(page).getByRole('link', {
    name: projectsLinkText,
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
    await expectProjectsReflow(page, width);
  });
}

test('maintains reflow in landscape mode (844x390)', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await expectProjectsReflow(page, 844);
});

test('adapts to 200% text zoom at 320px without horizontal scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px';
  });
  await expectProjectsReflow(page, 320);
});
