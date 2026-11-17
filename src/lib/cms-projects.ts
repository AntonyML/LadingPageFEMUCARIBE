import { municipalityIds } from './municipalities-repository';

const CMS_PROJECTS_URL =
  'https://cms.femucaribe.go.cr/wp-json/wp/v2/proyectos?per_page=100';

export type MunicipalityId = (typeof municipalityIds)[number];

/**
 * Where a project is published on /proyectos:
 * - federation: "Proyectos Propios de FEMUCARIBE" cards.
 * - featured: "Proyectos Destacados" list.
 * - municipal: only inside its municipality block of
 *   "Proyectos en Coordinación con Gobiernos Locales".
 * Any project linked to municipalities is also listed in their blocks.
 */
export type ProjectType = 'federation' | 'featured' | 'municipal';

export interface Project {
  slug: string;
  type: ProjectType;
  title: string;
  description: string;
  tag: string;
  category: string;
  status: string;
  source: string;
  accentColor: string;
  /** Empty: project owned exclusively by the Federation. */
  municipalityIds: readonly MunicipalityId[];
}

export interface FederationProject extends Project {
  statusBg: string;
  statusColor: string;
}

export interface MunicipalPortfolio {
  municipalityId: MunicipalityId;
  projects: readonly Project[];
}

/** Public anchors shared by /proyectos, /municipalidades and the CMS search API. */
export const projectAnchor = (slug: string) => `proyecto-${slug}`;
export const municipalityProjectsAnchor = (id: MunicipalityId) =>
  `municipalidad-${id}`;

const projectTypes: readonly ProjectType[] = [
  'federation',
  'featured',
  'municipal',
];

function fallbackProject(
  project: Pick<Project, 'slug' | 'type' | 'title' | 'description'> &
    Partial<Project>,
): Project {
  return {
    tag: '',
    category: '',
    status: '',
    source: '',
    accentColor: '',
    municipalityIds: [],
    ...project,
  };
}

function fallbackMunicipalProject(
  municipalityId: MunicipalityId,
  slug: string,
  title: string,
  description: string,
): Project {
  return fallbackProject({
    slug,
    type: 'municipal',
    title,
    description,
    category: 'Cartera técnica municipal',
    status: 'En formulación',
    source: 'Unidad Gestora de Proyectos — FEMUCARIBE',
    municipalityIds: [municipalityId],
  });
}

/** Mirror of the CMS catalog, used only when the CMS is unreachable. */
export const fallbackProjects: readonly Project[] = [
  fallbackProject({
    slug: 'unidad-gestora-de-proyectos-ugp',
    type: 'federation',
    category: 'Formulación y Ejecución',
    title: 'Unidad Gestora de Proyectos (UGP)',
    description:
      'Estructura técnica especializada de FEMUCARIBE encargada de formular la cartera de proyectos de inversión pública regional, gestionar fuentes de financiamiento y fiscalizar su ejecución conforme a la normativa de contratación pública.',
    status: 'En ejecución',
    accentColor: '#10b981',
  }),
  fallbackProject({
    slug: 'electrolinera',
    type: 'federation',
    category: 'Movilidad Eléctrica y Energía',
    title: 'Electrolinera',
    description:
      'Centro de carga rápida para transporte liviano y comercial en el corredor Atlántico, reduciendo emisiones de carbono e impulsando la descarbonización del sector transporte.',
    status: 'En operación',
    accentColor: '#aac651',
  }),
  fallbackProject({
    slug: 'parque-tecnologico-y-productivo',
    type: 'federation',
    category: 'Innovación y Conocimiento',
    title: 'Parque Tecnológico y Productivo',
    description:
      'Plataforma para incubación de empresas de base tecnológica, transferencia técnica y capacitación orientada a jóvenes de la provincia de Limón.',
    status: 'En formulación',
    accentColor: '#1dc4da',
  }),
  fallbackProject({
    slug: 'planta-recicladora',
    type: 'federation',
    category: 'Gestión Ambiental y Circular',
    title: 'Planta Recicladora',
    description:
      'Infraestructura de valorización de residuos sólidos urbanos con enfoque de economía circular, apoyando a las municipalidades en el cumplimiento de la Ley 8839.',
    status: 'En operación',
    accentColor: '#aac651',
  }),
  fallbackProject({
    slug: 'construccion-de-mojones-fronterizos',
    type: 'featured',
    tag: 'TALAMANCA',
    title: 'Construcción de mojones fronterizos',
    description:
      'Elaboración del perfil y de la matriz de riesgos para un proyecto destinado a mejorar la delimitación y gestión territorial de la zona fronteriza.',
    source: 'Fuente oficial — Municipalidad de Talamanca',
    municipalityIds: ['talamanca'],
  }),
  fallbackProject({
    slug: 'construccion-de-estadios-bribri-y-sixaola',
    type: 'featured',
    tag: 'INFRAESTRUCTURA DEPORTIVA',
    title: 'Construcción de estadios Bribri y Sixaola',
    description:
      'FEMUCARIBE, mediante su Unidad Gestora de Proyectos, participó en la elaboración del perfil y la matriz de riesgos para estos proyectos de infraestructura deportiva comunitaria.',
    source: 'Fuente oficial — Municipalidad de Talamanca',
    municipalityIds: ['talamanca'],
  }),
  fallbackProject({
    slug: 'unidad-gestora-de-proyectos-ugp-asistencia-tecnica',
    type: 'featured',
    tag: 'ESTRUCTURA TÉCNICA',
    title: 'Unidad Gestora de Proyectos (UGP)',
    description:
      'Estructura técnica de FEMUCARIBE dedicada a apoyar a las municipalidades en la formulación, gestión, coordinación y seguimiento de proyectos de inversión pública.',
    source: 'Fuente oficial — SICOP',
  }),
  fallbackProject({
    slug: 'programa-interdisciplinario-picc',
    type: 'featured',
    tag: 'PLANIFICACIÓN REGIONAL',
    title: 'Programa Interdisciplinario (PICC)',
    description:
      'Programa de FEMUCARIBE orientado a brindar servicios de asesoría y apoyo especializado a las municipalidades para atender sus necesidades de planificación y desarrollo regional.',
    source: 'Estatutos publicados en La Gaceta (Art. 6)',
  }),
  fallbackProject({
    slug: 'formulacion-y-analisis-de-proyectos-municipales',
    type: 'featured',
    tag: 'ASISTENCIA TÉCNICA',
    title: 'Formulación y análisis de proyectos municipales',
    description:
      'FEMUCARIBE brinda apoyo especializado a los equipos técnicos municipales para analizar proyectos, estructurar perfiles y desarrollar instrumentos como matrices de riesgos.',
    source: 'Fuente oficial — Municipalidad de Talamanca',
  }),
  fallbackProject({
    slug: 'gestion-regional-de-proyectos-de-inversion-publica',
    type: 'featured',
    tag: 'INVERSIÓN PÚBLICA',
    title: 'Gestión regional de proyectos de inversión pública',
    description:
      'FEMUCARIBE mantiene una estructura de apoyo técnico y administrativo para articular a las municipalidades federadas con instituciones públicas en la gestión y seguimiento de proyectos regionales.',
    source: 'Fuente oficial — SICOP',
  }),
  fallbackMunicipalProject(
    'limon',
    'plan-regulador-costero-zmt-limon',
    'Plan Regulador Costero (PRC ZMT Limón – FEMUCARIBE)',
    'Ordenamiento territorial y reactivación técnica en la Zona Marítimo Terrestre para otorgar certeza jurídica e impulsar la inversión turística sostenible.',
  ),
  fallbackMunicipalProject(
    'limon',
    'intervencion-integral-vial-red-cantonal-limon',
    'Intervención Integral Vial Red Cantonal de Limón',
    'Asistencia técnica de la UGP para formulación, bacheo y rehabilitación de caminos cantonales críticos en coordinación con MOPT-CONAVI.',
  ),
  fallbackMunicipalProject(
    'limon',
    'complejo-deportivo-pista-atletica-corales-2',
    'Complejo Deportivo y Pista Atlética Corales 2',
    'Diseño de anteproyecto y planos ejecutivos para complejo recreativo comunal en convenio conjunto con ICODER.',
  ),
  fallbackMunicipalProject(
    'matina',
    'plan-cantonal-mitigacion-hidraulica-matina',
    'Plan Cantonal de Mitigación Hidráulica e Inundaciones',
    'Identificación y priorización de puntos vulnerables en cauces y pasos de agua en caminos de producción bananera y cacaotera.',
  ),
  fallbackMunicipalProject(
    'matina',
    'cartera-puentes-alcantarillado-comunal-matina',
    'Cartera de Puentes y Alcantarillado Comunal',
    'Asistencia técnica para formulación de carpetas de inversión y gestión de financiamiento extraordinario para caminos rurales.',
  ),
  fallbackMunicipalProject(
    'guacimo',
    'obras-comunales-llave-en-mano-guacimo',
    'Obras Comunales Llave en Mano',
    'Formulación de paquetes de infraestructura barrial, drenajes pluviales y aceras accesibles en distritos prioritarios del cantón.',
  ),
  fallbackMunicipalProject(
    'guacimo',
    'soporte-tecnico-licitaciones-guacimo',
    'Soporte Técnico a Licitaciones SIOP y Demanda Mayor',
    'Asesoría de la UGP en estructuración de carteles de contratación pública y fiscalización técnica de obra vial cantonal.',
  ),
  fallbackMunicipalProject(
    'pococi',
    'centro-estrategico-desarrollo-cantonal-pococi',
    'Centro Estratégico de Desarrollo Cantonal (CED Pococí)',
    'Formulación de perfil y requerimientos técnicos preliminares para polo de innovación y fomento empresarial cantonal.',
  ),
  fallbackMunicipalProject(
    'pococi',
    'modernizacion-centro-agricola-cantonal-pococi',
    'Modernización y Apoyo al Centro Agrícola Cantonal',
    'Diagnóstico y asistencia técnica para encadenamientos productivos y valor agregado a pequeños productores de la zona.',
  ),
  fallbackMunicipalProject(
    'parrita',
    'asistencia-tecnica-iniciativas-comunales-parrita',
    'Asistencia Técnica para Iniciativas Comunales (Convenio DINADECO - FEMUCARIBE)',
    'Acompañamiento a asociaciones de desarrollo del cantón para estructurar iniciativas de infraestructura social y comunitaria.',
  ),
  fallbackMunicipalProject(
    'parrita',
    'formulacion-cartera-tecnica-cantonal-parrita',
    'Formulación de Cartera Técnica Cantonal',
    'Estructuración del banco cantonal de proyectos de inversión pública y asesoría en contratación administrativa mancomunada.',
  ),
];

const htmlEntities: Readonly<Record<string, string>> = {
  '&#8211;': '–',
  '&#8212;': '—',
  '&#8216;': '‘',
  '&#8217;': '’',
  '&#8220;': '“',
  '&#8221;': '”',
  '&quot;': '"',
  '&#039;': "'",
  '&nbsp;': ' ',
  '&amp;': '&',
};

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(
      /&#8211;|&#8212;|&#8216;|&#8217;|&#8220;|&#8221;|&quot;|&#039;|&nbsp;|&amp;/g,
      (entity) => htmlEntities[entity] ?? entity,
    )
    .trim();
}

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

function isMunicipalityId(value: string): value is MunicipalityId {
  return (municipalityIds as readonly string[]).includes(value);
}

function isProjectType(value: string): value is ProjectType {
  return (projectTypes as readonly string[]).includes(value);
}

function parseProject(item: unknown): Project | null {
  const raw = record(item);
  const slug = text(raw.slug);
  const title = cleanHtml(text(record(raw.title).rendered));
  if (!slug || !title) return null;

  // proj_data is the curated field; meta is the raw WordPress fallback.
  const meta = { ...record(raw.meta), ...record(raw.proj_data) };
  const type = text(meta.project_type);
  const linked = Array.isArray(raw.municipalidades) ? raw.municipalidades : [];
  const ids = linked
    .map((municipality) => text(record(municipality).canton_id).toLowerCase())
    .filter(isMunicipalityId);

  return {
    slug,
    type: isProjectType(type) ? type : 'federation',
    title,
    description: cleanHtml(text(record(raw.content).rendered)),
    tag: text(meta.tag),
    category: text(meta.category),
    status: text(meta.status),
    source: text(meta.source),
    accentColor: text(meta.accent_color),
    municipalityIds: [...new Set(ids)],
  };
}

/** Normalizes the /wp/v2/proyectos payload; invalid entries are dropped. */
export function parseProjects(payload: unknown): Project[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .map(parseProject)
    .filter((project): project is Project => project !== null);
}

let cache: Promise<readonly Project[]> | undefined;

async function fetchCatalog(): Promise<readonly Project[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(`${CMS_PROJECTS_URL}&_ts=${Date.now()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      console.warn(`[CMS] proyectos HTTP ${response.status}. Using fallback.`);
      return fallbackProjects;
    }
    const projects = parseProjects(await response.json());
    return projects.length > 0 ? projects : fallbackProjects;
  } catch (err) {
    console.warn(
      `[CMS] proyectos fallback: ${err instanceof Error ? err.message : String(err)}`,
    );
    return fallbackProjects;
  }
}

/** Project catalog, fetched once per build. */
export function getProjects(): Promise<readonly Project[]> {
  cache ??= fetchCatalog();
  return cache;
}

function statusTone(
  status: string,
): Pick<FederationProject, 'statusBg' | 'statusColor'> {
  return status.toLowerCase().includes('formulación')
    ? {
        statusBg: 'var(--theme-surface-accent)',
        statusColor: 'var(--theme-link)',
      }
    : {
        statusBg: 'var(--theme-status-positive-bg)',
        statusColor: 'var(--theme-status-positive-text)',
      };
}

export function selectFederationProjects(
  projects: readonly Project[],
): FederationProject[] {
  return projects
    .filter(({ type }) => type === 'federation')
    .map((project) => {
      const status = project.status || 'En ejecución';
      return {
        ...project,
        status,
        category: project.category || 'Inversión Regional',
        accentColor: project.accentColor || '#10b981',
        ...statusTone(status),
      };
    });
}

export function selectFeaturedProjects(
  projects: readonly Project[],
): Project[] {
  return projects
    .filter(({ type }) => type === 'featured')
    .map((project) => ({
      ...project,
      tag: project.tag || 'PROYECTO REGIONAL',
      source: project.source || 'Fuente oficial — FEMUCARIBE',
    }));
}

/** Every municipality, in the given order, with the projects linked to it. */
export function groupProjectsByMunicipality(
  projects: readonly Project[],
  order: readonly MunicipalityId[] = municipalityIds,
): MunicipalPortfolio[] {
  return order.map((municipalityId) => ({
    municipalityId,
    projects: projects.filter((project) =>
      project.municipalityIds.includes(municipalityId),
    ),
  }));
}

export async function fetchFederationProjects(): Promise<FederationProject[]> {
  return selectFederationProjects(await getProjects());
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  return selectFeaturedProjects(await getProjects());
}

export async function fetchMunicipalPortfolios(
  order?: readonly MunicipalityId[],
): Promise<MunicipalPortfolio[]> {
  return groupProjectsByMunicipality(await getProjects(), order);
}
