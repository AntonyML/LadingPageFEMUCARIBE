import { expect, test, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const pageTitle = 'Nosotros · Naturaleza Jurídica y Propósito';
const mission =
  'Propiciar el desarrollo integral de los municipios que la conforman, mediante el fortalecimiento institucional y político, promoviendo el bienestar regional de una manera integral, sostenible y equitativa.';
const vision =
  'Ser la federación municipal líder en Costa Rica, reconocida por su gestión mancomunada, transparente e innovadora en la articulación del desarrollo territorial y progreso del Caribe.';
const legalText =
  'Constituida formalmente al amparo de los artículos 9, 10 y 11 del Código Municipal (Ley N.° 7794). Estatutos publicados en el diario oficial La Gaceta N.° 108.';

async function expectNosotrosContent(page: Page) {
  await expect(page).toHaveTitle('Nosotros | FEMUCARIBE');
  await expect(
    page.getByRole('heading', { level: 2, name: pageTitle, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Identidad Institucional y Régimen Orgánico', {
      exact: true,
    }),
  ).toBeVisible();

  const purpose = page.getByRole('region', {
    name: 'Misión y visión de FEMUCARIBE',
    exact: true,
  });
  await expect(purpose.getByRole('article')).toHaveCount(2);
  await expect(
    purpose.getByRole('heading', {
      level: 3,
      name: 'Misión Estatutaria (Art. 5)',
      exact: true,
    }),
  ).toBeVisible();
  await expect(purpose.getByText(mission, { exact: true })).toBeVisible();
  await expect(
    purpose.getByRole('heading', {
      level: 3,
      name: 'Visión Estratégica',
      exact: true,
    }),
  ).toBeVisible();
  await expect(purpose.getByText(vision, { exact: true })).toBeVisible();

  const legal = page.getByRole('region', {
    name: 'Naturaleza Jurídica: Ente Público No Estatal',
    exact: true,
  });
  await expect(legal.getByText(legalText, { exact: true })).toBeVisible();
  await expect(legal.locator('[data-label="gazette"]')).toContainText(
    'La Gaceta N.° 108',
  );
  await expect(legal.getByRole('link')).toHaveCount(0);
  await expect(
    page
      .getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('link', { name: 'Nosotros', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
}

async function expectNosotrosReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  await expectNosotrosContent(page);

  const bounds = await page
    .locator('[data-page="nosotros"]')
    .locator('h1, h2, h3, p, article, section, [data-layout], [data-label]')
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

test('renders the three linked Penpot boards without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/nosotros');
  expect(response?.ok()).toBe(true);
  await expectNosotrosContent(page);
  const purpose = page.getByRole('region', {
    name: 'Misión y visión de FEMUCARIBE',
    exact: true,
  });
  await expect(purpose.getByRole('article').nth(0)).toHaveCSS(
    'background-color',
    'rgb(240, 247, 250)',
  );
  await expect(purpose.getByRole('article').nth(1)).toHaveCSS(
    'background-color',
    'rgb(248, 250, 252)',
  );
});

for (const width of [
  280, 320, 360, 480, 767, 768, 1024, 1199, 1200, 1280, 1440, 1920,
]) {
  test(`keeps content readable without horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/nosotros');
    await expectNosotrosReflow(page, width);
  });
}

for (const width of [767, 768, 1199, 1200]) {
  const columns = width < 768 ? 1 : 2;
  test(`uses ${columns} mission and vision column${columns > 1 ? 's' : ''} at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/nosotros');
    const columnCount = await page
      .locator('[data-layout="mission-grid"]')
      .evaluate(
        (grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      );
    expect(columnCount).toBe(columns);
  });
}

test('reflows in landscape mode (844x390)', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/nosotros');
  await expectNosotrosReflow(page, 844);
});

for (const width of [320, 768, 1440]) {
  test(`reflows at 200% text size in a ${width}px viewport`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/nosotros');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });
    await expectNosotrosReflow(page, width);
  });
}

test('keeps the skip link and main content keyboard operable', async ({
  page,
}) => {
  await page.goto('/nosotros');
  const skipLink = page.getByRole('link', {
    name: 'Pasar al contenido principal',
    exact: true,
  });
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});
