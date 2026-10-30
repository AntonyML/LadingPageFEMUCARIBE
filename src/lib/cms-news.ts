import { newsArticles, type NewsArticle } from '../components/noticias/data';

interface WpPost {
  id: number;
  slug: string;
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
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
      media_details?: {
        width?: number;
        height?: number;
      };
    }>;
  };
}

const FALLBACK_NEWS_IMAGES: Record<
  string,
  { src: string; alt: string; width: number; height: number }
> = {
  'comunidades-de-limon-y-parrita-recibiran-apoyo-para-impulsar-sus-proyectos':
    {
      src: '/images/noticias/comunidades-limon-parrita.jpg',
      alt: 'Comunidades de Limón y Parrita recibirán apoyo para impulsar sus proyectos',
      width: 760,
      height: 520,
    },
  'puente-en-matama-de-limon-sera-sustituido-por-una-estructura-mas-amplia-y-segura':
    {
      src: '/images/noticias/puente-matama-limon.jpg',
      alt: 'Puente en Matama de Limón será sustituido por una estructura más amplia y segura',
      width: 760,
      height: 520,
    },
  'mopt-conavi-impulsan-13-proyectos-de-infraestructura-para-fortalecer-la-red-vial-de':
    {
      src: '/images/noticias/mopt-conavi-proyectos.jpg',
      alt: 'MOPT-CONAVI impulsan 13 proyectos de infraestructura para fortalecer la red vial de la Región Caribe',
      width: 760,
      height: 520,
    },
  'ya-inicio-la-construccion-del-sendero-universal-para-mejorar-la-accesibilidad-en-el-parque-nacional-tortuguero':
    {
      src: '/images/noticias/sendero-tortuguero.png',
      alt: 'Sendero universal en Parque Nacional Tortuguero',
      width: 760,
      height: 520,
    },
  'pococi-recibe-inversiones-por-mas-de-5-800-millones-en-11-proyectos-de-infraestructura-rural':
    {
      src: '/images/noticias/inversiones-pococi.png',
      alt: 'Inversiones en Pococí',
      width: 760,
      height: 520,
    },
  'inder-promueve-el-desarrollo-de-limon-con-obras-que-mejoran-la-vida-de-sus-familias-rurales':
    {
      src: '/images/noticias/desarrollo-rural-limon.png',
      alt: 'Desarrollo rural en Limón',
      width: 760,
      height: 520,
    },
};

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

    return posts.map((post, idx) => {
      const category = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'General';
      const publishedOn = (post.date ? post.date.split('T')[0] : '') ?? '';
      const title = cleanHtml(post.title?.rendered || '');
      const summary = cleanHtml(post.excerpt?.rendered || '');
      const source = post.meta?.source || 'FEMUCARIBE';
      const url = post.meta?.external_url || post.link || '#';

      const featured = post._embedded?.['wp:featuredmedia']?.[0];
      const fallbackImage =
        FALLBACK_NEWS_IMAGES[post.slug] ?? newsArticles[idx]?.image;

      let image: NewsArticle['image'] = fallbackImage;
      if (featured?.source_url) {
        image = {
          src: featured.source_url,
          alt: featured.alt_text || title,
          width: featured.media_details?.width || 760,
          height: featured.media_details?.height || 520,
        };
      }

      return {
        category,
        publishedOn,
        title,
        summary,
        source,
        url,
        ...(image ? { image } : {}),
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
