import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

for (const [width, height] of [
  [280, 740],
  [320, 740],
  [375, 812],
  [600, 800],
  [767, 800],
  [768, 1024],
  [844, 390],
  [1199, 900],
  [1200, 900],
  [1440, 900],
  [1920, 1080],
  [3840, 2160],
] as const) {
  test(`global container and grid adapt at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.locator('.page-content').evaluate((content) => {
      const grid = document.createElement('section');
      grid.className = 'layout-grid';
      grid.dataset.layoutTest = 'fixture';
      for (let i = 0; i < 6; i++) {
        const card = document.createElement('article');
        card.style.padding = '16px';
        card.style.border = '2px solid';
        card.textContent = 'ContenidoLargoSinEspacios'.repeat(8);
        grid.append(card);
      }
      content.append(grid);
    });
    const grid = page.locator('[data-layout-test="fixture"]');
    const columns = await grid.evaluate(
      (node) => getComputedStyle(node).gridTemplateColumns.split(' ').length,
    );
    expect(columns).toBe(width >= 1200 ? 3 : width >= 768 ? 2 : 1);
    const frames = page.locator('.site-container');
    const boxes = await frames.evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          x: rect.x,
          width: rect.width,
          right: rect.right,
          isHero: Boolean(node.closest('.home-hero')),
        };
      }),
    );
    expect(boxes.length).toBe(5);
    for (const box of boxes) {
      expect(box.width).toBeLessThanOrEqual(1280);
      expect(box.x).toBeGreaterThanOrEqual(16);
      expect(box.right).toBeLessThanOrEqual(width - 16);
      if (box.isHero && width >= 1200) {
        expect(box.x).toBeGreaterThanOrEqual(80);
        expect(box.right).toBeLessThanOrEqual(width - 80);
        expect(box.width).toBeLessThanOrEqual(boxes[0]!.width);
      } else {
        expect(box.x).toBeCloseTo(boxes[0]!.x, 0);
        expect(box.width).toBeCloseTo(boxes[0]!.width, 0);
      }
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
    expect(
      await grid
        .locator('article')
        .first()
        .evaluate((node) => getComputedStyle(node).boxSizing),
    ).toBe('border-box');
  });
}

test('global helpers preserve keyboard access and native controls', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Pasar al contenido principal' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  const main = page.getByRole('main');
  await expect(main).toBeFocused();
  expect(
    await main.evaluate((node) => getComputedStyle(node).outlineStyle),
  ).toBe('solid');
  await page.locator('.page-content').evaluate((content) => {
    const link = document.createElement('a');
    link.className = 'visually-hidden';
    link.href = '#contenido-principal';
    link.textContent = 'Ayuda de prueba';
    content.append(link);
    const button = document.createElement('button');
    button.textContent = 'Control nativo';
    content.append(button);
    const hidden = document.createElement('p');
    hidden.hidden = true;
    hidden.textContent = 'Contenido oculto';
    content.append(hidden);
  });
  const helper = page.getByRole('link', { name: 'Ayuda de prueba' });
  expect((await helper.boundingBox())?.width).toBe(1);
  await helper.focus();
  expect((await helper.boundingBox())?.width).toBeGreaterThan(1);
  await expect(helper).toBeFocused();
  expect(
    await page
      .getByRole('button', { name: 'Control nativo', exact: true })
      .evaluate((node) => getComputedStyle(node).fontFamily),
  ).toBe(await main.evaluate((node) => getComputedStyle(node).fontFamily));
  await expect(page.getByText('Contenido oculto')).toBeHidden();
});

test('grid, media and container reflow with 200% root text', async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  await page.locator('.page-content').evaluate((content) => {
    document.documentElement.style.fontSize = '200%';
    const grid = document.createElement('div');
    grid.className = 'layout-grid';
    grid.dataset.layoutTest = 'fixture';
    const img = document.createElement('img');
    img.className = 'responsive-media';
    img.src = '/government/costa-rica.svg';
    img.alt = 'Recurso de prueba';
    img.width = 350;
    img.height = 210;
    grid.append(img);
    content.append(grid);
  });
  expect(
    await page
      .locator('[data-layout-test="fixture"]')
      .evaluate(
        (node) => getComputedStyle(node).gridTemplateColumns.split(' ').length,
      ),
  ).toBe(2);
  await expect(
    page.getByRole('img', { name: 'Recurso de prueba' }),
  ).toBeVisible();
  const img = page.getByRole('img', { name: 'Recurso de prueba' });
  const box = await img.boundingBox();
  expect(box!.width / box!.height).toBeCloseTo(350 / 210, 1);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(768);
});
