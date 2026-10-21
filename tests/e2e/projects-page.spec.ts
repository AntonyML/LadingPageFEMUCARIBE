import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const federationProjects = [
  'Unidad Gestora de Proyectos (UGP)',
  'Electrolinera',
  'Parque Tecnológico y Productivo',
  'Planta Recicladora',
] as const;

const featuredProjects = [
  {
    tag: 'TALAMANCA',
    title: 'Construcción de mojones fronterizos',
  },
  {
    tag: 'INFRAESTRUCTURA DEPORTIVA',
    title: 'Construcción de estadios Bribri y Sixaola',
  },
  {
    tag: 'ESTRUCTURA TÉCNICA',
    title: 'Unidad Gestora de Proyectos (UGP)',
  },
  {
    tag: 'PLANIFICACIÓN REGIONAL',
    title: 'Programa Interdisciplinario (PICC)',
  },
  {
    tag: 'ASISTENCIA TÉCNICA',
    title: 'Formulación y análisis de proyectos municipales',
  },
  {
    tag: 'INVERSIÓN PÚBLICA',
    title: 'Gestión regional de proyectos de inversión pública',
  },
] as const;

const pipelineMunicipalities = [
  'Municipalidad de Limón',
  'Municipalidad de Matina',
  'Municipalidad de Guácimo',
  'Municipalidad de Pococí',
  'Municipalidad de Parrita',
] as const;

test.describe('Página de Proyectos (/proyectos)', () => {
  test('renders complete projects page with semantic structure without JavaScript', async ({
    page,
  }) => {
    const response = await page.goto('/proyectos');
    expect(response?.ok()).toBe(true);

    await expect(page).toHaveTitle('Proyectos | FEMUCARIBE');
    await expect(
      page.getByRole('link', { name: 'Proyectos', exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    // Header section
    await expect(
      page.getByText('CARTERA DE INVERSIÓN PÚBLICA Y DESARROLLO REGIONAL'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Proyectos Institucionales de la Federación',
      }),
    ).toBeVisible();

    // Proyectos Propios de FEMUCARIBE
    const fedSection = page.getByRole('region', {
      name: 'Proyectos Propios de FEMUCARIBE',
    });
    await expect(fedSection).toBeVisible();
    for (const title of federationProjects) {
      await expect(
        fedSection.getByRole('heading', { level: 3, name: title }),
      ).toBeVisible();
    }

    // CTA Contacto
    const ctaAside = page.getByRole('complementary', {
      name: 'Coordinación con la UGP',
    });
    await expect(ctaAside).toBeVisible();
    const ctaLink = ctaAside.getByRole('link', { name: 'Contáctenos' });
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toHaveAttribute('href', '/contacto');

    // Proyectos Destacados
    const featSection = page.getByRole('region', {
      name: 'Proyectos Destacados',
    });
    await expect(featSection).toBeVisible();
    for (const { tag, title } of featuredProjects) {
      await expect(featSection.getByText(tag, { exact: true })).toBeVisible();
      await expect(
        featSection.getByRole('heading', { level: 3, name: title }),
      ).toBeVisible();
    }

    // Proyectos en Coordinación con Gobiernos Locales
    const coordSection = page.getByRole('region', {
      name: 'Proyectos en Coordinación con Gobiernos Locales',
    });
    await expect(coordSection).toBeVisible();
    await expect(
      coordSection.getByRole('heading', {
        level: 3,
        name: 'Municipalidad de Talamanca · 2 proyectos en gestión activa',
      }),
    ).toBeVisible();
    await expect(
      coordSection.getByRole('heading', {
        level: 4,
        name: '1. Mojones Fronterizos Costa Rica – Panamá (Sixaola)',
      }),
    ).toBeVisible();
    await expect(
      coordSection.getByRole('heading', {
        level: 4,
        name: '2. Infraestructura Deportiva y Recreativa (Bribri)',
      }),
    ).toBeVisible();

    for (const muni of pipelineMunicipalities) {
      await expect(
        coordSection.getByRole('heading', { level: 3, name: muni }),
      ).toBeVisible();
    }

    // Marco Estatutario
    const statutorySection = page.getByRole('region', {
      name: 'Marco Estatutario de Ejecución y Planificación Regional',
    });
    await expect(statutorySection).toBeVisible();
    await expect(
      statutorySection.getByText(/Art\. 6 de los Estatutos publicados/),
    ).toBeVisible();
    await expect(statutorySection.getByText('Art. 6 Estatutos')).toBeVisible();
  });

  test('CTA button receives visible keyboard focus', async ({ page }) => {
    await page.goto('/proyectos');
    const ctaLink = page
      .getByRole('complementary', { name: 'Coordinación con la UGP' })
      .getByRole('link', { name: 'Contáctenos' });

    await ctaLink.focus();
    await expect(ctaLink).toBeFocused();
    const outline = await ctaLink.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        style: style.outlineStyle,
        width: parseFloat(style.outlineWidth),
      };
    });
    expect(outline.style).toBe('solid');
    expect(outline.width).toBeGreaterThanOrEqual(2);
  });

  const viewports = [
    { width: 320, height: 600, label: 'mobile-small' },
    { width: 375, height: 667, label: 'mobile-medium' },
    { width: 768, height: 1024, label: 'tablet' },
    { width: 1024, height: 768, label: 'desktop-compact' },
    { width: 1440, height: 900, label: 'desktop-wide' },
  ];

  for (const { width, height, label } of viewports) {
    test(`renders without horizontal overflow at ${label} (${width}x${height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/proyectos');

      const overflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });
      expect(overflow).toBe(false);
    });
  }
});
