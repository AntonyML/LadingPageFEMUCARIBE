import { expect, test } from '@playwright/test';

test.describe('Contacto page with native LocationMap', () => {
  for (const width of [320, 768, 1440]) {
    test(`renders contact information and location map without horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/contacto');

      // Heading and basic content
      const main = page.locator('#contenido-principal');
      await expect(
        main.getByRole('heading', { name: 'Póngase en Contacto' }),
      ).toBeVisible();

      // Official phone and email in details list
      const details = main.locator('.contact-details');
      const phoneLink = details.getByRole('link', {
        name: '(+506) 2768-7344',
      });
      await expect(phoneLink).toHaveAttribute('href', 'tel:+50627687344');

      const emailLink = details.getByRole('link', {
        name: 'info@femucaribe.go.cr',
      });
      await expect(emailLink).toHaveAttribute(
        'href',
        'mailto:info@femucaribe.go.cr',
      );

      // Native LocationMap region
      const mapRegion = main.getByRole('region', {
        name: /Ubicación geográfica/i,
      });
      await expect(mapRegion).toBeVisible();
      await expect(
        mapRegion.getByText('Sede Central · Siquirres, Costa Rica'),
      ).toBeVisible();
      await expect(mapRegion.getByText('10.0985° N, 83.5074° W')).toBeVisible();

      // Google maps directions CTA
      const directionsLink = mapRegion.getByRole('link', {
        name: /Cómo llegar/i,
      });
      await expect(directionsLink).toBeVisible();
      await expect(directionsLink).toHaveAttribute('target', '_blank');

      // Check horizontal overflow
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(width);
    });
  }

  test('LocationMap toggle expands and collapses correctly', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto('/contacto');

    const toggleBtn = page.getByRole('button', { name: /mapa/i });
    await expect(toggleBtn).toBeVisible();

    // Toggle collapse
    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    // Toggle expand
    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
  });
});
