export interface FederationProject {
  category: string;
  title: string;
  description: string;
  status: string;
  accentColor: string;
  statusBg: string;
  statusColor: string;
}

export interface FeaturedProject {
  tag: string;
  title: string;
  description: string;
  source: string;
}

const fallbackFederationProjects: readonly FederationProject[] = [
  {
    category: 'Formulación y Ejecución',
    title: 'Unidad Gestora de Proyectos (UGP)',
    description:
      'Estructura técnica especializada de FEMUCARIBE encargada de formular la cartera de proyectos de inversión pública regional, gestionar fuentes de financiamiento y fiscalizar su ejecución conforme a la normativa de contratación pública.',
    status: 'En ejecución',
    accentColor: '#10b981',
    statusBg: 'var(--theme-status-positive-bg)',
    statusColor: 'var(--theme-status-positive-text)',
  },
  {
    category: 'Movilidad Eléctrica y Energía',
    title: 'Electrolinera',
    description:
      'Centro de carga rápida para transporte liviano y comercial en el corredor Atlántico, reduciendo emisiones de carbono e impulsando la descarbonización del sector transporte.',
    status: 'En operación',
    accentColor: '#aac651',
    statusBg: 'var(--theme-status-positive-bg)',
    statusColor: 'var(--theme-status-positive-text)',
  },
  {
    category: 'Innovación y Conocimiento',
    title: 'Parque Tecnológico y Productivo',
    description:
      'Plataforma para incubación de empresas de base tecnológica, transferencia técnica y capacitación orientada a jóvenes de la provincia de Limón.',
    status: 'En formulación',
    accentColor: '#1dc4da',
    statusBg: 'var(--theme-surface-accent)',
    statusColor: 'var(--theme-link)',
  },
  {
    category: 'Gestión Ambiental y Circular',
    title: 'Planta Recicladora',
    description:
      'Infraestructura de valorización de residuos sólidos urbanos con enfoque de economía circular, apoyando a las municipalidades en el cumplimiento de la Ley 8839.',
    status: 'En operación',
    accentColor: '#aac651',
    statusBg: 'var(--theme-status-positive-bg)',
    statusColor: 'var(--theme-status-positive-text)',
  },
];

const fallbackFeaturedProjects: readonly FeaturedProject[] = [
  {
    tag: 'TALAMANCA',
    title: 'Construcción de mojones fronterizos',
    description:
      'Elaboración del perfil y de la matriz de riesgos para un proyecto destinado a mejorar la delimitación y gestión territorial de la zona fronteriza.',
    source: 'Fuente oficial — Municipalidad de Talamanca',
  },
  {
    tag: 'INFRAESTRUCTURA DEPORTIVA',
    title: 'Construcción de estadios Bribri y Sixaola',
    description:
      'FEMUCARIBE, mediante su Unidad Gestora de Proyectos, participó en la elaboración del perfil y la matriz de riesgos para estos proyectos de infraestructura deportiva comunitaria.',
    source: 'Fuente oficial — Municipalidad de Talamanca',
  },
  {
    tag: 'ESTRUCTURA TÉCNICA',
    title: 'Unidad Gestora de Proyectos (UGP)',
    description:
      'Estructura técnica de FEMUCARIBE dedicada a apoyar a las municipalidades en la formulación, gestión, coordinación y seguimiento de proyectos de inversión pública.',
    source: 'Fuente oficial — SICOP',
  },
  {
    tag: 'PLANIFICACIÓN REGIONAL',
    title: 'Programa Interdisciplinario (PICC)',
    description:
      'Programa de FEMUCARIBE orientado a brindar servicios de asesoría y apoyo especializado a las municipalidades para atender sus necesidades de planificación y desarrollo regional.',
    source: 'Estatutos publicados en La Gaceta (Art. 6)',
  },
  {
    tag: 'ASISTENCIA TÉCNICA',
    title: 'Formulación y análisis de proyectos municipales',
    description:
      'FEMUCARIBE brinda apoyo especializado a los equipos técnicos municipales para analizar proyectos, estructurar perfiles y desarrollar instrumentos como matrices de riesgos.',
    source: 'Fuente oficial — Municipalidad de Talamanca',
  },
  {
    tag: 'INVERSIÓN PÚBLICA',
    title: 'Gestión regional de proyectos de inversión pública',
    description:
      'FEMUCARIBE mantiene una estructura de apoyo técnico y administrativo para articular a las municipalidades federadas con instituciones públicas en la gestión y seguimiento de proyectos regionales.',
    source: 'Fuente oficial — SICOP',
  },
];

interface WpProject {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  proj_data?: {
    tag?: string;
    category?: string;
    status?: string;
    source?: string;
    project_type?: string;
    accent_color?: string;
  };
  meta?: {
    tag?: string;
    category?: string;
    status?: string;
    source?: string;
    project_type?: string;
    accent_color?: string;
  };
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

async function fetchRawProjects(): Promise<WpProject[] | null> {
  const CMS_URL =
    'https://cms.femucaribe.go.cr/wp-json/wp/v2/proyectos?per_page=50';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(CMS_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export async function fetchFederationProjects(): Promise<
  readonly FederationProject[]
> {
  const raw = await fetchRawProjects();
  if (!raw || raw.length === 0) return fallbackFederationProjects;

  const federationItems = raw.filter((p) => {
    const type =
      p.proj_data?.project_type || p.meta?.project_type || 'federation';
    return type === 'federation';
  });

  if (federationItems.length === 0) return fallbackFederationProjects;

  return federationItems.map((item) => {
    const meta = item.proj_data || item.meta || {};
    const status = meta.status?.trim() || 'En ejecución';
    const accentColor = meta.accent_color?.trim() || '#10b981';

    let statusBg = 'var(--theme-status-positive-bg)';
    let statusColor = 'var(--theme-status-positive-text)';
    if (status.toLowerCase().includes('formulación')) {
      statusBg = 'var(--theme-surface-accent)';
      statusColor = 'var(--theme-link)';
    }

    return {
      title: cleanHtml(item.title.rendered),
      description: cleanHtml(item.content.rendered),
      category: meta.category?.trim() || 'Inversión Regional',
      status,
      accentColor,
      statusBg,
      statusColor,
    };
  });
}

export async function fetchFeaturedProjects(): Promise<
  readonly FeaturedProject[]
> {
  const raw = await fetchRawProjects();
  if (!raw || raw.length === 0) return fallbackFeaturedProjects;

  const featuredItems = raw.filter((p) => {
    const type = p.proj_data?.project_type || p.meta?.project_type;
    return type === 'featured';
  });

  if (featuredItems.length === 0) return fallbackFeaturedProjects;

  return featuredItems.map((item) => {
    const meta = item.proj_data || item.meta || {};
    return {
      title: cleanHtml(item.title.rendered),
      description: cleanHtml(item.content.rendered),
      tag: meta.tag?.trim() || 'PROYECTO REGIONAL',
      source: meta.source?.trim() || 'Fuente oficial — FEMUCARIBE',
    };
  });
}
