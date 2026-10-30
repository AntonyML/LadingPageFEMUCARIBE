export interface DocumentItem {
  id: string;
  tag: string;
  title: string;
  meta: string;
  url?: string | undefined;
}

const fallbackDocuments: readonly DocumentItem[] = [
  {
    id: 'doc-presupuesto-ordinario-2026',
    tag: 'PRESUPUESTO · Ejercicio 2026',
    title: 'Informe Técnico del Presupuesto Ordinario 2026',
    meta: 'PDF Oficial · 806 KB',
    url: 'https://cms.femucaribe.go.cr/wp-content/uploads/2026/10/informe-presupuesto-ordinario-2026.pdf',
  },
  {
    id: 'doc-liquidacion-presupuestaria-2025',
    tag: 'LIQUIDACIÓN · Periodo 2025',
    title: 'Liquidación Presupuestaria Auditada 2025',
    meta: 'PDF Oficial · 381 KB',
    url: 'https://cms.femucaribe.go.cr/wp-content/uploads/2026/10/liquidacion-presupuestaria-2025.pdf',
  },
  {
    id: 'doc-plan-anual-operativo-2026',
    tag: 'PLANIFICACIÓN · Periodo 2026',
    title: 'Plan Anual Operativo (PAO) 2026 – Dirección y Gestión',
    meta: 'PDF Oficial · 397 KB',
    url: 'https://cms.femucaribe.go.cr/wp-content/uploads/2026/10/plan-anual-operativo-2026.pdf',
  },
  {
    id: 'doc-estado-situacion-financiera-2025',
    tag: 'FINANZAS · Periodo 2025',
    title: 'Estado de Situación Financiera Auditado a Diciembre 2025',
    meta: 'PDF Oficial · 257 KB',
    url: 'https://cms.femucaribe.go.cr/wp-content/uploads/2026/10/estado-situacion-financiera-2025.pdf',
  },
  {
    id: 'doc-acta-asamblea-general-01-2026',
    tag: 'ACTAS · Ejercicio 2026',
    title: 'Acta de Asamblea General Ordinaria N.º 01-2026',
    meta: 'PDF Oficial · 394 KB',
    url: 'https://cms.femucaribe.go.cr/wp-content/uploads/2026/10/acta-asamblea-general-01-2026.pdf',
  },
  {
    id: 'doc-acta-sesion-extraordinaria-01-2026',
    tag: 'ACTAS · Periodo 2026',
    title: 'Acta de Sesión Extraordinaria N.º 01-2026 del Consejo Intermunicipal',
    meta: 'PDF Oficial · 752 KB',
    url: 'https://cms.femucaribe.go.cr/wp-content/uploads/2026/10/acta-sesion-extraordinaria-01-2026.pdf',
  },
  {
    id: 'doc-estatutos-vigentes-gaceta-175',
    tag: 'NORMATIVA · La Gaceta N.º 175',
    title: 'Estatutos Vigentes de FEMUCARIBE (Diario Oficial La Gaceta N.º 175)',
    meta: 'PDF Oficial · 198 KB',
    url: 'https://cms.femucaribe.go.cr/wp-content/uploads/2026/10/estatutos-oficiales-gaceta-175.pdf',
  },
  {
    id: 'doc-convenio-marco-dinadeco-2026',
    tag: 'CONVENIOS · Ejercicio 2026',
    title: 'Convenio Marco de Cooperación DINADECO – FEMUCARIBE 2026',
    meta: 'PDF Oficial · 714 KB',
    url: 'https://cms.femucaribe.go.cr/wp-content/uploads/2026/10/convenio-marco-dinadeco-femucaribe-2026.pdf',
  },
];

interface WpDocumento {
  id: number;
  slug: string;
  title: { rendered: string };
  doc_data?: {
    archivo_url?: string;
    archivo_tag?: string;
    archivo_meta?: string;
    categoria_doc?: string;
  };
  meta?: {
    archivo_url?: string;
    archivo_tag?: string;
    archivo_meta?: string;
    categoria_doc?: string;
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

export async function fetchTransparencyDocuments(): Promise<
  readonly DocumentItem[]
> {
  const CMS_URL = `https://cms.femucaribe.go.cr/wp-json/wp/v2/documentos?per_page=50&nocache=1&_ts=${Date.now()}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(CMS_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store',
        Pragma: 'no-cache',
      },
    });
    clearTimeout(timeoutId);
    if (!response.ok) return fallbackDocuments;
    const items: WpDocumento[] = await response.json();
    if (!Array.isArray(items) || items.length === 0) return fallbackDocuments;

    // Ordenar por ID ascendente para presentar cronológicamente/estructuradamente los documentos
    const sorted = [...items].sort((a, b) => a.id - b.id);

    return sorted.map((doc, idx) => {
      const data = doc.doc_data || doc.meta || {};
      const fallback = fallbackDocuments[idx] ?? fallbackDocuments[0];
      const rawUrl = data.archivo_url?.trim();
      const url = rawUrl && rawUrl !== '#' ? rawUrl : (fallback?.url ?? '#');
      return {
        id: doc.slug || `doc-${doc.id}`,
        title: cleanHtml(doc.title.rendered),
        tag:
          data.archivo_tag?.trim() ||
          (fallback ? fallback.tag : 'DOCUMENTO OFICIAL'),
        meta:
          data.archivo_meta?.trim() ||
          (fallback ? fallback.meta : 'PDF Oficial'),
        ...(url ? { url } : {}),
      };
    });
  } catch (err) {
    console.warn(
      `[CMS] Fallback to local documents: ${err instanceof Error ? err.message : String(err)}`,
    );
    return fallbackDocuments;
  }
}
