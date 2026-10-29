import {
  listMunicipalities,
  type Municipality,
} from './municipalities-repository';

interface WpMunicipalidad {
  id: number;
  slug: string;
  modified_gmt: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  muni_data?: {
    canton_id?: string;
    cabecera?: string;
    canton_foto?: string;
    alcalde_nombre?: string;
    alcalde_cargo?: string;
    alcalde_foto?: string;
    telefono?: string;
    correo?: string;
    sitio_web?: string;
    direccion?: string;
    escudo_url?: string;
  };
  meta?: {
    canton_id?: string;
    cabecera?: string;
    canton_foto?: string;
    alcalde_nombre?: string;
    alcalde_cargo?: string;
    alcalde_foto?: string;
    telefono?: string;
    correo?: string;
    sitio_web?: string;
    direccion?: string;
    escudo_url?: string;
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

export function toProxyMediaUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  const CMS_UPLOADS = 'https://cms.femucaribe.go.cr/wp-content/uploads/';
  if (trimmed.startsWith(CMS_UPLOADS)) {
    const relative = trimmed.slice(CMS_UPLOADS.length);
    return `/media/${relative}`;
  }
  return trimmed;
}

export async function fetchCmsMunicipalities(): Promise<Municipality[]> {
  const localList = await listMunicipalities();
  const CMS_URL = `https://cms.femucaribe.go.cr/wp-json/wp/v2/municipalidades?per_page=20&nocache=1&_ts=${Date.now()}`;

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

    if (!response.ok) {
      console.warn(
        `[CMS] Error fetching municipalidades: HTTP ${response.status}. Using fallback.`,
      );
      return localList;
    }

    const remoteItems: WpMunicipalidad[] = await response.json();
    if (!Array.isArray(remoteItems) || remoteItems.length === 0) {
      return localList;
    }

    // Indexar datos remotos por canton_id o slug
    const remoteBySlug = new Map<string, WpMunicipalidad>();
    for (const item of remoteItems) {
      const cantonKey =
        item.muni_data?.canton_id || item.meta?.canton_id || item.slug;
      if (cantonKey) {
        remoteBySlug.set(cantonKey.toLowerCase().trim(), item);
      }
    }

    return localList.map((local) => {
      const remote = remoteBySlug.get(local.id.toLowerCase());
      if (!remote) return local;

      const data = remote.muni_data || remote.meta || {};
      const remoteDesc = cleanHtml(remote.content?.rendered || '');

      return {
        ...local,
        name: remote.title?.rendered
          ? cleanHtml(remote.title.rendered)
          : local.name,
        cabecera: data.cabecera?.trim() || local.cabecera,
        description: remoteDesc.length > 0 ? remoteDesc : local.description,
        cantonFotoUrl: toProxyMediaUrl(data.canton_foto) || local.cantonFotoUrl,
        alcaldia: {
          nombre: data.alcalde_nombre?.trim() || local.alcaldia.nombre,
          cargo: data.alcalde_cargo?.trim() || local.alcaldia.cargo,
          fotoUrl: toProxyMediaUrl(data.alcalde_foto) || local.alcaldia.fotoUrl,
        },
        contacto: {
          telefono: data.telefono?.trim() || local.contacto.telefono,
          correo: data.correo?.trim() || local.contacto.correo,
          sitioWeb: data.sitio_web?.trim() || local.contacto.sitioWeb,
          direccion: data.direccion?.trim() || local.contacto.direccion,
        },
        escudoUrl: toProxyMediaUrl(data.escudo_url) || local.escudoUrl,
        updatedAt: remote.modified_gmt
          ? new Date(remote.modified_gmt + 'Z').toISOString()
          : local.updatedAt,
      };
    });
  } catch (err) {
    console.warn(
      `[CMS] Fallback to local municipalidades: ${err instanceof Error ? err.message : String(err)}`,
    );
    return localList;
  }
}
