import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import InstitutionalFooter from '../../src/components/institutional-footer/InstitutionalFooter.astro';

describe('InstitutionalFooter contract', () => {
  test('renders official transparency documents without invented anchors; contacts work without scripts', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(InstitutionalFooter, {
      props: { accessibilityUrl: '/accesibilidad' },
    });
    expect(html).toContain('href="tel:+50627682000"');
    expect(html).toContain('href="mailto:info@femucaribe.go.cr"');
    expect(html).not.toContain('mailto:contacto@femucaribe.go.cr');
    expect(html).toContain('href="/legal"');
    expect(html).toMatch(/<span[^>]*>Política de Privacidad<\/span>/);
    expect(html).toContain('Informe Técnico del Presupuesto Ordinario 2026');
    expect(html).not.toMatch(/href="#"/);
  });

  test('consumer supplied documents and privacy become links', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(InstitutionalFooter, {
      props: {
        accessibilityUrl: '/accesibilidad',
        privacyUrl: '/privacidad',
        documents: [
          {
            id: 'doc-test',
            title: 'Convenio Marco de Cooperación',
            tag: 'CONVENIOS',
            meta: 'PDF Oficial',
            url: 'https://example.org/convenio.pdf',
          },
        ],
      },
    });
    expect(html).toContain('href="/privacidad"');
    expect(html).toContain('href="https://example.org/convenio.pdf"');
    expect(html).toContain('Convenio Marco de Cooperación');
  });

  test('renders span when document has no URL', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(InstitutionalFooter, {
      props: {
        accessibilityUrl: '/accesibilidad',
        documents: [
          {
            id: 'doc-custodia',
            title: 'Documento en Custodia Institucional',
            tag: 'CUSTODIA',
            meta: 'En archivo',
          },
        ],
      },
    });
    expect(html).toMatch(
      /<span[^>]*>Documento en Custodia Institucional<\/span>/,
    );
  });

  test.each([
    '',
    '#',
    '//example.org',
    'javascript:alert(1)',
    'https://',
    ' /privacidad',
    '/bad\\path',
  ])('rejects unsafe destinations %s', async (privacyUrl) => {
    const container = await AstroContainer.create();
    await expect(
      container.renderToString(InstitutionalFooter, {
        props: { accessibilityUrl: '/accesibilidad', privacyUrl },
      }),
    ).rejects.toThrow(/InstitutionalFooter/);
  });
});
