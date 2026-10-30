export interface DocumentItem {
  id: string;
  tag: string;
  title: string;
  meta: string;
  url?: string;
}

const fallbackDocuments: readonly DocumentItem[] = [
  {
    id: 'doc-presupuesto-2026',
    tag: 'PRESUPUESTO · Periodo 2026',
    title: 'Presupuesto Ordinario Aprobado',
    meta: 'PDF Accesible · 2.4 MB',
    url: '/documents/presupuesto-ordinario-2026.pdf',
  },
  {
    id: 'doc-liquidacion-2025',
    tag: 'LIQUIDACIÓN · Ejercicio 2025',
    title: 'Liquidación Presupuestaria Auditada',
    meta: 'PDF Accesible · 3.1 MB',
    url: '/documents/liquidacion-presupuestaria-2025.pdf',
  },
  {
    id: 'doc-actas-2025-2026',
    tag: 'ACTAS · 2025 - 2026',
    title: 'Libro de Actas de Consejo Intermunicipal',
    meta: 'PDF Accesible · 5.8 MB',
    url: '/documents/acta-asamblea-general-01.pdf',
  },
  {
    id: 'doc-planificacion-2024-2028',
    tag: 'PLANIFICACIÓN · 2024 - 2028',
    title: 'Plan Operativo y Matriz PICC',
    meta: 'PDF Accesible · 1.9 MB',
    url: '/documents/estatutos-femucaribe-gaceta.pdf',
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

    return items.map((doc, idx) => {
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
          (fallback ? fallback.meta : 'PDF Accesible'),
        url,
      };
    });
  } catch (err) {
    console.warn(
      `[CMS] Fallback to local documents: ${err instanceof Error ? err.message : String(err)}`,
    );
    return fallbackDocuments;
  }
}
