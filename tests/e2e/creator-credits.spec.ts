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
  const bounds = await main.locator('h1, p, li, a').evaluateAll((nodes) =>
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

test('credits provide the approved creator, contact scope and license without JS', async ({
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
  await expect(
    main.getByText(
      'Este sitio web institucional fue diseñado y desarrollado por Ing. Antony Monge López, Ingeniero en Sistemas.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    main.getByRole('listitem').filter({ hasText: 'Correo:' }),
  ).toHaveText(
    'Correo: antonyml2016@gmail.com (únicamente para temas relacionados con este sitio web)',
  );
  await expect(
    main.getByRole('listitem').filter({ hasText: 'Sitio web profesional:' }),
  ).toHaveText('Sitio web profesional: www.tonyml.com');
  await expect(
    main.getByRole('link', { name: email, exact: true }),
  ).toHaveAttribute('href', `mailto:${email}`);
  await expect(
    main.getByRole('link', { name: professionalWebsite, exact: true }),
  ).toHaveAttribute('href', 'https://www.tonyml.com');
  await expect(
    main.getByText(
      'Antony Monge López desarrolló este sitio para FEMUCARIBE y no forma parte de la institución. Las consultas sobre trámites, servicios o contenido institucional deben dirigirse a los canales oficiales de FEMUCARIBE.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    main.getByText(
      'Tipografías y licencias: este sitio utiliza la tipografía Inter (The Inter Project Authors), bajo SIL Open Font License 1.1; el texto íntegro de la licencia se conserva en el repositorio del proyecto.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(main).not.toContainText(/\bsoporte\b/i);
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
  await page.keyboard.press('Tab');
  await expectVisibleFocus(
    main.getByRole('link', { name: email, exact: true }),
  );
  await page.keyboard.press('Tab');
  await expectVisibleFocus(
    main.getByRole('link', { name: professionalWebsite, exact: true }),
  );
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
        document.querySelectorAll('h1, h2, p, li, a, small, strong, span'),
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
