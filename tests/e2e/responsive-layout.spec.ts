import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

for (const width of [
  320, 683, 853, 1093, 1249, 1250, 1399, 1400, 1440, 1536, 1920,
]) {
  test(`shared layout fits ${width}px including effective zoom widths`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const footer = page.getByRole('contentinfo');
    const stripe = await footer
      .locator('[aria-hidden="true"]')
      .first()
      .boundingBox();
    expect(stripe?.x).toBe(0);
    expect(stripe?.width).toBe(width);
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    const contact = await nav
      .getByRole('link', { name: 'Contáctenos' })
      .boundingBox();
    const platform = await nav.locator('.platform').boundingBox();
    expect(contact).not.toBeNull();
    expect(platform).not.toBeNull();
    if (width >= 600) {
      expect(platform!.y).toBeCloseTo(contact!.y, 0);
      expect(platform!.x - contact!.x - contact!.width).toBeCloseTo(12, 0);
    }
    for (const section of await footer.locator('section, nav').all()) {
      expect(
        await section.evaluate(
          (node) => node.scrollWidth <= node.clientWidth + 1,
        ),
      ).toBe(true);
    }
    if ([683, 1400, 1536].includes(width)) {
      await page.screenshot({
        path: test.info().outputPath(`layout-${width}.png`),
        fullPage: true,
      });
    }
  });
}
