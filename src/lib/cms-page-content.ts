import { toProxyMediaUrl } from './cms-municipalities';

const CMS_PAGE_CONTENT_URL =
  'https://cms.femucaribe.go.cr/wp-json/femucaribe/v1/page-content';

export type PageKey =
  | 'inicio'
  | 'nosotros'
  | 'municipalidades'
  | 'proyectos'
  | 'transparencia'
  | 'noticias';

export type PageContent = Readonly<Record<string, string>>;
type AllPageContent = Partial<Record<PageKey, PageContent>>;

let cache: Promise<AllPageContent> | undefined;

export function parsePageContent(payload: unknown): AllPageContent {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }
  const result: Record<string, Record<string, string>> = {};
  for (const [page, values] of Object.entries(payload)) {
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      continue;
    }
    const clean: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      if (typeof value !== 'string' || value.trim() === '') continue;
      const trimmed = value.trim();
      clean[key] = trimmed.startsWith('https://')
        ? (toProxyMediaUrl(trimmed) ?? trimmed)
        : trimmed;
    }
    result[page] = clean;
  }
  return result;
}

async function fetchAll(): Promise<AllPageContent> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(`${CMS_PAGE_CONTENT_URL}?_ts=${Date.now()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      console.warn(
        `[CMS] page-content HTTP ${response.status}. Using defaults.`,
      );
      return {};
    }
    return parsePageContent(await response.json());
  } catch (err) {
    console.warn(
      `[CMS] page-content fallback: ${err instanceof Error ? err.message : String(err)}`,
    );
    return {};
  }
}

/** CMS overrides for one page; empty object when the CMS is unavailable. */
export async function getPageContent(page: PageKey): Promise<PageContent> {
  cache ??= fetchAll();
  return (await cache)[page] ?? {};
}
