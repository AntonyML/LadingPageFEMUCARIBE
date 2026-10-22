import { expect, test } from '@playwright/test';

test.describe('Portal de Acceso (/acceso)', () => {
  test('navigation from navbar to access portal works', async ({ page }) => {
    await page.goto('/');
    const platformLink = page.getByRole('link', {
      name: 'Acceder a la plataforma',
    });
    await expect(platformLink).toBeVisible();
    await platformLink.click();
    await expect(page).toHaveURL(/\/acceso\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Acceso a Plataformas',
    );
  });

  for (const width of [320, 768, 1440]) {
    test(`renders without horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/acceso');

      // Check headings and main cards
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Acceso a Plataformas',
      );
      await expect(
        page.getByRole('heading', {
          level: 2,
          name: 'Entrar si eres una municipalidad',
        }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', {
          level: 2,
          name: 'Entrar si eres de FEMUCARIBE',
        }),
      ).toBeVisible();

      // Check no horizontal scroll
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(width);
    });
  }

  test('interactivity: municipal modal opens and closes', async ({ page }) => {
    await page.goto('/acceso');
    const muniBtn = page.getByRole('button', { name: 'Acceso Municipal' });
    await expect(muniBtn).toBeVisible();

    await muniBtn.click();
    const modal = page.locator('#modal-municipality');
    await expect(modal).toBeVisible();
    await expect(
      modal.getByRole('heading', { name: 'Portal de Gobiernos Locales' }),
    ).toBeVisible();

    const closeBtn = modal.getByRole('button', { name: 'Entendido' });
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('interactivity: femucaribe toggle reveals suboptions and login modal', async ({
    page,
  }) => {
    await page.goto('/acceso');

    const toggleBtn = page.getByRole('button', {
      name: 'Ver opciones de FEMUCARIBE',
    });
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    // Click to expand suboptions
    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

    // Suboptions should be visible
    const adminCard = page.getByRole('heading', {
      level: 4,
      name: 'Administración de Landing Page',
    });
    const platformCard = page.getByRole('heading', {
      level: 4,
      name: 'Plataforma Web',
    });
    await expect(adminCard).toBeVisible();
    await expect(platformCard).toBeVisible();

    // Click Admin login button to open login modal
    const loginBtn = page.getByRole('button', {
      name: 'Iniciar Sesión Administrativa',
    });
    await expect(loginBtn).toBeVisible();
    await loginBtn.click();

    const loginModal = page.locator('#modal-login-admin');
    await expect(loginModal).toBeVisible();
    await expect(
      loginModal.getByLabel('Usuario o Correo Institucional'),
    ).toBeVisible();
    await expect(loginModal.getByLabel('Contraseña')).toBeVisible();

    // Fill form and submit -> redirects to /admin
    await loginModal
      .getByLabel('Usuario o Correo Institucional')
      .fill('admin@femucaribe.go.cr');
    await loginModal.getByLabel('Contraseña').fill('AdminPassword123!');

    await loginModal.getByRole('button', { name: 'Ingresar a /admin' }).click();
    await expect(page).toHaveURL(/\/admin\/?$/);
  });
});
