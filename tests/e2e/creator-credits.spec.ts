import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const creatorCredit = 'Diseño y desarrollo: Ing. Antony Monge López';
const email = 'antonyml2016@gmail.com';
const professionalWebsite = 'www.tonyml.com';

async function expectVisibleFocus(link: Locator) {
  await expect(link).toBeFocused();
  const outline = await link.evaluate((node) => {
    const style = getComputedStyle(node);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
  expect(outline.style).toBe('solid');
  expect(outline.width).toBeGreaterThanOrEqual(2);
}

async function expectCreditsReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width);
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { name: 'Créditos del sitio web', level: 1 }),
  ).toBeVisible();
  await expect(
    main.getByRole('link', { name: email, exact: true }),
  ).toBeVisible();
  await expect(
    main.getByRole('link', { name: professionalWebsite, exact: true }),
  ).toBeVisible();
  const bounds = await main
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
  const footerCredit = page.getByRole('contentinfo').getByRole('link', {
    name: creatorCredit,
    exact: true,
  });
  await expect(footerCredit).toBeVisible();
  const creditBounds = await footerCredit.boundingBox();
  expect(creditBounds).not.toBeNull();
  expect(creditBounds!.x).toBeGreaterThanOrEqual(0);
  expect(creditBounds!.x + creditBounds!.width).toBeLessThanOrEqual(width + 1);
}

test('credits distinguish independent authorship from institutional attention without JS', async ({
  page,
}) => {
  const response = await page.goto('/creditos');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Créditos del sitio web | FEMUCARIBE');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(
    'Créditos del sitio web',
  );
  const creator = main.getByRole('region', { name: 'Ing. Antony Monge López' });
  await expect(creator.getByRole('heading', { level: 2 })).toBeVisible();
  await expect(creator).toContainText('Ingeniero en Sistemas');
  await expect(creator).toContainText('servicio profesional independiente');
  await expect(creator).toContainText(
    'Únicamente para temas relacionados con la autoría y el desarrollo de este sitio web.',
  );
  await expect(
    creator.getByRole('link', { name: email, exact: true }),
  ).toHaveAttribute('href', `mailto:${email}`);
  await expect(
    creator.getByRole('link', { name: professionalWebsite, exact: true }),
  ).toHaveAttribute('href', 'https://www.tonyml.com');
  const institution = main.getByRole('region', {
    name: '¿Tu consulta es para FEMUCARIBE?',
  });
  await expect(institution).toContainText(
    'No forma parte del personal de FEMUCARIBE ni presta atención institucional o soporte permanente.',
  );
  await expect(
    institution.getByRole('link', {
      name: 'info@femucaribe.go.cr',
      exact: true,
    }),
  ).toHaveAttribute('href', 'mailto:info@femucaribe.go.cr');
  await expect(
    main.locator('a[href="mailto:contacto@femucaribe.go.cr"]'),
  ).toHaveCount(0);
  const resources = main.getByRole('region', {
    name: 'Tipografías y licencias',
  });
  await expect(resources).toContainText('The Inter Project Authors');
  await expect(resources).toContainText('SIL Open Font License 1.1');
  await expect(
    resources.getByRole('link', { name: 'Consultar las licencias' }),
  ).toHaveAttribute('href', '/legal#licencias');
  await expect(
    main
      .getByRole('navigation', { name: 'Información del sitio' })
      .getByRole('link', {
        name: 'Créditos',
        exact: true,
      }),
  ).toHaveAttribute('aria-current', 'page');
});

test('keyboard navigation reaches credits and preserves skip and contact focus', async ({
  page,
}) => {
  await page.goto('/');
  const credit = page.getByRole('contentinfo').getByRole('link', {
    name: creatorCredit,
    exact: true,
  });
  for (let index = 0; index < 40; index++) {
    await page.keyboard.press('Tab');
    if (await credit.evaluate((node) => node === document.activeElement)) break;
  }
  await expectVisibleFocus(credit);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/creditos\/?$/);
  await expect(page).toHaveTitle('Créditos del sitio web | FEMUCARIBE');
  await page.keyboard.press('Tab');
  await expectVisibleFocus(
    page.getByRole('link', { name: 'Pasar al contenido principal' }),
  );
  await page.keyboard.press('Enter');
  const main = page.getByRole('main');
  await expectVisibleFocus(main);
  const informationNavigation = main.getByRole('navigation', {
    name: 'Información del sitio',
  });
  for (const link of [
    main
      .getByRole('navigation', { name: 'Ubicación' })
      .getByRole('link', { name: 'Inicio', exact: true }),
    informationNavigation.getByRole('link', { name: 'Créditos', exact: true }),
    informationNavigation.getByRole('link', {
      name: 'Aviso legal y privacidad',
      exact: true,
    }),
    main.getByRole('link', { name: email, exact: true }),
    main.getByRole('link', { name: professionalWebsite, exact: true }),
    main.getByRole('link', { name: 'info@femucaribe.go.cr', exact: true }),
    main.getByRole('link', { name: 'Consultar las licencias' }),
  ]) {
    await page.keyboard.press('Tab');
    await expectVisibleFocus(link);
  }
});

for (const { width, height, label } of [
  { width: 280, height: 740, label: 'narrow reflow' },
  { width: 320, height: 740, label: 'mobile' },
  { width: 683, height: 900, label: 'effective viewport at 200% zoom' },
  { width: 767, height: 1024, label: 'below tablet breakpoint' },
  { width: 768, height: 1024, label: 'tablet' },
  { width: 844, height: 390, label: 'landscape' },
  { width: 1199, height: 900, label: 'below global grid breakpoint' },
  { width: 1200, height: 900, label: 'global grid breakpoint' },
  { width: 1249, height: 900, label: 'below footer breakpoint' },
  { width: 1250, height: 900, label: 'footer breakpoint' },
  { width: 1399, height: 900, label: 'below desktop navigation breakpoint' },
  { width: 1400, height: 900, label: 'desktop navigation breakpoint' },
  { width: 1440, height: 900, label: 'desktop' },
]) {
  test(`credits reflow at ${width}x${height}: ${label}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/creditos');
    await expectCreditsReflow(page, width);
    if ([320, 1440].includes(width)) {
      await page.screenshot({
        path: test.info().outputPath(`creator-credits-${width}.png`),
        fullPage: true,
      });
    }
  });
}

for (const width of [320, 768]) {
  test(`credits and creator link reflow with 200% text at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/creditos');
    await page.evaluate(() => {
      const textNodes = Array.from(
        document.querySelectorAll('h1, h2, h3, p, li, a, small, strong, span'),
      );
      const sizes = textNodes.map((node) =>
        parseFloat(getComputedStyle(node).fontSize),
      );
      textNodes.forEach((node, index) => {
        (node as HTMLElement).style.fontSize = `${sizes[index]! * 2}px`;
      });
    });
    await expectCreditsReflow(page, width);
  });
}
