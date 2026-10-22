import { test, expect } from '@playwright/test';

test.describe('Admin Authentication & Middleware Protection', () => {
  const validEmail = 'soporte@femucaribe.go.cr';
  const validPassword = 'XFSudF*L^pg@1';

  test('unauthenticated access to /admin redirects to /acceso?error=unauthorized', async ({
    page,
  }) => {
    await page.goto('/admin');
    await page.waitForURL('**/acceso?error=unauthorized');
    expect(page.url()).toContain('/acceso?error=unauthorized');

    // Verification: Login dialog is auto-triggered and error message shown
    const loginModal = page.locator('#modal-login-admin');
    await expect(loginModal).toBeVisible();

    const errorMsg = page.locator('#login-error-msg');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText(
      'Debe iniciar sesión para acceder al panel',
    );
  });

  test('tampered session cookie redirects to /acceso?error=unauthorized', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: 'femucaribe_session',
        value: 'tampered_payload.tampered_signature',
        domain: '127.0.0.1',
        path: '/',
      },
    ]);

    await page.goto('/admin');
    await page.waitForURL('**/acceso?error=unauthorized');
    expect(page.url()).toContain('/acceso?error=unauthorized');
  });

  test('API /api/auth/login rejects invalid credentials with 401', async ({
    request,
  }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: validEmail,
        password: 'IncorrectPassword',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('API /api/auth/login accepts valid credentials, sets cookie, and returns redirect', async ({
    request,
  }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: validEmail,
        password: validPassword,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.redirect).toBe('/admin');

    const setCookie = response.headers()['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain('femucaribe_session=');
  });

  test('full login and logout flow in browser', async ({ page }) => {
    // 1. Visit /acceso and open login modal
    await page.goto('/acceso');

    // Click FEMUCARIBE toggle
    const toggleFemucaribe = page.locator('#btn-toggle-femucaribe');
    await toggleFemucaribe.click();

    // Click Iniciar Sesión button
    const openLoginBtn = page.locator('#btn-open-login-admin');
    await openLoginBtn.click();

    const loginModal = page.locator('#modal-login-admin');
    await expect(loginModal).toBeVisible();

    // 2. Fill incorrect credentials first
    await page.fill('#admin-user', validEmail);
    await page.fill('#admin-pass', 'WrongPassword123');
    await page.click('#modal-login-admin button[type="submit"]');

    // Verify error message is visible
    const errorMsg = page.locator('#login-error-msg');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Credenciales inválidas');

    // 3. Fill correct credentials
    await page.fill('#admin-pass', validPassword);
    await page.click('#modal-login-admin button[type="submit"]');

    // 4. Verify successful redirection to /admin
    await page.waitForURL('**/admin');
    expect(page.url()).toContain('/admin');

    // 5. Verify /admin content and user badge
    const headerTitle = page.locator('h1.header-title');
    await expect(headerTitle).toContainText(
      'Bienvenido al Panel de Administración',
    );

    const userBadge = page.locator('.user-email');
    await expect(userBadge).toContainText(validEmail);

    // 6. Navigate to submodules
    await page.click('a.nav-tab:has-text("Documentos")');
    await page.waitForURL('**/admin/documentos');
    await expect(page.locator('h1.module-title')).toContainText(
      'Documentos Institucionales',
    );

    await page.click('a.nav-tab:has-text("Municipalidades")');
    await page.waitForURL('**/admin/municipalidades');
    await expect(page.locator('h1.module-title')).toContainText(
      'Gestión de Municipalidades',
    );

    // 7. Perform Logout
    await page.click('#admin-logout-btn');
    await page.waitForURL('**/acceso');

    // 8. Try to navigate back to /admin -> must be blocked
    await page.goto('/admin');
    await page.waitForURL('**/acceso?error=unauthorized');
  });
});
