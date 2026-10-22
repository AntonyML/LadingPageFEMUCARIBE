import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const memberTitles = [
  'Municipalidad de Limón',
  'Municipalidad de Talamanca',
  'Municipalidad de Matina',
  'Municipalidad de Guácimo',
  'Municipalidad de Pococí',
  'Municipalidad de Siquirres',
] as const;

const authorityNames = [
  'Ana Janniel Matarrita Mc Calla',
  'Walter Céspedes Salazar',
  'Beatriz Mora Valverde',
  'Randal Black Reid',
  'Rugeli Morales Rodríguez',
  'Manuel Hernández Rivera',
] as const;

test('renders the complete municipal directory in the public shell without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/municipalidades');
  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle('Municipalidades | FEMUCARIBE');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Municipalidades', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('main#contenido-principal')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();

  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', {
      level: 1,
      name: 'Municipalidades Miembros · Federación del Caribe',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    main.getByText(
      'Perfil geográfico, productivo y autoridades de los seis cantones que componen FEMUCARIBE.',
      { exact: true },
    ),
  ).toBeVisible();

  const members = main.getByRole('region', {
    name: 'Municipalidades Miembros · Federación del Caribe',
    exact: true,
  });
  await expect(members.getByRole('listitem')).toHaveCount(6);
  for (const title of memberTitles) {
    await expect(
      members.getByRole('heading', { level: 2, name: title, exact: true }),
    ).toBeVisible();
  }

  const profiles = main.getByRole('region', {
    name: 'Alcaldes y autoridades municipales',
    exact: false,
  });
  await expect(profiles.locator(':scope > ul > li')).toHaveCount(6);
  await expect(profiles.locator('figure img')).toHaveCount(2);
  for (const name of authorityNames) {
    await expect(
      profiles.getByRole('heading', { level: 3, name, exact: true }),
    ).toBeVisible();
  }

  const executiveSummary = main.locator(
    'section[aria-labelledby="authority-summary-title"]',
  );
  await expect(executiveSummary.locator(':scope > ul > li')).toHaveCount(6);

  const territories = main.getByRole('region', {
    name: 'Información territorial por cantón',
    exact: true,
  });
  await expect(territories.getByRole('listitem')).toHaveCount(6);

  await expect(
    main.getByRole('link', { name: 'Contactar Enlace', exact: false }),
  ).toHaveAttribute('href', '/contacto');
  await expect(
    main.getByRole('link', { name: 'Explorar ficha cantonal', exact: false }),
  ).toHaveCount(6);
  await expect(
    main.getByRole('link', {
      name: 'Ver autoridades cantonales',
      exact: false,
    }),
  ).toHaveCount(12);
  await expect(
    main.getByRole('link', { name: 'Ver proyectos', exact: false }),
  ).toHaveCount(6);
  await expect(
    main.getByRole('link', { name: 'Ver sitio web oficial', exact: false }),
  ).toHaveCount(6);
  await expect(main.locator('script')).toHaveCount(0);
});

test('reflows the full page, keeps links operable by keyboard, and supports 200% text', async ({
  page,
}) => {
  const response = await page.goto('/municipalidades');
  expect(response?.status()).toBe(200);

  const overview = page.getByRole('region', {
    name: 'Municipalidades Miembros · Federación del Caribe',
    exact: true,
  });
  const layout = overview.locator('ul.layout-grid');

  for (const [width, expectedColumns] of [
    [320, 1],
    [768, 2],
    [1440, 3],
  ] as const) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    const columns = await layout.evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.split(' ').length,
    );
    expect(columns).toBe(expectedColumns);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }

  const territories = page.getByRole('region', {
    name: 'Información territorial por cantón',
    exact: true,
  });
  const profiles = page.getByRole('region', {
    name: 'Alcaldes y autoridades municipales',
    exact: false,
  });
  for (const region of [overview, territories, profiles]) {
    const frameSizes = await region.locator('figure').evaluateAll((frames) =>
      frames.map((frame) => {
        const { width, height } = frame.getBoundingClientRect();
        return {
          width: Math.round(width),
          height: Math.round(height),
          background: getComputedStyle(frame).backgroundImage,
        };
      }),
    );
    expect(frameSizes).toHaveLength(6);
    expect(
      frameSizes.every(({ width, height }) => width > 0 && height > 0),
    ).toBe(true);
    expect(
      new Set(frameSizes.map(({ width, height }) => `${width}x${height}`)).size,
    ).toBe(1);
    expect(frameSizes[0]?.background).toContain('linear-gradient');
  }

  const authorityImages = await profiles
    .locator('figure img')
    .evaluateAll((images) =>
      images.map((image) => getComputedStyle(image).objectFit),
    );
  expect(authorityImages).toEqual(['contain', 'contain']);

  const authorityLink = page
    .getByRole('main')
    .getByRole('link', { name: 'Ver autoridades cantonales', exact: false })
    .first();

  for (let index = 0; index < 60; index += 1) {
    if (
      await authorityLink.evaluate(
        (element) => element === document.activeElement,
      )
    ) {
      break;
    }
    await page.keyboard.press('Tab');
  }

  await expect(authorityLink).toBeFocused();
  const outlineWidth = await authorityLink.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).outlineWidth),
  );
  expect(outlineWidth).toBeGreaterThanOrEqual(2);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#authority-limon$/);
  await expect(page.locator('#authority-limon')).toBeInViewport();

  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});
