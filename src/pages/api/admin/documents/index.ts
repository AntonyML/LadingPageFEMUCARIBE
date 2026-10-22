import type { APIRoute } from 'astro';
import { getAllDocuments } from '../../../../lib/documents-repository';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query') || undefined;
  const category = url.searchParams.get('category') || undefined;
  const canton = url.searchParams.get('canton') || undefined;

  const documents = await getAllDocuments({
    ...(query ? { query } : {}),
    ...(category ? { category } : {}),
    ...(canton ? { canton } : {}),
  });

  return new Response(JSON.stringify({ success: true, documents }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
