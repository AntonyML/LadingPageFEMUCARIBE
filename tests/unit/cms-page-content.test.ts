import { describe, expect, it } from 'vitest';
import { parsePageContent } from '../../src/lib/cms-page-content';

describe('parsePageContent', () => {
  it('keeps non-empty strings and drops invalid values', () => {
    const result = parsePageContent({
      inicio: { hero_title: '  Hola  ', hero_eyebrow: '', extra: 3 },
      noticias: [],
    });
    expect(result).toEqual({ inicio: { hero_title: 'Hola' } });
  });

  it('masks CMS upload URLs behind the media proxy', () => {
    const result = parsePageContent({
      nosotros: {
        image:
          'https://cms.femucaribe.go.cr/wp-content/uploads/2026/10/sede.jpg',
      },
    });
    expect(result.nosotros?.image).toBe('/media/2026/10/sede.jpg');
  });

  it('returns an empty object for malformed payloads', () => {
    expect(parsePageContent(null)).toEqual({});
    expect(parsePageContent([])).toEqual({});
  });
});
