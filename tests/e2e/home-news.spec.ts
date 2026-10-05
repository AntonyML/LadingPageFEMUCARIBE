import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const fixtureOrigin = 'http://127.0.0.1:4323';
const heading = 'Actualidad y Comunicados Oficiales';
const emptyMessage = 'Aún no hay noticias publicadas.';
const emptyDescription =
  'Aquí encontrarás los comunicados oficiales y las novedades de FEMUCARIBE.';
const pendingLabel = 'Sala de Prensa pendiente';
const articleTitle = 'Noticia de prueba con destino disponible';
const imageTitle = 'Noticia de prueba con imagen y sin destino';
const longTitle =
  'Noticia de prueba con título largo para comprobar su lectura en pantallas estrechas y con texto ampliado';

function news(page: Page) {
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

async function expectNewsContent(page: Page, populated: boolean) {
  const region = news(page);
  await expect(region).toBeVisible();
  await expect(region.getByRole('heading', { level: 2 })).toHaveText(heading);
  if (populated) {
    await expect(region.getByRole('article')).toHaveCount(3);
    for (const title of [articleTitle, imageTitle, longTitle]) {
      await expect(
        region.getByRole('heading', { level: 3, name: title, exact: true }),
      ).toBeVisible();
    }
    await expect(region.getByRole('link')).toHaveCount(2);
    await expect(region.getByText(emptyMessage, { exact: true })).toHaveCount(
      0,
    );
  } else {
    await expect(region.getByText(emptyMessage, { exact: true })).toBeVisible();
    await expect(
      region.getByText(emptyDescription, { exact: true }),
    ).toBeVisible();
    await expect(region.getByText(pendingLabel, { exact: true })).toBeVisible();
    await expect(region.getByRole('article')).toHaveCount(0);
    await expect(region.getByRole('link')).toHaveCount(0);
  }
}

async function expectNewsReflow(page: Page, width: number, populated: boolean) {
  await page.evaluate(() => document.fonts.ready);
  await expectNewsContent(page, populated);
  const bounds = await news(page)
    .locator('h2, h3, p, time, a, img, article')
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
  if (populated) {
    const boxes = await news(page)
      .getByRole('article')
      .evaluateAll((articles) =>
        articles.map((article) => {
          const rect = article.getBoundingClientRect();
          return {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
          };
        }),
      );
    for (const [index, box] of boxes.entries()) {
      for (const previous of boxes.slice(0, index)) {
        expect(
          box.left >= previous.right - 1 ||
            box.top >= previous.bottom - 1 ||
            box.right <= previous.left + 1 ||
            box.bottom <= previous.top + 1,
        ).toBe(true);
      }
    }
  }
}

test('Inicio explains the empty news state without invented cards or destinations and without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expectNewsContent(page, false);
  await expect(news(page)).toHaveCount(1);
  await expect(news(page).getByRole('list')).toHaveCount(0);
  await expect(
    news(page).locator(
      'a, button, input, select, textarea, summary, [href], [tabindex], [role="link"], [role="button"]',
    ),
  ).toHaveCount(0);
  await expect(news(page).locator('script')).toHaveCount(0);
});

test('supplied news remains readable without JavaScript and only supplied destinations become links', async ({
  page,
}) => {
  const response = await page.goto(`${fixtureOrigin}/home-news`);
  expect(response?.status()).toBe(200);
  await expectNewsContent(page, true);
  const region = news(page);
  const articles = region.getByRole('article');
  await expect(region.getByRole('listitem')).toHaveCount(3);
  for (const [index, date] of [
    '2026-10-02',
    '2026-10-01',
    '2026-09-30',
  ].entries()) {
    const article = articles.nth(index);
    await expect(article.locator('time')).toHaveAttribute('datetime', date);
    await expect(article.locator('time')).toBeVisible();
    await expect(
      article.getByText(
        `Categoría de prueba ${String.fromCharCode(65 + index)}`,
        {
          exact: true,
        },
      ),
    ).toBeVisible();
    await expect(article.locator('p')).toContainText('Contenido de ejemplo');
  }
  await expect(articles.nth(0).getByRole('link')).toHaveAttribute(
    'href',
    '/home-news/article',
  );
  await expect(articles.nth(1).getByRole('link')).toHaveCount(0);
  await expect(articles.nth(2).getByRole('link')).toHaveCount(0);
  const image = articles.nth(1).getByRole('img', {
    name: 'Bandera de Costa Rica utilizada como imagen de prueba',
  });
  await expect(image).toBeVisible();
  expect(
    await image.evaluate(
      (node) => node instanceof HTMLImageElement && node.naturalWidth > 0,
    ),
  ).toBe(true);
  const imageResponse = await page.request.get(
    `${fixtureOrigin}${await image.getAttribute('src')}`,
  );
  expect(imageResponse.status()).toBe(200);
  const placeholderBounds = (await articles
    .nth(0)
    .locator(':scope > div')
    .first()
    .boundingBox())!;
  const imageBounds = (await image.boundingBox())!;
  expect(imageBounds.width).toBeCloseTo(placeholderBounds.width, 0);
  expect(imageBounds.height).toBeCloseTo(placeholderBounds.height, 0);
  for (const index of [0, 2]) {
    await expect(articles.nth(index).getByRole('img')).toHaveCount(0);
    await expect(
      articles.nth(index).locator('[aria-hidden="true"]').first(),
    ).toBeVisible();
  }
  await expect(
    region.getByRole('link', { name: 'Ir a Sala de Prensa', exact: true }),
  ).toHaveAttribute('href', '/home-news/newsroom');
  await expect(region.locator('script')).toHaveCount(0);
});

test('news content without destinations does not offer an article or newsroom link', async ({
  page,
}) => {
  await page.goto(`${fixtureOrigin}/home-news/without-destinations`);
  const region = news(page);
  await expect(region.getByRole('article')).toHaveCount(1);
  await expect(
    region.getByRole('heading', {
      level: 3,
      name: 'Noticia de prueba sin destino',
    }),
  ).toBeVisible();
  await expect(region.getByRole('link')).toHaveCount(0);
  await expect(region.getByText(pendingLabel, { exact: true })).toBeVisible();
});

for (const width of [320, 1440]) {
  test(`supplied article and newsroom destinations can be reached with visible keyboard focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${fixtureOrigin}/home-news`);
    await page.keyboard.press('Tab');
    await expectVisibleFocus(
      page.getByRole('link', { name: 'Pasar al contenido principal' }),
    );
    await page.keyboard.press('Enter');
    await expectVisibleFocus(page.getByRole('main'));
    await page.keyboard.press('Tab');
    await expectVisibleFocus(
      news(page).getByRole('link', {
        name: 'Ir a Sala de Prensa',
        exact: true,
      }),
    );
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${fixtureOrigin}/home-news/newsroom`);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sala de prensa de prueba' }),
    ).toBeVisible();
    expect((await page.request.get(page.url())).status()).toBe(200);
    await page.goto(`${fixtureOrigin}/home-news`);
    await page.getByRole('main').focus();
    await page.keyboard.press('Tab');
    await expectVisibleFocus(
      news(page).getByRole('link', {
        name: 'Ir a Sala de Prensa',
        exact: true,
      }),
    );
    await page.keyboard.press('Tab');
    const article = news(page).getByRole('link', {
      name: articleTitle,
      exact: true,
    });
    await expectVisibleFocus(article);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${fixtureOrigin}/home-news/article`);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Destino de noticia de prueba',
      }),
    ).toBeVisible();
    expect((await page.request.get(page.url())).status()).toBe(200);
  });
}

for (const [width, height] of [
  [280, 740],
  [320, 740], // Effective CSS width when a 1280px viewport reaches 400% zoom.
  [767, 1024],
  [768, 1024],
  [844, 390],
  [1199, 900],
  [1200, 900],
  [1440, 900],
  [3840, 2160],
] as const) {
  for (const populated of [false, true]) {
    test(`${populated ? 'populated' : 'empty'} news is readable without overlap or horizontal scrolling at ${width}x${height}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto(populated ? `${fixtureOrigin}/home-news` : '/');
      await expectNewsReflow(page, width, populated);
      if ([320, 768, 1440].includes(width)) {
        await page.screenshot({
          path: test
            .info()
            .outputPath(
              `home-news-${populated ? 'populated' : 'empty'}-${width}.png`,
            ),
          fullPage: true,
        });
      }
    });
  }
}

for (const width of [320, 768, 1440]) {
  for (const populated of [false, true]) {
    for (const enlargement of ['root', 'text'] as const) {
      test(`${populated ? 'populated' : 'empty'} news supports ${enlargement} at 200% at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(populated ? `${fixtureOrigin}/home-news` : '/');
        await page.evaluate(() => document.fonts.ready);
        const originalHeight = (await news(page).boundingBox())!.height;
        if (enlargement === 'root') {
          await page.evaluate(() => {
            document.documentElement.style.fontSize = '200%';
          });
        } else {
          await news(page).evaluate((region) => {
            const nodes = Array.from(
              region.querySelectorAll('h2, h3, p, time, a, span'),
            );
            const sizes = nodes.map((node) =>
              parseFloat(getComputedStyle(node).fontSize),
            );
            nodes.forEach((node, index) => {
              (node as HTMLElement).style.fontSize = `${sizes[index]! * 2}px`;
            });
          });
        }
        await expectNewsReflow(page, width, populated);
        const expandedHeight = (await news(page).boundingBox())!.height;
        if (!populated && enlargement === 'text') {
          expect(expandedHeight).toBeGreaterThanOrEqual(originalHeight);
        } else {
          expect(expandedHeight).toBeGreaterThan(originalHeight + 1);
        }
      });
    }
  }
}
