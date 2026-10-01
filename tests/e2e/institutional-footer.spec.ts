import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`footer is readable and usable without JS at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await expect(footer).toHaveCount(1);
    await expect(footer.getByRole('heading')).toHaveCount(3);
    await expect(
      footer.getByRole('link', { name: '(+506) 2768-2000' }),
    ).toHaveAttribute('href', 'tel:+50627682000');
    await expect(
      footer.getByRole('link', { name: 'contacto@femucaribe.go.cr' }),
    ).toHaveAttribute('href', 'mailto:contacto@femucaribe.go.cr');
    await expect(
      footer.getByRole('link', { name: 'Política de Privacidad' }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    for (const a of await footer.getByRole('link').all()) {
      const box = await a.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(width < 1250 ? 44 : 13);
    }
    await page.evaluate(() => document.fonts.ready);
    await footer.screenshot({
      path: test.info().outputPath(`footer-${width}.png`),
    });
  });
}

test('footer keyboard focus is visible and styles do not leak', async ({
  page,
}) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  const brand = footer.getByRole('link', { name: 'FEMUCARIBE, Inicio' });
  await brand.focus();
  await page.keyboard.press('Tab');
  const first = footer.getByRole('link', { name: 'Nosotros y Estatutos' });
  await expect(first).toBeFocused();
  expect(await first.evaluate((a) => getComputedStyle(a).outlineStyle)).toBe(
    'solid',
  );
  const outside = await page.getByRole('main').evaluate((main) => {
    const p = document.createElement('p');
    p.textContent = 'Outside footer';
    main.append(p);
    return getComputedStyle(p).marginTop;
  });
  expect(outside).not.toBe('0px');
});

test('enlarged footer text reflows without clipping', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  await page.getByRole('contentinfo').evaluate((footer) => {
    for (const element of footer.querySelectorAll(
      'a, p, span, h2, small, strong',
    )) {
      const node = element as HTMLElement;
      node.style.fontSize = `${parseFloat(getComputedStyle(node).fontSize) * 2}px`;
    }
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
