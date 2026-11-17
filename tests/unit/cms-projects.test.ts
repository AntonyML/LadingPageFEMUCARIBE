import { describe, expect, it } from 'vitest';
import {
  fallbackProjects,
  groupProjectsByMunicipality,
  parseProjects,
  selectFeaturedProjects,
  selectFederationProjects,
  type Project,
} from '../../src/lib/cms-projects';
import { municipalityIds } from '../../src/lib/municipalities-repository';

const wpProject = (overrides: Record<string, unknown> = {}) => ({
  id: 29,
  slug: 'construccion-de-mojones-fronterizos',
  title: { rendered: 'Construcción de mojones &#8211; Sixaola' },
  content: { rendered: '<p>Perfil y matriz de riesgos.</p>\n' },
  proj_data: {
    tag: 'TALAMANCA',
    category: '',
    status: 'En ejecución',
    source: 'Fuente oficial — Municipalidad de Talamanca',
    project_type: 'featured',
    accent_color: '',
  },
  municipalidades: [
    { id: 63, canton_id: 'talamanca', nombre: 'Municipalidad de Talamanca' },
  ],
  ...overrides,
});

const project = (overrides: Partial<Project>): Project => ({
  slug: 'proyecto',
  type: 'federation',
  title: 'Proyecto',
  description: '',
  tag: '',
  category: '',
  status: '',
  source: '',
  accentColor: '',
  municipalityIds: [],
  ...overrides,
});

describe('parseProjects', () => {
  it('normalizes the WordPress payload and its municipality links', () => {
    const [parsed] = parseProjects([wpProject()]);
    expect(parsed).toEqual({
      slug: 'construccion-de-mojones-fronterizos',
      type: 'featured',
      title: 'Construcción de mojones – Sixaola',
      description: 'Perfil y matriz de riesgos.',
      tag: 'TALAMANCA',
      category: '',
      status: 'En ejecución',
      source: 'Fuente oficial — Municipalidad de Talamanca',
      accentColor: '',
      municipalityIds: ['talamanca'],
    });
  });

  it('treats projects without links as Federation projects', () => {
    const [parsed] = parseProjects([wpProject({ municipalidades: undefined })]);
    expect(parsed?.municipalityIds).toEqual([]);
  });

  it('ignores unknown or duplicated municipalities', () => {
    const [parsed] = parseProjects([
      wpProject({
        municipalidades: [
          { canton_id: 'TALAMANCA' },
          { canton_id: 'talamanca' },
          { canton_id: 'siquirres' },
          null,
        ],
      }),
    ]);
    expect(parsed?.municipalityIds).toEqual(['talamanca']);
  });

  it('falls back to meta and defaults unknown types to federation', () => {
    const [parsed] = parseProjects([
      wpProject({
        proj_data: undefined,
        meta: { project_type: 'otro', category: 'Energía' },
      }),
    ]);
    expect(parsed?.type).toBe('federation');
    expect(parsed?.category).toBe('Energía');
  });

  it('drops entries without slug or title and malformed payloads', () => {
    expect(
      parseProjects([wpProject({ slug: '' }), { title: 'x' }, 'x']),
    ).toEqual([]);
    expect(parseProjects({ code: 'rest_no_route' })).toEqual([]);
  });
});

describe('project selectors', () => {
  const catalog = [
    project({ slug: 'ugp', type: 'federation', status: 'En formulación' }),
    project({
      slug: 'mojones',
      type: 'featured',
      municipalityIds: ['talamanca'],
    }),
    project({ slug: 'prc', type: 'municipal', municipalityIds: ['limon'] }),
    project({
      slug: 'compartido',
      type: 'municipal',
      municipalityIds: ['limon', 'talamanca'],
    }),
  ];

  it('keeps each section limited to its project type', () => {
    expect(selectFederationProjects(catalog).map(({ slug }) => slug)).toEqual([
      'ugp',
    ]);
    expect(selectFeaturedProjects(catalog).map(({ slug }) => slug)).toEqual([
      'mojones',
    ]);
  });

  it('applies presentation defaults', () => {
    const [federation] = selectFederationProjects(catalog);
    expect(federation).toMatchObject({
      category: 'Inversión Regional',
      accentColor: '#10b981',
      statusColor: 'var(--theme-link)',
    });
    const [featured] = selectFeaturedProjects(catalog);
    expect(featured).toMatchObject({
      tag: 'PROYECTO REGIONAL',
      source: 'Fuente oficial — FEMUCARIBE',
    });
  });

  it('lists every municipality, including those without projects', () => {
    const groups = groupProjectsByMunicipality(catalog);
    expect(groups.map(({ municipalityId }) => municipalityId)).toEqual([
      ...municipalityIds,
    ]);
    const bySlug = Object.fromEntries(
      groups.map(({ municipalityId, projects }) => [
        municipalityId,
        projects.map(({ slug }) => slug),
      ]),
    );
    expect(bySlug.talamanca).toEqual(['mojones', 'compartido']);
    expect(bySlug.limon).toEqual(['prc', 'compartido']);
    expect(bySlug.matina).toEqual([]);
  });

  it('respects the requested municipality order', () => {
    expect(
      groupProjectsByMunicipality(catalog, ['talamanca', 'limon']).map(
        ({ municipalityId }) => municipalityId,
      ),
    ).toEqual(['talamanca', 'limon']);
  });
});

describe('fallbackProjects', () => {
  it('has unique slugs and gives every municipality a portfolio', () => {
    const slugs = fallbackProjects.map(({ slug }) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const { projects } of groupProjectsByMunicipality(fallbackProjects)) {
      expect(projects.length).toBeGreaterThan(0);
    }
  });

  it('only publishes municipal projects that are linked', () => {
    for (const item of fallbackProjects) {
      if (item.type === 'municipal') {
        expect(item.municipalityIds.length).toBeGreaterThan(0);
      }
    }
  });
});
