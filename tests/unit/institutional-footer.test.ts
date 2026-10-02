import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import InstitutionalFooter from '../../src/components/institutional-footer/InstitutionalFooter.astro';

describe('InstitutionalFooter contract', () => {
  test('pending documents have no invented anchors; contacts work without scripts', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(InstitutionalFooter, {
      props: { accessibilityUrl: '/accesibilidad' },
    });
    expect(html).toContain('href="tel:+50627682000"');
    expect(html).toContain('href="mailto:info@femucaribe.go.cr"');
    expect(html).not.toContain('mailto:contacto@femucaribe.go.cr');
    expect(html).toContain('href="/legal"');
    expect(html).toMatch(/<span[^>]*>Política de Privacidad<\/span>/);
    expect(html).toMatch(/<span[^>]*>Estatutos FEMUCARIBE<\/span>/);
    expect(html).not.toMatch(/href="#"/);
  });
  test('consumer supplied documents and privacy become links', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(InstitutionalFooter, {
      props: {
        accessibilityUrl: '/accesibilidad',
        privacyUrl: '/legal#privacidad',
        documentUrls: { statutes: 'https://example.org/estatutos.pdf' },
      },
    });
    expect(html).toContain('href="/legal#privacidad"');
    expect(html).toContain('href="https://example.org/estatutos.pdf"');
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
