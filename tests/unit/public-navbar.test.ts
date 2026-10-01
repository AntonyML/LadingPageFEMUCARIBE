import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import PublicNavbar from '../../src/components/PublicNavbar.astro';

describe('PublicNavbar contract', () => {
  test.each([
    '/',
    '/nosotros',
    '/municipalidades',
    '/proyectos',
    '/transparencia',
    '/noticias',
  ])('marks only the current public page: %s', async (currentPath) => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PublicNavbar, {
      props: { currentPath, platformUrl: 'https://example.org/plataforma' },
    });
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toMatch(
      new RegExp(`href="${currentPath}"[^>]*aria-current="page"`),
    );
    expect(html).toContain('href="https://example.org/plataforma"');
    expect(html).not.toMatch(/<script\b|<header\b/);
  });

  test('unknown page has no false active link and missing platform has no invented href', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PublicNavbar, {
      props: { currentPath: '/desconocido' },
    });
    expect(html).not.toContain('aria-current="page"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toMatch(/href="#"/);
  });

  test.each([
    '',
    '#',
    'javascript:alert(1)',
    'https://',
    ' https://example.org',
  ])('rejects invalid platform destination %s', async (platformUrl) => {
    const container = await AstroContainer.create();
    await expect(
      container.renderToString(PublicNavbar, {
        props: { currentPath: '/', platformUrl },
      }),
    ).rejects.toThrow(/PublicNavbar/);
  });
});
