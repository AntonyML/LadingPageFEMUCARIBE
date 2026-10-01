import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import GovernmentBar from '../../src/components/GovernmentBar.astro';

const destinations = {
  accessibility: '/accesibilidad',
  serviceComptroller: '/contraloria',
  law7600: 'https://example.org/ley',
};

describe('GovernmentBar consumer contract', () => {
  test('uses supplied destinations and target without inventing URLs or scripts', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(GovernmentBar, {
      props: { contentId: 'contenido', destinations },
    });
    for (const href of ['#contenido', ...Object.values(destinations)]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).toContain('aria-label="Enlaces institucionales"');
    expect(html).not.toMatch(/<script\b|role="banner"|<header\b/);
  });

  test.each([
    {},
    { accessibility: '/a' },
    { ...destinations, law7600: '#' },
    { ...destinations, accessibility: 'javascript:alert(1)' },
  ])('rejects missing or unusable destinations: %j', async (links) => {
    const container = await AstroContainer.create();
    await expect(
      container.renderToString(GovernmentBar, {
        props: { contentId: 'contenido', destinations: links },
      }),
    ).rejects.toThrow(/GovernmentBar/);
  });

  test.each(['', 'invalid target', '#contenido'])(
    'rejects invalid skip target %j',
    async (contentId) => {
      const container = await AstroContainer.create();
      await expect(
        container.renderToString(GovernmentBar, {
          props: { contentId, destinations },
        }),
      ).rejects.toThrow(/contentId/);
    },
  );
});
