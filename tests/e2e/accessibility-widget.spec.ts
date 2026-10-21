import { expect, test } from '@playwright/test';

test.describe('Widget de Accesibilidad y Navegación Principal (con JavaScript)', () => {
  test.use({ javaScriptEnabled: true });

  test('clicking skip link smoothly scrolls down to primary content past the hero and focuses main', async ({
    page,
  }) => {
    await page.goto('/');
    const main = page.locator('main#contenido-principal');
    const pageContent = page.locator('.page-content');
    const skipLink = page.getByRole('link', {
      name: 'Pasar al contenido principal',
    });

    await expect(skipLink).toBeVisible();

    // Verify initial scroll is at top
    const initialScroll = await page.evaluate(() => window.scrollY);
    expect(initialScroll).toBe(0);

    // Click the skip link
    await skipLink.click();

    // Verify main received focus
    await expect(main).toBeFocused();

    // Verify that scroll position has advanced past header towards page-content
    await page.waitForTimeout(500);
    const scrolledY = await page.evaluate(() => window.scrollY);
    expect(scrolledY).toBeGreaterThan(120);

    const contentBox = await pageContent.boundingBox();
    expect(contentBox?.y).toBeLessThanOrEqual(200);
  });

  test('clicking topbar accessibility button opens the accessibility modal widget', async ({
    page,
  }) => {
    await page.goto('/');

    const a11yLink = page.locator('.government-bar .accessibility');
    await expect(a11yLink).toBeVisible();
    await expect(a11yLink).toHaveAttribute('role', 'button');

    // Click accessibility link in the top bar
    await a11yLink.click();

    // Check that the accessibility widget container exists and is open
    const widgetHost = page.locator('#snn-accessibility-widget-container');
    await expect(widgetHost).toBeAttached();

    // Verify menu is visible inside shadow DOM
    const isMenuOpen = await widgetHost.evaluate((host) => {
      const menu = host.shadowRoot?.querySelector(
        '#snn-accessibility-menu',
      ) as HTMLElement | null;
      return menu ? menu.style.display === 'block' : false;
    });
    expect(isMenuOpen).toBe(true);

    // Verify options are present in Spanish
    const optionTitles = await widgetHost.evaluate((host) => {
      const titles = host.shadowRoot?.querySelectorAll('.snn-button-text');
      return titles
        ? Array.from(titles).map((t) => t.textContent?.trim() || '')
        : [];
    });
    expect(optionTitles).toContain('Alto Contraste');
    expect(optionTitles).toContain('Tamaño de Texto');

    // Close the modal by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const isMenuClosed = await widgetHost.evaluate((host) => {
      const menu = host.shadowRoot?.querySelector(
        '#snn-accessibility-menu',
      ) as HTMLElement | null;
      return menu ? menu.style.display !== 'block' : true;
    });
    expect(isMenuClosed).toBe(true);
  });

  test('floating accessibility button is rendered and toggles the modal', async ({
    page,
  }) => {
    await page.goto('/');

    const widgetHost = page.locator('#snn-accessibility-widget-container');
    await expect(widgetHost).toBeAttached();

    // Click the floating button inside shadow root
    await widgetHost.evaluate((host) => {
      const btn = host.shadowRoot?.querySelector(
        '#snn-accessibility-button',
      ) as HTMLButtonElement | null;
      btn?.click();
    });

    const isMenuOpen = await widgetHost.evaluate((host) => {
      const menu = host.shadowRoot?.querySelector(
        '#snn-accessibility-menu',
      ) as HTMLElement | null;
      return menu ? menu.style.display === 'block' : false;
    });
    expect(isMenuOpen).toBe(true);
  });

  test('accessibility control applies high contrast class to document', async ({
    page,
  }) => {
    await page.goto('/');

    // Open widget
    const a11yLink = page.locator('.government-bar .accessibility');
    await a11yLink.click();

    const widgetHost = page.locator('#snn-accessibility-widget-container');

    // Click high contrast toggle
    await widgetHost.evaluate((host) => {
      const contrastBtn = host.shadowRoot?.querySelector(
        'button[data-accessibility-option-id="highContrast"]',
      ) as HTMLButtonElement | null;
      contrastBtn?.click();
    });

    // Check if html body or root has high contrast class
    const hasContrastClass = await page.evaluate(() => {
      return (
        document.body.className.includes('snn-') ||
        document.documentElement.className.includes('snn-')
      );
    });
    expect(hasContrastClass).toBe(true);
  });
});

test.describe('Widget de Accesibilidad y Navegación Principal (sin JavaScript)', () => {
  test.use({ javaScriptEnabled: false });

  test('accessibility links fallback gracefully to /accesibilidad without JavaScript', async ({
    page,
  }) => {
    await page.goto('/');

    const a11yTopLink = page.locator('.government-bar .accessibility');
    await expect(a11yTopLink).toHaveAttribute('href', '/accesibilidad');

    const footerLink = page.locator(
      'footer a[href="/accesibilidad"], .site-footer a[href="/accesibilidad"]',
    );
    await expect(footerLink.first()).toBeVisible();

    const skipLink = page.locator('.government-bar .skip-link');
    await expect(skipLink).toHaveAttribute('href', '#contenido-principal');
  });
});
