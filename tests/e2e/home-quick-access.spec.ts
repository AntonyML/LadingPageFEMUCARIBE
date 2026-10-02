import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const resources = [
  ['Acuerdos del Consejo', 'Actas oficiales y resoluciones'],
  ['Cartera UGP', 'Inversión pública en territorio'],
  ['Directorio Municipal', 'Autoridades y 6 cantones'],
  ['Compras en SICOP', 'Transparencia y licitaciones'],
] as const;

const pendingLabel = 'Recurso pendiente';

function quickAccess(page: Page) {
  return page.getByRole('region', { name: 'Accesos directos', exact: true });
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

async function expectResourceReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  const region = quickAccess(page);
  await expect(region).toBeVisible();
  const cards = region.getByRole('listitem');
  await expect(cards).toHaveCount(resources.length);
  for (const [index, [title, description]] of resources.entries()) {
    const card = cards.nth(index);
    await expect(
      card.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible();
    await expect(card.getByText(description, { exact: true })).toBeVisible();
    await expect(card.getByText(pendingLabel, { exact: true })).toBeVisible();
    expect((await card.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  const bounds = await region
    .getByRole('list')
    .locator('*')
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

test('pending quick resources explain their availability without offering destinations or requiring JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  const region = quickAccess(page);
  await expect(region).toHaveCount(1);
  await expect(region.getByRole('heading', { level: 2 })).toHaveText(
    'Accesos directos',
  );
  await expect(region.getByRole('list')).toHaveCount(1);
  const cards = region.getByRole('listitem');
  await expect(cards).toHaveCount(resources.length);
  for (const [index, [title, description]] of resources.entries()) {
    const card = cards.nth(index);
    await expect(card.getByRole('heading', { level: 3 })).toHaveAccessibleName(
      title,
    );
    await expect(card.getByText(description, { exact: true })).toBeVisible();
    await expect(card.getByText(pendingLabel, { exact: true })).toBeVisible();
    const decoration = card.locator('[aria-hidden="true"]');
    await expect(decoration).toHaveCount(1);
    await expect(decoration).toContainText(/\p{Extended_Pictographic}/u);
  }
  await expect(
    region.locator(
      'a, button, input, select, textarea, summary, [href], [tabindex], [role="link"], [role="button"]',
    ),
  ).toHaveCount(0);
  await expect(region.locator('script')).toHaveCount(0);
});

for (const width of [320, 1440]) {
  test(`keyboard skips pending resources after both hero actions at ${width}px`, async ({
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
    for (const name of ['Ver proyectos', 'Contáctenos']) {
      await page.keyboard.press('Tab');
      await expectVisibleFocus(hero.getByRole('link', { name, exact: true }));
    }
    await page.keyboard.press('Tab');
    expect(
      await page
        .getByRole('contentinfo')
        .evaluate((footer) => footer.contains(document.activeElement)),
    ).toBe(true);
    await expectVisibleFocus(page.locator(':focus'));
  });
}

for (const [width, height] of [
  [280, 740],
  [320, 740], // 1280px reduced to the effective width of 400% zoom.
  [767, 1024],
  [768, 1024],
  [844, 390],
  [1199, 900],
  [1200, 900],
  [1440, 900],
  [1920, 1080],
  [3840, 2160],
] as const) {
  test(`quick resources remain readable and grouped at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expectResourceReflow(page, width);
    const region = quickAccess(page);
    const boxes = await region.getByRole('listitem').evaluateAll((cards) =>
      cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom };
      }),
    );
    const columns = width >= 1200 ? 4 : width >= 768 ? 2 : 1;
    for (let index = 0; index < boxes.length; index++) {
      const box = boxes[index]!;
      if (index % columns !== 0) {
        const previous = boxes[index - 1]!;
        expect(box.y).toBeCloseTo(previous.y, 0);
        expect(box.x).toBeGreaterThan(previous.right);
      } else if (index > 0) {
        expect(box.y).toBeGreaterThan(boxes[index - columns]!.bottom);
      }
    }
    const frame = (await region.boundingBox())!;
    expect(frame.width).toBeLessThanOrEqual(1280);
    expect(frame.x).toBeGreaterThanOrEqual(16);
    expect(frame.x + frame.width).toBeLessThanOrEqual(width - 16);
    if ([320, 768, 1440].includes(width)) {
      await page.screenshot({
        path: test.info().outputPath(`home-quick-access-${width}.png`),
        fullPage: true,
      });
    }
  });
}

for (const width of [320, 768, 1440]) {
  test(`quick resource cards expand without clipping when text reaches 200% at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const region = quickAccess(page);
    const originalHeights = await region
      .getByRole('listitem')
      .evaluateAll((cards) =>
        cards.map((card) => card.getBoundingClientRect().height),
      );
    await region.getByRole('list').evaluate((list) => {
      const textNodes = Array.from(
        list.querySelectorAll('h3, p, span:not([aria-hidden="true"])'),
      );
      const sizes = textNodes.map((node) =>
        parseFloat(getComputedStyle(node).fontSize),
      );
      textNodes.forEach((node, index) => {
        (node as HTMLElement).style.fontSize = `${sizes[index]! * 2}px`;
      });
    });
    await expectResourceReflow(page, width);
    const expandedHeights = await region
      .getByRole('listitem')
      .evaluateAll((cards) =>
        cards.map((card) => card.getBoundingClientRect().height),
      );
    expect(
      expandedHeights.some(
        (height, index) => height > originalHeights[index]! + 1,
      ),
    ).toBe(true);
  });
}
