import { describe, expect, it, vi, afterEach } from 'vitest';
import { GET, getStaticPaths } from '../../src/pages/media/[...path]';

describe('Media proxy endpoint', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects requests with missing path', async () => {
    // @ts-expect-error Mocking Astro APIContext
    const response = await GET({ params: {} });
    expect(response.status).toBe(400);
  });

  it('rejects directory traversal attempts with 403', async () => {
    // @ts-expect-error Mocking Astro APIContext
    const response = await GET({
      params: { path: 'municipalidades/../../secret.png' },
    });
    expect(response.status).toBe(403);
  });

  it('rejects unauthorized file extensions with 403', async () => {
    // @ts-expect-error Mocking Astro APIContext
    const response = await GET({
      params: { path: 'municipalidades/script.php' },
    });
    expect(response.status).toBe(403);
  });

  it('rejects paths without extension with 400', async () => {
    // @ts-expect-error Mocking Astro APIContext
    const response = await GET({
      params: { path: 'municipalidades/image' },
    });
    expect(response.status).toBe(400);
  });

  it('fetches and streams allowed media files with cache headers', async () => {
    const mockBody = new ReadableStream();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'image/png',
        'content-length': '1234',
      }),
      body: mockBody,
    });
    vi.stubGlobal('fetch', fetchMock);

    // @ts-expect-error Mocking Astro APIContext
    const response = await GET({
      params: { path: 'municipalidades/canton-matina.png' },
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://cms.femucaribe.go.cr/wp-content/uploads/municipalidades/canton-matina.png',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: '*/*',
          'User-Agent': 'FemucaribeMediaProxy/1.0',
        }),
      }),
    );
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(response.headers.get('cache-control')).toContain('public');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('returns upstream status when upstream fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers(),
    });
    vi.stubGlobal('fetch', fetchMock);

    // @ts-expect-error Mocking Astro APIContext
    const response = await GET({
      params: { path: 'municipalidades/nonexistent.png' },
    });

    expect(response.status).toBe(404);
  });

  describe('getStaticPaths', () => {
    it('returns known static media paths', async () => {
      // @ts-expect-error Mocking Astro GetStaticPaths call
      const paths = await getStaticPaths();
      const pathList = (paths as Array<{ params: { path: string } }>).map(
        (p) => p.params.path,
      );
      expect(pathList).toContain('municipalidades/canton-matina.png');
      expect(pathList).toContain('municipalidades/canton-parrita.png');
      expect(pathList).toContain('municipalidades/canton-limon.png');
      expect(pathList).toContain('municipalidades/guacimo.png');
    });

    it('discovers media dynamically from WordPress API', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/wp/v2/municipalidades')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              {
                muni_data: {
                  canton_foto:
                    'https://cms.femucaribe.go.cr/wp-content/uploads/extra/test-canton.png',
                },
              },
            ],
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });
      vi.stubGlobal('fetch', fetchMock);

      // @ts-expect-error Mocking Astro GetStaticPaths call
      const paths = await getStaticPaths();
      const pathList = (paths as Array<{ params: { path: string } }>).map(
        (p) => p.params.path,
      );
      expect(pathList).toContain('extra/test-canton.png');
    });
  });
});
