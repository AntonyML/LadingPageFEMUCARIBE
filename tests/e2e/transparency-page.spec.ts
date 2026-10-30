import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const documentItems = [
  {
    tag: 'PRESUPUESTO · Ejercicio 2026',
    title: 'Informe Técnico del Presupuesto Ordinario 2026',
    meta: 'PDF Oficial · 806 KB',
  },
  {
    tag: 'LIQUIDACIÓN · Periodo 2025',
    title: 'Liquidación Presupuestaria Auditada 2025',
    meta: 'PDF Oficial · 381 KB',
  },
  {
    tag: 'PLANIFICACIÓN · Periodo 2026',
    title: 'Plan Anual Operativo (PAO) 2026 – Dirección y Gestión',
    meta: 'PDF Oficial · 397 KB',
  },
  {
    tag: 'FINANZAS · Periodo 2025',
    title: 'Estado de Situación Financiera Auditado a Diciembre 2025',
    meta: 'PDF Oficial · 257 KB',
  },
  {
    tag: 'ACTAS · Ejercicio 2026',
    title: 'Acta de Asamblea General Ordinaria N.º 01-2026',
    meta: 'PDF Oficial · 394 KB',
  },
  {
    tag: 'ACTAS · Periodo 2026',
    title: 'Acta de Sesión Extraordinaria N.º 01-2026 del Consejo Intermunicipal',
    meta: 'PDF Oficial · 752 KB',
  },
  {
    tag: 'NORMATIVA · La Gaceta N.º 175',
    title: 'Estatutos Vigentes de FEMUCARIBE (Diario Oficial La Gaceta N.º 175)',
    meta: 'PDF Oficial · 198 KB',
  },
  {
    tag: 'CONVENIOS · Ejercicio 2026',
    title: 'Convenio Marco de Cooperación DINADECO – FEMUCARIBE 2026',
    meta: 'PDF Oficial · 714 KB',
  },
] as const;

test.describe('Página de Transparencia (/transparencia)', () => {
  test('renders complete transparency page with semantic structure without JavaScript', async ({
    page,
  }) => {
    const response = await page.goto('/transparencia');
    expect(response?.ok()).toBe(true);

    await expect(page).toHaveTitle('Transparencia | FEMUCARIBE');
    await expect(
      page.getByRole('link', { name: 'Transparencia', exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    // Header section
    await expect(
      page.getByText('RENDICIÓN DE CUENTAS Y SELLO DE GOBIERNO DIGITAL'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Transparencia Activa y Fiscalización Ciudadana',
      }),
    ).toBeVisible();

    // SICOP procurement section
    const sicopSection = page.getByRole('region', {
      name: 'Compras Públicas en el Sistema Integrado SICOP',
    });
    await expect(sicopSection).toBeVisible();
    await expect(
      sicopSection.getByText(
        'Todas las licitaciones, contrataciones de obra pública y compras de bienes de FEMUCARIBE',
      ),
    ).toBeVisible();

    const sicopLink = sicopSection.getByRole('link', {
      name: /Consultar en SICOP/,
    });
    await expect(sicopLink).toBeVisible();
    await expect(sicopLink).toHaveAttribute('href', 'https://www.sicop.go.cr');
    await expect(sicopLink).toHaveAttribute('target', '_blank');
    await expect(sicopLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Documents and audits section
    const docsSection = page.getByRole('region', {
      name: 'Presupuestos Auditados, Liquidaciones y Actas Oficiales',
    });
    await expect(docsSection).toBeVisible();

    for (const doc of documentItems) {
      await expect(
        docsSection.getByText(doc.tag, { exact: true }),
      ).toBeVisible();
      await expect(
        docsSection.getByRole('heading', { level: 3, name: doc.title }),
      ).toBeVisible();
      await expect(
        docsSection.getByText(doc.meta, { exact: true }),
      ).toBeVisible();
      const downloadLink = docsSection.getByRole('link', {
        name: new RegExp(`Descargar documento: ${doc.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
      });
      await expect(downloadLink).toBeVisible();
      await expect(downloadLink).toHaveAttribute(
        'href',
        /^https:\/\/cms\.femucaribe\.go\.cr\/wp-content\/uploads\//,
      );
      const box = await downloadLink.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }

    // Contraloría de servicios section
    const contraloriaSection = page.getByRole('region', {
      name: 'Contraloría de Servicios y Mecanismo de Denuncias',
    });
    await expect(contraloriaSection).toBeVisible();
    await expect(
      contraloriaSection.getByText(
        'Cualquier persona puede presentar inconformidades, sugerencias o denuncias',
      ),
    ).toBeVisible();
    await expect(
      contraloriaSection.getByText(
        'Protección de Datos Garantizada bajo la Ley N.° 8968.',
      ),
    ).toBeVisible();

    const denunciaLink = contraloriaSection.getByRole('link', {
      name: /Formulario de Denuncia/,
    });
    await expect(denunciaLink).toBeVisible();
    await expect(denunciaLink).toHaveAttribute('href', '/contacto#denuncia');
    const denunciaBox = await denunciaLink.boundingBox();
    expect(denunciaBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('interactive buttons and links receive visible focus', async ({
    page,
  }) => {
    await page.goto('/transparencia');

    const sicopLink = page.getByRole('link', { name: /Consultar en SICOP/ });
    await sicopLink.focus();
    await expect(sicopLink).toBeFocused();

    const denunciaLink = page.getByRole('link', {
      name: /Formulario de Denuncia/,
    });
    await denunciaLink.focus();
    await expect(denunciaLink).toBeFocused();

    const firstDocLink = page
      .getByRole('link', {
        name: new RegExp(`Descargar documento: ${documentItems[0].title}`),
      })
      .first();
    await firstDocLink.focus();
    await expect(firstDocLink).toBeFocused();
  });

  const viewports = [
    { name: 'mobile-small', width: 320, height: 600 },
    { name: 'mobile-medium', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop-compact', width: 1024, height: 768 },
    { name: 'desktop-wide', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`renders without horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const response = await page.goto('/transparencia');
      expect(response?.ok()).toBe(true);

      const overflow = await page.evaluate(() => {
        const root = document.documentElement;
        return {
          scrollWidth: root.scrollWidth,
          clientWidth: root.clientWidth,
          hasHorizontalOverflow: root.scrollWidth > root.clientWidth,
        };
      });

      expect(
        overflow.hasHorizontalOverflow,
        `Page has horizontal overflow at ${vp.width}px: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`,
      ).toBe(false);
    });
  }
});
