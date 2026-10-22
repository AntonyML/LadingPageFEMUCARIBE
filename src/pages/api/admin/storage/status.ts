import type { APIRoute } from 'astro';
import { checkStorageHealth } from '../../../../lib/storage-client';

export const prerender = false;

export const GET: APIRoute = async () => {
  const health = await checkStorageHealth(3500);

  return new Response(JSON.stringify(health), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store',
    },
  });
};
