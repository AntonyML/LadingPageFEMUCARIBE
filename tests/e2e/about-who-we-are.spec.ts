import { expect, test, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const heading = 'Quiénes Somos';
const overlineText = 'CONOZCA NUESTRA FEDERACIÓN';
const leadText =
  'La Federación Municipal del Caribe Costarricense y Asociados FEMUCARIBE es una organización dedicada a promover la cooperación, coordinación y desarrollo conjunto de los gobiernos locales de la región Caribe de Costa Rica, integrando a Talamanca, Limón, Matina, Guácimo, Pococí y Parrita.';
const bodyText =
  'Trabajamos para fortalecer la gestión municipal, impulsar iniciativas de interés regional y facilitar la articulación entre municipalidades e instituciones públicas y privadas. Nuestro compromiso es contribuir al desarrollo sostenible, social y económico de la región Caribe mediante proyectos, alianzas estratégicas y acciones que generen beneficios para sus comunidades.';
const stats = [
  { value: '6 Cantones', label: 'Gobiernos Locales Miembros' },
  { value: 'Ley N.º 7794', label: 'Código Municipal de C.R.' },
] as const;

function aboutWhoWeAre(page: Page) {
  return page.getByRole('region', { name: heading, exact: true });
}

async function expectWhoWeAreContent(page: Page) {
  await expect(page).toHaveTitle('Nosotros | FEMUCARIBE');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav.locator('[aria-current="page"]')).toHaveText('Nosotros');

  const region = aboutWhoWeAre(page);
  await expect(region).toBeVisible();
  await expect(
    region.getByRole('heading', { level: 1, exact: true }),
  ).toHaveText(heading);
  await expect(region.getByText(overlineText, { exact: true })).toBeVisible();
  await expect(region.getByText(leadText, { exact: true })).toBeVisible();
  await expect(region.locator('.lead-paragraph strong')).toHaveText(
    'FEMUCARIBE',
  );
  await expect(region.getByText(bodyText, { exact: true })).toBeVisible();

  for (const { value, label } of stats) {
    await expect(region.getByText(value, { exact: true })).toBeVisible();
    await expect(region.getByText(label, { exact: true })).toBeVisible();
  }

  const statCards = region.locator('.stat-card');
  await expect(statCards).toHaveCount(stats.length);
  for (let i = 0; i < stats.length; i++) {
    expect(
      (await statCards.nth(i).boundingBox())!.height,
    ).toBeGreaterThanOrEqual(84);
  }

  const image = region.getByRole('img', {
    name: 'Edificio de la sede central de FEMUCARIBE en Siquirres, Barrio el Mangal',
    exact: true,
  });
  await expect(image).toBeVisible();
  expect(
    await image.evaluate((img) => (img as HTMLImageElement).naturalWidth),
  ).toBe(720);
  expect(
    await image.evaluate((img) => (img as HTMLImageElement).naturalHeight),
  ).toBe(540);

  await expect(region.getByText('SEDE CENTRAL', { exact: true })).toBeVisible();
  await expect(
    region.getByText('Siquirres, Barrio el Mangal', { exact: true }),
  ).toBeVisible();
}

async function expectWhoWeAreReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  await expectWhoWeAreContent(page);
  const region = aboutWhoWeAre(page);
  const bounds = await region
    .locator(
      'h1, p, dl, dt, dd, .stat-card, figure, .image-frame, img, figcaption, span',
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

test('renders AboutWhoWeAre section on /nosotros without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/nosotros');
  expect(response?.ok()).toBe(true);
  await expectWhoWeAreContent(page);
});

test('supports keyboard skip link to main content on /nosotros', async ({
  page,
}) => {
  await page.goto('/nosotros');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', {
    name: 'Pasar al contenido principal',
  });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  const main = page.getByRole('main');
  await expect(main).toBeFocused();
  expect(
    await main.evaluate((node) => getComputedStyle(node).outlineStyle),
  ).toBe('solid');
});

for (const width of [
  280, 320, 360, 479, 480, 767, 768, 1023, 1024, 1280, 1440,
]) {
  test(`maintains reflow and readable AboutWhoWeAre section at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/nosotros');
    await expectWhoWeAreReflow(page, width);
    if (width >= 1024) {
      const editorialBox = await page
        .locator('.about-who-we-are .editorial-col')
        .boundingBox();
      const mediaBox = await page
        .locator('.about-who-we-are .media-col')
        .boundingBox();
      expect(editorialBox).not.toBeNull();
      expect(mediaBox).not.toBeNull();
      expect(mediaBox!.x).toBeGreaterThan(editorialBox!.x);
    }
  });
}

test('maintains reflow in landscape mode (844x390)', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/nosotros');
  await expectWhoWeAreReflow(page, 844);
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
    await expectWhoWeAreReflow(page, width);
  });
}
