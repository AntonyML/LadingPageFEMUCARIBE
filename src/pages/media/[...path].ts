import type { APIRoute, GetStaticPaths } from 'astro';

const ALLOWED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.gif',
  '.pdf',
]);

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
};

const CMS_ORIGIN = 'https://cms.femucaribe.go.cr';
const CMS_UPLOADS = `${CMS_ORIGIN}/wp-content/uploads/`;

const KNOWN_STATIC_MEDIA: string[] = [
  'municipalidades/canton-guacimo.png',
  'municipalidades/canton-limon.png',
  'municipalidades/canton-matina.png',
  'municipalidades/canton-parrita.png',
  'municipalidades/canton-pococi.png',
  'municipalidades/canton-siquirres.png',
  'municipalidades/canton-talamanca.png',
  'municipalidades/guacimo.png',
  'municipalidades/limon.png',
  'municipalidades/matina.png',
  'municipalidades/parrita.png',
  'municipalidades/pococi.png',
  'municipalidades/siquirres.png',
  'municipalidades/talamanca.png',
  'municipalidades/alcalde-matina.png',
  'municipalidades/alcaldesa-limon.png',
];

export const getStaticPaths: GetStaticPaths = async () => {
  const mediaPaths = new Set<string>(KNOWN_STATIC_MEDIA);

  // Discover dynamically from WordPress municipalidades API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `${CMS_ORIGIN}/wp-json/wp/v2/municipalidades?per_page=50&nocache=1`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      },
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        for (const item of items) {
          const data = item.muni_data || item.meta || {};
          const urls = [data.canton_foto, data.alcalde_foto, data.escudo_url];
          for (const u of urls) {
            if (typeof u === 'string' && u.startsWith(CMS_UPLOADS)) {
              mediaPaths.add(u.slice(CMS_UPLOADS.length));
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[MediaPrerender] CMS municipalidades fetch skipped:', err);
  }

  // Discover dynamically from WordPress media library
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `${CMS_ORIGIN}/wp-json/wp/v2/media?per_page=100&nocache=1`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      },
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        for (const item of items) {
          const sourceUrl = item.source_url;
          if (
            typeof sourceUrl === 'string' &&
            sourceUrl.startsWith(CMS_UPLOADS)
          ) {
            mediaPaths.add(sourceUrl.slice(CMS_UPLOADS.length));
          }
        }
      }
    }
  } catch (err) {
    console.warn('[MediaPrerender] CMS media fetch skipped:', err);
  }

  return Array.from(mediaPaths).map((p) => ({
    params: { path: p },
  }));
};

export const GET: APIRoute = async ({ params }) => {
  const rawPath = params.path;
  if (!rawPath || typeof rawPath !== 'string') {
    return new Response(null, { status: 400 });
  }

  // Prevent directory traversal or malicious characters
  const decodedPath = decodeURIComponent(rawPath).replace(/\\/g, '/');
  if (
    decodedPath.includes('..') ||
    decodedPath.includes('\0') ||
    decodedPath.startsWith('/')
  ) {
    return new Response(null, { status: 403 });
  }

  const dotIndex = decodedPath.lastIndexOf('.');
  if (dotIndex === -1) {
    return new Response(null, { status: 400 });
  }

  const extension = decodedPath.slice(dotIndex).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return new Response(null, { status: 403 });
  }

  // Construct target upstream URL
  const upstreamUrl = decodedPath.startsWith('wp-content/')
    ? `${CMS_ORIGIN}/${decodedPath}`
    : decodedPath.startsWith('uploads/')
      ? `${CMS_ORIGIN}/wp-content/${decodedPath}`
      : `${CMS_ORIGIN}/wp-content/uploads/${decodedPath}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const upstreamResponse = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: {
        Accept: '*/*',
        'User-Agent': 'FemucaribeMediaProxy/1.0',
      },
    });

    clearTimeout(timeoutId);

    if (!upstreamResponse.ok) {
      return new Response(null, { status: upstreamResponse.status });
    }

    const contentType =
      upstreamResponse.headers.get('content-type') ||
      MIME_TYPES[extension] ||
      'application/octet-stream';

    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control':
        'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    });

    const contentLength = upstreamResponse.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(upstreamResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error(
      `[MediaProxy] Error fetching ${upstreamUrl}:`,
      error instanceof Error ? error.message : error,
    );
    return new Response(null, { status: 502 });
  }
};
