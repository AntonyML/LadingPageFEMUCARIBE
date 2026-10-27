import { newsArticles, type NewsArticle } from '../components/noticias/data';

interface WpPost {
  id: number;
  date: string;
  link: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  meta?: {
    source?: string;
    external_url?: string;
  };
  _embedded?: {
    'wp:term'?: Array<Array<{ name: string }>>;
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

export async function fetchNewsArticles(): Promise<readonly NewsArticle[]> {
  const CMS_URL = `https://cms.femucaribe.go.cr/wp-json/wp/v2/posts?_embed&per_page=20&nocache=1&_ts=${Date.now()}`;

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
        `[CMS] Error fetching news from WordPress: HTTP ${response.status}. Using fallback.`,
      );
      return newsArticles;
    }

    const posts = (await response.json()) as WpPost[];

    if (!Array.isArray(posts) || posts.length === 0) {
      return newsArticles;
    }

    return posts.map((post) => {
      const category = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'General';
      const publishedOn = (post.date ? post.date.split('T')[0] : '') ?? '';
      const title = cleanHtml(post.title?.rendered || '');
      const summary = cleanHtml(post.excerpt?.rendered || '');
      const source = post.meta?.source || 'FEMUCARIBE';
      const url = post.meta?.external_url || post.link || '#';

      return {
        category,
        publishedOn,
        title,
        summary,
        source,
        url,
      };
    });
  } catch (error) {
    console.warn(
      '[CMS] Failed to reach WordPress CMS. Falling back to local data:',
      error,
    );
    return newsArticles;
  }
}
