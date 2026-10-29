import type { APIRoute } from 'astro';

export const prerender = false;

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
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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
