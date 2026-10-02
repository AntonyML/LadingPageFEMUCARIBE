import { readFile } from 'node:fs/promises';
import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

async function expectVisibleFocus(target: Locator) {
  await expect(target).toBeFocused();
  const outline = await target.evaluate((node) => {
    const style = getComputedStyle(node);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
  expect(outline.style).toBe('solid');
  expect(outline.width).toBeGreaterThanOrEqual(2);
}

async function expectLegalReflow(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width);
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { name: 'Aviso legal y privacidad', level: 1 }),
  ).toBeVisible();
  await expect(
    main.getByRole('navigation', { name: 'En esta página' }),
  ).toBeVisible();
  await expect(
    main.getByRole('link', {
      name: 'Consultar la licencia completa de Inter (TXT)',
    }),
  ).toBeVisible();
  const bounds = await main
    .locator('h1, h2, h3, p, li, a, nav, article, section')
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
}

test('footer and site information navigation reach legal content without JS', async ({
  page,
}) => {
  await page.goto('/');
  const footerPolicies = page
    .getByRole('contentinfo')
    .getByRole('navigation', { name: 'Información legal, pie de página' });
  await footerPolicies
    .getByRole('link', { name: 'Política de Privacidad' })
    .click();
  await expect(page).toHaveURL(/\/legal\/?#privacidad$/);
  await expect(
    page
      .getByRole('main')
      .getByRole('region', { name: 'Privacidad y datos personales' }),
  ).toBeVisible();
  await footerPolicies
    .getByRole('link', { name: 'Aviso legal', exact: true })
    .click();
  await expect(page).toHaveURL(/\/legal\/?$/);
  await expect(page).toHaveTitle('Aviso legal y privacidad | FEMUCARIBE');
  const information = page
    .getByRole('main')
    .getByRole('navigation', { name: 'Información del sitio' });
  const legalLink = information.getByRole('link', {
    name: 'Aviso legal y privacidad',
    exact: true,
  });
  await expect(legalLink).toHaveAttribute('aria-current', 'page');
  await information
    .getByRole('link', { name: 'Créditos', exact: true })
    .click();
  await expect(page).toHaveURL(/\/creditos\/?$/);
  await expect(
    information.getByRole('link', { name: 'Créditos', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await legalLink.click();
  await expect(page).toHaveURL(/\/legal\/?$/);
  const consultations = page
    .getByRole('main')
    .getByRole('region', { name: 'Consultas y derechos' });
  await expect(
    consultations.getByRole('link', {
      name: 'info@femucaribe.go.cr',
      exact: true,
    }),
  ).toHaveAttribute('href', 'mailto:info@femucaribe.go.cr');
  await expect(
    consultations.getByRole('link', {
      name: 'soporte@femucaribe.go.cr',
      exact: true,
    }),
  ).toHaveAttribute('href', 'mailto:soporte@femucaribe.go.cr');
});

test('credits lead to the full, locally served Inter license', async ({
  page,
  request,
}) => {
  await page.goto('/creditos');
  await page
    .getByRole('main')
    .getByRole('link', { name: 'Consultar las licencias' })
    .click();
  await expect(page).toHaveURL(/\/legal\/?#licencias$/);
  const licenses = page
    .getByRole('main')
    .getByRole('region', { name: 'Tipografías y licencias' });
  await expect(licenses).toBeVisible();
  const licenseLink = licenses.getByRole('link', {
    name: 'Consultar la licencia completa de Inter (TXT)',
  });
  const href = await licenseLink.getAttribute('href');
  expect(href).not.toBeNull();
  const licenseUrl = new URL(href!, page.url());
  expect(licenseUrl.origin).toBe(new URL(page.url()).origin);
  const response = await request.get(licenseUrl.href);
  expect(response.status()).toBe(200);
  const text = await response.text();
  expect(text).toBe(
    await readFile(
      new URL('../../src/assets/brand/INTER-OFL.txt', import.meta.url),
      'utf8',
    ),
  );
  expect(text).toContain('SIL OPEN FONT LICENSE Version 1.1');
  expect(text).toContain('Copyright 2020 The Inter Project Authors');
  expect(text).toContain('TERMINATION');
  expect(text).toContain('DISCLAIMER');
});

test('keyboard navigation reaches the legal contents and focuses its section', async ({
  page,
}) => {
  await page.goto('/legal');
  await page.keyboard.press('Tab');
  await expectVisibleFocus(
    page.getByRole('link', { name: 'Pasar al contenido principal' }),
  );
  await page.keyboard.press('Enter');
  const main = page.getByRole('main');
  await expectVisibleFocus(main);
  const information = main.getByRole('navigation', {
    name: 'Información del sitio',
  });
  const contents = main.getByRole('navigation', { name: 'En esta página' });
  for (const link of [
    main
      .getByRole('navigation', { name: 'Ubicación' })
      .getByRole('link', { name: 'Inicio', exact: true }),
    information.getByRole('link', { name: 'Créditos', exact: true }),
    information.getByRole('link', {
      name: 'Aviso legal y privacidad',
      exact: true,
    }),
    contents.getByRole('link', { name: 'Sobre el sitio', exact: true }),
    contents.getByRole('link', {
      name: 'Privacidad y datos personales',
      exact: true,
    }),
  ]) {
    await page.keyboard.press('Tab');
    await expectVisibleFocus(link);
  }
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/legal\/?#privacidad$/);
  await expectVisibleFocus(
    main.getByRole('region', { name: 'Privacidad y datos personales' }),
  );
});

test('legal resource styles preserve links outside their component', async ({
  page,
}) => {
  const metrics = [];
  for (const route of ['/', '/legal']) {
    await page.goto(route);
    metrics.push(
      await page.getByRole('main').evaluate((main) => {
        const link = document.createElement('a');
        link.href = '#contenido-principal';
        link.textContent = 'Enlace de prueba fuera del aviso legal';
        main.append(link);
        const style = getComputedStyle(link);
        return {
          underlineOffset: style.textUnderlineOffset,
          display: style.display,
          fontWeight: style.fontWeight,
        };
      }),
    );
  }
  expect(metrics[1]).toEqual(metrics[0]);
});

test.describe('privacy behavior with JavaScript enabled', () => {
  test.use({ javaScriptEnabled: true });

  test('informational pages load local resources without cookies or browser storage', async ({
    page,
    context,
    baseURL,
  }) => {
    const externalRequests: string[] = [];
    const expectedOrigin = new URL(baseURL!).origin;
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (/^https?:$/.test(url.protocol) && url.origin !== expectedOrigin)
        externalRequests.push(url.href);
    });
    for (const route of ['/legal', '/creditos']) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('form, iframe')).toHaveCount(0);
      expect(
        await page.evaluate(() => ({
          local: localStorage.length,
          session: sessionStorage.length,
        })),
      ).toEqual({ local: 0, session: 0 });
    }
    expect(externalRequests).toEqual([]);
    expect(await context.cookies()).toEqual([]);
  });
});

for (const { width, height } of [
  { width: 280, height: 740 },
  { width: 320, height: 740 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 900 },
  { width: 844, height: 390 },
]) {
  test(`legal information reflows at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/legal');
    await expectLegalReflow(page, width);
    if ([320, 1440].includes(width)) {
      await page.screenshot({
        path: test.info().outputPath(`legal-information-${width}.png`),
        fullPage: true,
      });
    }
  });
}

for (const width of [320, 768]) {
  test(`legal information reflows with 200% text at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/legal');
    await page.evaluate(() => {
      const nodes = Array.from(
        document.querySelectorAll(
          'h1, h2, h3, p, li, a, small, strong, span, time',
        ),
      );
      const sizes = nodes.map((node) =>
        parseFloat(getComputedStyle(node).fontSize),
      );
      nodes.forEach((node, index) => {
        (node as HTMLElement).style.fontSize = `${sizes[index]! * 2}px`;
      });
    });
    await expectLegalReflow(page, width);
  });
}
