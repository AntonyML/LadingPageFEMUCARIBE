import { expect, test, type Page } from '@playwright/test';
import type { Municipality } from '../../src/lib/municipalities-repository';

const origin = `http://127.0.0.1:${process.env.FEMUCARIBE_ADMIN_E2E_PORT || '4324'}`;
test.use({ baseURL: origin });
test.describe.configure({ mode: 'serial' });

async function login(page: Page) {
  const response = await page.request.post('/api/auth/login', {
    data: { email: 'soporte@femucaribe.go.cr', password: 'XFSudF*L^pg@1' },
  });
  expect(response.status()).toBe(200);
  // The standalone build correctly sets Secure. This isolated test server uses
  // plain loopback HTTP, so only its test cookie is adapted for APIRequestContext.
  const { cookies } = await page.context().storageState();
  await page
    .context()
    .addCookies(cookies.map((cookie) => ({ ...cookie, secure: false })));
}

function editable(record: Municipality) {
  return {
    name: record.name,
    cabecera: record.cabecera,
    description: record.description,
    alcaldia: record.alcaldia,
    contacto: record.contacto,
    escudoUrl: record.escudoUrl,
    proyectosDestacados: record.proyectosDestacados,
  };
}

test('protects the page and every API operation without a valid session', async ({
  page,
  request,
  context,
}) => {
  await page.goto('/admin/municipalidades');
  await expect(page).toHaveURL(/\/acceso\?error=unauthorized$/);
  for (const pathname of [
    '/%61dmin/municipalidades',
    '//admin/municipalidades',
    '/api/%61dmin/municipalities',
  ]) {
    const response = await request.get(`${origin}${pathname}`, {
      maxRedirects: 0,
    });
    expect([301, 302, 401, 404]).toContain(response.status());
  }
  for (const endpoint of [
    '/api/admin/municipalities',
    '/api/admin/municipalities/limon',
  ]) {
    const response = await request.get(endpoint);
    expect(response.status()).toBe(401);
    expect(response.headers()['cache-control']).toBe('no-store');
  }
  expect(
    (
      await request.put('/api/admin/municipalities/limon', {
        data: {},
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(401);
  await context.addCookies([
    { name: 'femucaribe_session', value: 'tampered.signature', url: origin },
  ]);
  expect(
    (await page.request.get('/api/admin/municipalities/limon')).status(),
  ).toBe(401);
});

test('returns the six canonical cantons and rejects invalid writes without changing data', async ({
  page,
}) => {
  await login(page);
  const request = page.request;
  const listing = await request.get('/api/admin/municipalities');
  const records = (await listing.json()) as Municipality[];
  expect(records.map(({ id }) => id)).toEqual([
    'limon',
    'pococi',
    'siquirres',
    'talamanca',
    'matina',
    'guacimo',
  ]);
  expect(listing.headers()['cache-control']).toBe('no-store');
  const original = records.find(({ id }) => id === 'pococi');
  expect(original).toBeDefined();
  if (!original) throw new Error('Missing fixture');
  const fields = editable(original);
  const endpoint = '/api/admin/municipalities/pococi';
  expect(
    (await request.get('/api/admin/municipalities/parrita')).status(),
  ).toBe(404);
  expect(
    (
      await request.put('/api/admin/municipalities/parrita', {
        data: fields,
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await request.put(endpoint, {
        data: fields,
        headers: { Origin: 'https://foreign.example' },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.put(endpoint, {
        data: Buffer.from('bad json'),
        headers: { Origin: origin, 'Content-Type': 'application/json' },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.put(endpoint, {
        data: 'plain text',
        headers: { Origin: origin, 'Content-Type': 'text/plain' },
      })
    ).status(),
  ).toBe(415);
  expect(
    (
      await request.put(endpoint, {
        data: { ...fields, id: 'limon' },
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(422);
  for (const contacto of [
    { ...fields.contacto, correo: 'invalid' },
    { ...fields.contacto, telefono: '123' },
    { ...fields.contacto, sitioWeb: 'javascript:alert(1)' },
  ]) {
    expect(
      (
        await request.put(endpoint, {
          data: { ...fields, contacto },
          headers: { Origin: origin },
        })
      ).status(),
    ).toBe(422);
  }
  expect(
    (
      await request.put(endpoint, {
        data: { ...fields, escudoUrl: '//foreign.example/emblem.svg' },
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(422);
  expect((await request.get(endpoint)).headers()['cache-control']).toBe(
    'no-store',
  );
  expect(await (await request.get(endpoint)).json()).toEqual(original);
});

test('edits the complete form, previews images, and publishes immediately without rebuilding', async ({
  page,
  browser,
}) => {
  await login(page);
  const endpoint = '/api/admin/municipalities/pococi';
  const original = (await (
    await page.request.get(endpoint)
  ).json()) as Municipality;
  const publicContext = await browser.newContext();
  try {
    await page.goto('/admin/municipalidades?canton=pococi');
    await expect(page.locator('[data-canton-link]')).toHaveCount(6);
    await expect(page.locator('[data-canton-link="pococi"]')).toHaveAttribute(
      'aria-current',
      'true',
    );
    await expect(
      page.getByRole('link', { name: 'Previsualizar en sitio público' }),
    ).toHaveAttribute('href', '/municipalidades#municipality-pococi');
    const description =
      'Perfil actualizado desde el panel.\nSegunda línea institucional. <script>window.unexpected=true</script>';
    await page
      .locator('#municipality-name')
      .fill('Municipalidad de Pococí · Atención ciudadana');
    await page
      .locator('#municipality-cabecera')
      .fill('Guápiles · Sede municipal');
    await page.locator('#municipality-description').fill(description);
    await expect(page.locator('[data-description-counter]')).toContainText(
      `${description.length} / 6000`,
    );
    await page.locator('#authority-name').fill('Autoridad de prueba');
    await page.locator('#authority-position').fill('Alcaldía Municipal');
    await page
      .locator('#authority-photo')
      .fill('/images/municipalities/alcaldesa-limon.png');
    await expect(
      page.locator('[data-image-preview="authority"] img'),
    ).toBeVisible();
    await page.locator('#contact-phone').fill('+506 2713-6561');
    await page.locator('#contact-email').fill('gestion@example.test');
    await page
      .locator('#contact-website')
      .fill('https://example.test/municipalidad');
    await page
      .locator('#contact-address')
      .fill('Sede de prueba\nGuápiles, Limón');
    await page
      .locator('#municipality-emblem')
      .fill('/images/municipalities/alcalde-matina.png');
    await expect(
      page.locator('[data-image-preview="emblem"] img'),
    ).toBeVisible();
    await page
      .locator('#municipality-projects')
      .fill('Convenio de prueba\nIniciativa regional de prueba');

    let releaseSave: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      releaseSave = resolve;
    });
    await page.route(`**${endpoint}`, async (route) => {
      const response = await route.fetch();
      await gate;
      await route.fulfill({ response });
    });
    await page
      .getByRole('button', { name: 'Guardar cambios', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: 'Guardando...' }),
    ).toBeDisabled();
    releaseSave();
    await expect(page.locator('[data-save-feedback]')).toContainText('guardad');
    await page.unroute(`**${endpoint}`);
    const saved = (await (
      await page.request.get(endpoint)
    ).json()) as Municipality;
    expect(saved.updatedAt).not.toBe(original.updatedAt);
    await expect(
      page.locator('[data-canton-updated="pococi"]'),
    ).toHaveAttribute('datetime', saved.updatedAt);

    const publicPage = await publicContext.newPage();
    const publicResponse = await publicPage.goto(
      `${origin}/municipalidades#municipality-pococi`,
    );
    expect(publicResponse?.headers()['cache-control']).toBe('no-store');
    const card = publicPage.locator('#municipality-pococi');
    await expect(card.getByRole('heading', { level: 2 })).toHaveText(
      saved.name,
    );
    await expect(card).toContainText(saved.cabecera);
    await expect(card).toContainText(description);
    await expect(
      card.getByRole('link', { name: 'gestion@example.test', exact: true }),
    ).toHaveAttribute('href', 'mailto:gestion@example.test');
    await expect(
      card.getByRole('link', { name: '+506 2713-6561', exact: true }),
    ).toHaveAttribute('href', 'tel:+50627136561');
    await expect(
      card.getByRole('link', { name: 'Ver sitio web oficial' }),
    ).toHaveAttribute('href', saved.contacto.sitioWeb);
    await expect(card.locator('#projects-pococi li')).toHaveText(
      saved.proyectosDestacados,
    );
    await expect(card.locator('img[alt=""]')).toHaveAttribute(
      'src',
      saved.escudoUrl,
    );
    const authority = publicPage.locator('#authority-pococi');
    await expect(authority).toContainText('Autoridad de prueba');
    await expect(authority).toContainText('Alcaldía Municipal');
    await expect(authority.locator('figure img')).toHaveAttribute(
      'src',
      saved.alcaldia.fotoUrl,
    );
    expect(await publicPage.evaluate(() => 'unexpected' in window)).toBe(false);
    await page.reload();
    await expect(page.locator('#municipality-description')).toHaveValue(
      description,
    );
    await expect(page.locator('#authority-name')).toHaveValue(
      'Autoridad de prueba',
    );
  } finally {
    await page.request.put(endpoint, {
      data: editable(original),
      headers: { Origin: origin },
    });
    await publicContext.close();
  }
});

test('keeps unsaved changes and announces save failures and expired sessions', async ({
  page,
  context,
}) => {
  await login(page);
  await page.goto('/admin/municipalidades?canton=limon');
  await page.locator('#contact-phone').fill('123');
  await page
    .getByRole('button', { name: 'Guardar cambios', exact: true })
    .click();
  expect(
    await page
      .locator('#contact-phone')
      .evaluate((input: HTMLInputElement) => input.checkValidity()),
  ).toBe(false);
  await page.locator('#contact-phone').fill('+506 2758-4444');
  await page.locator('#contact-email').fill('a@b');
  await page
    .getByRole('button', { name: 'Guardar cambios', exact: true })
    .click();
  await expect(page.locator('[data-save-feedback]')).toContainText(
    'Correo institucional',
  );
  await expect(page.locator('#contact-email')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(page.locator('#contact-email')).toBeFocused();
  await page.locator('#contact-email').fill('alcaldia@municlimon.go.cr');
  await page
    .locator('#municipality-description')
    .fill('Cambios pendientes ante un error.');
  await page.route('**/api/admin/municipalities/limon', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'No fue posible guardar los cambios.' }),
    }),
  );
  await page
    .getByRole('button', { name: 'Guardar cambios', exact: true })
    .click();
  await expect(page.locator('[data-save-feedback]')).toContainText(
    'No fue posible guardar',
  );
  await expect(page.locator('#municipality-description')).toHaveValue(
    'Cambios pendientes ante un error.',
  );
  await page.unroute('**/api/admin/municipalities/limon');
  await context.clearCookies();
  await page
    .getByRole('button', { name: 'Guardar cambios', exact: true })
    .click();
  await expect(page.locator('[data-save-feedback]')).toContainText(
    /sesión|iniciar sesión/,
  );
  await expect(page.locator('#municipality-description')).toHaveValue(
    'Cambios pendientes ante un error.',
  );
});

test('reflows at mobile, tablet, desktop and 200% text and supports keyboard editing', async ({
  page,
}, testInfo) => {
  await login(page);
  await page.goto('/admin/municipalidades');
  for (const [width, height] of [
    [280, 800],
    [320, 800],
    [768, 900],
    [1440, 1000],
    [844, 390],
    [720, 900],
  ]) {
    await page.setViewportSize({ width: width ?? 320, height: height ?? 800 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width ?? 320);
    if (width === 320 || width === 1440) {
      await page.screenshot({
        path: testInfo.outputPath(`admin-${width}.png`),
        fullPage: true,
      });
    }
  }
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Pasar al contenido principal' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#admin-main')).toBeFocused();
  for (
    let index = 0;
    index < 30 &&
    !(await page
      .locator('#municipality-name')
      .evaluate((input) => input === document.activeElement));
    index += 1
  )
    await page.keyboard.press('Tab');
  await expect(page.locator('#municipality-name')).toBeFocused();
  expect(
    await page
      .locator('#municipality-name')
      .evaluate((input) =>
        Number.parseFloat(getComputedStyle(input).outlineWidth),
      ),
  ).toBeGreaterThanOrEqual(2);
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: testInfo.outputPath('admin-dark.png'),
    fullPage: true,
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await expect(
      page.getByRole('button', { name: 'Guardar cambios', exact: true }),
    ).toBeVisible();
  }
});
