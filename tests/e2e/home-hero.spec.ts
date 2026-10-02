import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const projectsLabel = 'Ver proyectos';
const contactLabel = 'Contáctenos';
const unavailableSearch = 'Búsqueda no disponible';
const title = 'Impulsamos el desarrollo integral y sostenible';
const cantonNames = [
  'Talamanca',
  'Limón',
  'Matina',
  'Guácimo',
  'Pococí',
  'Parrita',
];

async function expectVisibleFocus(target: Locator) {
  await expect(target).toBeFocused();
  const outline = await target.evaluate((node) => {
    const style = getComputedStyle(node);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
  expect(outline.style).toBe('solid');
  expect(outline.width).toBeGreaterThanOrEqual(2);
}

async function expectHeroReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  const hero = page.locator('.home-hero');
  const frame = await hero.boundingBox();
  expect(frame!.x).toBe(0);
  expect(frame!.width).toBe(width);
  await expect(hero.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(hero.getByRole('link', { name: projectsLabel })).toBeVisible();
  await expect(hero.getByRole('link', { name: contactLabel })).toBeVisible();
  await expect(hero.getByRole('searchbox')).toBeVisible();
  await expect(
    hero.getByText(unavailableSearch, { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width);
  const bounds = await hero
    .locator('h1, h2, h3, p, a, ul, li, fieldset, input, button')
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
  for (const link of await hero.getByRole('link').all()) {
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
}

test('home hero offers its content and honest search state without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  const hero = page.locator('section.home-hero');
  await expect(hero).toHaveCount(1);
  const heading = hero.getByRole('heading', { level: 1 });
  await expect(heading).toHaveText(title);
  await expect(hero).toHaveAccessibleName(title);
  await expect(heading).toHaveAttribute('id', 'hero-title');
  await expect(hero).toHaveAttribute('aria-labelledby', 'hero-title');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(hero.getByRole('link', { name: projectsLabel })).toHaveAttribute(
    'href',
    '/proyectos',
  );
  await expect(hero.getByRole('link', { name: contactLabel })).toHaveAttribute(
    'href',
    '/contacto',
  );
  await expect(hero.getByRole('link')).toHaveCount(2);
  const search = hero.getByRole('searchbox', { name: 'Buscar en FEMUCARIBE' });
  await expect(search).toHaveAttribute('type', 'search');
  await expect(search).toBeDisabled();
  await expect(
    hero.getByRole('button', { name: 'Buscar', exact: true }),
  ).toBeDisabled();
  await expect(hero.locator('fieldset')).toHaveJSProperty('disabled', true);
  await expect(search).toHaveAccessibleDescription(unavailableSearch);
  await expect(hero.locator('fieldset')).toHaveAccessibleDescription(
    unavailableSearch,
  );
  await expect(
    hero.getByText(unavailableSearch, { exact: true }),
  ).toBeVisible();
  await expect(hero.locator('script')).toHaveCount(0);
  const cantons = hero.getByRole('list', { name: 'Cantones asociados' });
  await expect(cantons.getByRole('listitem')).toHaveText(cantonNames);
  await expect(cantons.locator('img[alt=""]')).toHaveCount(6);
  await expect(cantons.locator('a, button, input, [tabindex]')).toHaveCount(0);
  const governance = hero.getByRole('complementary', {
    name: 'Articulación Intermunicipal',
  });
  await expect(governance.getByRole('heading', { level: 3 })).toHaveText([
    '6 Gobiernos Locales Unidos',
    'Descentralización & Inversión',
    'Marco Legal & Transparencia',
  ]);
  await expect(governance.getByRole('listitem')).toHaveCount(3);
  await expect
    .poll(() =>
      hero.locator('img').evaluateAll((images) =>
        images.every((image) => {
          const asset = image as HTMLImageElement;
          return (
            asset.complete &&
            asset.naturalWidth > 0 &&
            new URL(asset.currentSrc).origin === location.origin
          );
        }),
      ),
    )
    .toBe(true);
});

for (const width of [320, 1440]) {
  test(`skip and keyboard reach both hero links while skipping disabled search at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expectVisibleFocus(
      page.getByRole('link', { name: 'Pasar al contenido principal' }),
    );
    await page.keyboard.press('Enter');
    await expectVisibleFocus(page.getByRole('main'));
    const hero = page.locator('.home-hero');
    for (const name of [projectsLabel, contactLabel]) {
      await page.keyboard.press('Tab');
      await expectVisibleFocus(hero.getByRole('link', { name, exact: true }));
    }
    await page.keyboard.press('Tab');
    expect(
      await hero.evaluate((node) => node.contains(document.activeElement)),
    ).toBe(false);
  });
}

for (const [width, height] of [
  [280, 740],
  [320, 740],
  [375, 812],
  [479, 900],
  [480, 900],
  [600, 800],
  [683, 900],
  [767, 1024],
  [768, 1024],
  [844, 390],
  [1023, 900],
  [1024, 900],
  [1199, 900],
  [1200, 900],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
] as const) {
  test(`hero content reflows at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expectHeroReflow(page, width);
    if ([320, 768, 1440].includes(width)) {
      await page.screenshot({
        path: test.info().outputPath(`home-hero-${width}.png`),
        fullPage: true,
      });
    }
  });
}

for (const width of [320, 768, 1366]) {
  test(`hero content reflows with 200% text at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('.home-hero').evaluate((hero) => {
      const textNodes = Array.from(
        hero.querySelectorAll(
          'h1, h2, h3, p, a, label, input, button, li, span, small, strong',
        ),
      );
      const sizes = textNodes.map((node) =>
        parseFloat(getComputedStyle(node).fontSize),
      );
      textNodes.forEach((node, index) => {
        (node as HTMLElement).style.fontSize = `${sizes[index]! * 2}px`;
      });
    });
    await expectHeroReflow(page, width);
  });
}
