import { expect, test, type Page } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const expectedAuthorities = [
  {
    slug: 'presidente',
    organTag: '01 · ÓRGANO DE GOBIERNO',
    roleTitle: 'Presidente',
    personName: 'Jordan Chaves Chaves',
    unitSubtitle: 'Presidencia del Consejo Intermunicipal',
    email: 'presidencia@femucaribe.go.cr',
    description:
      'Ostenta la representación protocolaria de la Federación. Convoca, preside y modera las sesiones del Consejo Intermunicipal, fija el orden del día y firma las actas oficiales.',
    statutesRef: 'Arts. 12 y 13 — Estatutos Orgánicos',
  },
  {
    slug: 'vicepresidenta',
    organTag: '02 · ÓRGANO DE GOBIERNO',
    roleTitle: 'Vicepresidenta',
    personName: 'Verónica Ugalde Torres',
    unitSubtitle: 'Vicepresidencia del Consejo Intermunicipal',
    email: 'info@femucaribe.go.cr',
    description:
      'Sustituye al Presidente en ausencias temporales o enfermedad. Asume la Presidencia en funciones con plenas facultades estatutarias ante cese o vacancia institucional.',
    statutesRef: 'Arts. 12 y 13 — Estatutos Orgánicos',
  },
  {
    slug: 'direccion',
    organTag: '03 · ÓRGANO EJECUTIVO',
    roleTitle: 'Directora Ejecutiva',
    personName: 'Viviana Badilla López',
    unitSubtitle: 'Dirección Ejecutiva Institucional',
    email: 'direccionejecutiva@femucaribe.go.cr',
    description:
      'Máxima jefatura operativa. Formula el Plan Anual de Acción (PICC, obras y presupuesto), ejerce la jefatura de personal y ejecuta los acuerdos del Consejo.',
    statutesRef: 'Arts. 15 y 16 — Estatutos Orgánicos',
  },
  {
    slug: 'secretaria',
    organTag: '04 · ÓRGANO DE GESTIÓN',
    roleTitle: 'Secretaria Consejo Intermunicipal',
    personName: 'Marlene Jiménez Pérez',
    unitSubtitle: 'Secretaría de Actas y Acuerdos',
    email: 'consejointermunicipal@femucaribe.go.cr',
    description:
      'Levanta y custodia las actas oficiales de asamblea y consejo, transcribe y notifica los acuerdos tomados, extiende certificaciones y da fe pública.',
    statutesRef: 'Arts. 14 y 20 — Estatutos Orgánicos',
  },
] as const;

function organicStructureSection(page: Page) {
  return page.getByRole('region', {
    name: 'Consejo Directivo y Dirección Ejecutiva',
    exact: true,
  });
}

async function expectOrganicStructureContent(page: Page) {
  const section = organicStructureSection(page);
  await expect(section).toBeVisible();
  await expect(
    section.getByText('GOBIERNO Y DIRECCIÓN EJECUTIVA'),
  ).toBeVisible();
  await expect(
    section.getByRole('heading', {
      level: 2,
      name: 'Consejo Directivo y Dirección Ejecutiva',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    section.getByText('AUTORIDADES ESTATUTARIAS (ARTS. 12-16)'),
  ).toBeVisible();

  const items = section.getByRole('listitem');
  await expect(items).toHaveCount(expectedAuthorities.length);

  for (const [index, authority] of expectedAuthorities.entries()) {
    const item = items.nth(index);
    await expect(item).toHaveAttribute('data-authority', authority.slug);
    await expect(
      item.getByText(authority.organTag, { exact: true }),
    ).toBeVisible();
    await expect(
      item.getByRole('heading', {
        level: 3,
        name: authority.roleTitle,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      item.getByText(authority.personName, { exact: true }),
    ).toBeVisible();
    await expect(
      item.getByText(authority.unitSubtitle, { exact: true }),
    ).toBeVisible();
    const mailLink = item.getByRole('link', {
      name: authority.email,
      exact: true,
    });
    await expect(mailLink).toBeVisible();
    await expect(mailLink).toHaveAttribute('href', `mailto:${authority.email}`);
    await expect(item.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(
      item.getByText(authority.description, { exact: true }),
    ).toBeVisible();
    await expect(
      item.getByText(authority.statutesRef, { exact: true }),
    ).toBeVisible();
  }
}

async function expectOrganicStructureReflow(page: Page, width: number) {
  await expectOrganicStructureContent(page);
  const section = organicStructureSection(page);
  const bounds = await section
    .locator(
      '.overline, .title, .subtitle, .card, .organ-tag, .role-title, .person-name, .unit-subtitle, .contact-link, .card-desc, .statutes-ref',
    )
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          overflow: node.scrollWidth - node.clientWidth,
        };
      }),
    );
  expect(bounds.length).toBeGreaterThan(0);
  for (const bound of bounds) {
    expect(bound.left).toBeGreaterThanOrEqual(0);
    expect(bound.right).toBeLessThanOrEqual(width + 1);
    expect(bound.overflow).toBeLessThanOrEqual(1);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width);
}

test('renders 4 statutory authorities above Strategic Objectives on /nosotros without JavaScript', async ({
  page,
}) => {
  const response = await page.goto('/nosotros');
  expect(response?.ok()).toBe(true);
  await expectOrganicStructureContent(page);

  const order = await page.evaluate(() => {
    const organic = document.querySelector('.about-organic-structure');
    const objectives = document.querySelector('.about-strategic-objectives');
    if (!organic || !objectives) return null;
    return (
      organic.getBoundingClientRect().top <
      objectives.getBoundingClientRect().top
    );
  });
  expect(order).toBe(true);
});

test('supports keyboard focus on authority email links with >= 44px touch targets', async ({
  page,
}) => {
  await page.goto('/nosotros');
  const section = organicStructureSection(page);
  for (const authority of expectedAuthorities) {
    const link = section.getByRole('link', {
      name: authority.email,
      exact: true,
    });
    await link.focus();
    await expect(link).toBeFocused();
    const box = await link.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

for (const width of [
  280, 320, 360, 480, 767, 768, 1024, 1199, 1200, 1280, 1440,
]) {
  test(`maintains reflow and readable authority cards at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/nosotros');
    await expectOrganicStructureReflow(page, width);
    const columns = await page
      .locator('.about-organic-structure .cards-list')
      .evaluate(
        (node) => getComputedStyle(node).gridTemplateColumns.split(' ').length,
      );
    if (width >= 1200) {
      expect(columns).toBe(4);
    } else if (width >= 820) {
      expect(columns).toBe(2);
    } else if (width <= 768) {
      expect(columns).toBe(1);
    }
  });
}

test('maintains reflow in landscape mode (844x390)', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/nosotros');
  await expectOrganicStructureReflow(page, 844);
});

for (const width of [320, 768, 1440]) {
  test(`adapts to 200% text zoom at ${width}px without horizontal scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/nosotros');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });
    await expectOrganicStructureReflow(page, width);
  });
}
