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

  test('Contact Form renders interactive fields and handles subject selection', async ({
    page,
  }) => {
    await page.goto('/contacto');

    const form = page.locator('#contact-form');
    await expect(form).toBeVisible();

    const nameInput = form.locator('#contact-name');
    const emailInput = form.locator('#contact-email');
    const subjectSelect = form.locator('#contact-subject-select');
    const customSubjectWrapper = form.locator('#custom-subject-wrapper');
    const customSubjectInput = form.locator('#contact-custom-subject');
    const messageInput = form.locator('#contact-message');
    const submitBtn = form.locator('#submit-button');

    // All controls are enabled and visible
    await expect(nameInput).toBeEnabled();
    await expect(emailInput).toBeEnabled();
    await expect(subjectSelect).toBeEnabled();
    await expect(messageInput).toBeEnabled();
    await expect(submitBtn).toBeEnabled();

    // Custom subject field is initially hidden
    await expect(customSubjectWrapper).toBeHidden();

    // Subject select options verification
    const options = await subjectSelect.locator('option').allInnerTexts();
    expect(options).toContain('Gestión Intermunicipal y Cooperación Regional');
    expect(options).toContain('Consulta sobre Proyectos y Desarrollo Cantonal');
    expect(options).toContain(
      'Trámites de Transparencia y Acceso a la Información',
    );
    expect(options).toContain('Atención Ciudadana y Denuncias de Servicios');
    expect(options).toContain('Otro asunto (especificar)');

    // Selecting 'otro' reveals the custom subject input
    await subjectSelect.selectOption('otro');
    await expect(customSubjectWrapper).toBeVisible();
    await expect(customSubjectInput).toBeVisible();

    // Selecting a predefined option hides the custom input again
    await subjectSelect.selectOption(
      'Gestión Intermunicipal y Cooperación Regional',
    );
    await expect(customSubjectWrapper).toBeHidden();
  });

  test('Contact Form validates required fields and displays feedback', async ({
    page,
  }) => {
    await page.goto('/contacto');

    const form = page.locator('#contact-form');
    const submitBtn = form.locator('#submit-button');
    const statusBox = form.locator('#form-status');

    // Attempting submit without values triggers validation
    await submitBtn.click();
    await expect(statusBox).toBeVisible();
    await expect(statusBox).toContainText(/nombre completo/i);

    // Mock successful submission to WordPress CF7 endpoint
    await page.route(
      '**/wp-json/contact-form-7/v1/contact-forms/*/feedback',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            contact_form_id: 54,
            status: 'mail_sent',
            message: 'Gracias por su mensaje. Ha sido enviado.',
          }),
        });
      },
    );

    // Fill valid data
    await form.locator('#contact-name').fill('Ana María Mora');
    await form.locator('#contact-email').fill('anamaria@ejemplo.com');
    await form.locator('#contact-subject-select').selectOption('otro');
    await form
      .locator('#contact-custom-subject')
      .fill('Consulta sobre convenio interinstitucional');
    await form
      .locator('#contact-message')
      .fill('Quisiera información sobre el próximo taller de capacitación.');

    await submitBtn.click();

    // Success status is displayed
    await expect(statusBox).toBeVisible();
    await expect(statusBox).toHaveClass(/is-success/);
    await expect(statusBox).toContainText(
      /¡Mensaje enviado satisfactoriamente!/i,
    );
  });
});
