import { expect, test } from '@playwright/test';

test.describe('Página de denuncias (/transparencia/denuncias)', () => {
  test('es accesible desde Transparencia y no desde Contacto', async ({
    page,
  }) => {
    await page.goto('/transparencia');
    await page.getByRole('link', { name: /Formulario de Denuncia/ }).click();
    await expect(page).toHaveURL(/\/transparencia\/denuncias$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Contraloría de Servicios y Mecanismo de Denuncias',
      }),
    ).toBeVisible();
    await expect(page.getByText(/Ley N\.° 8968/).first()).toBeVisible();
  });

  test('valida campos obligatorios antes de enviar', async ({ page }) => {
    await page.goto('/transparencia/denuncias');
    await page.getByRole('button', { name: 'Enviar gestión' }).click();
    await expect(page.locator('#complaint-status')).toContainText(
      'Seleccione el tipo de gestión',
    );
  });

  test('la modalidad anónima oculta los datos personales', async ({ page }) => {
    await page.goto('/transparencia/denuncias');
    await expect(page.locator('#complaint-name')).toBeVisible();
    await page.getByLabel('Presentar de forma anónima').check();
    await expect(page.locator('#identity-fields')).toBeHidden();
  });

  for (const width of [320, 768, 1440]) {
    test(`sin desbordamiento horizontal a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/transparencia/denuncias');
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(width);
    });
  }
});
