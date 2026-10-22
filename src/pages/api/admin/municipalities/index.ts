import type { APIRoute } from 'astro';
import { listMunicipalities } from '../../../../lib/municipalities-repository';

export const prerender = false;

const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return Response.json(
      { error: 'Se requiere una sesión administrativa activa.' },
      { status: 401, headers },
    );
  }

  try {
    return Response.json(await listMunicipalities(), { headers });
  } catch {
    return Response.json(
      { error: 'No fue posible cargar la información de las municipalidades.' },
      { status: 500, headers },
    );
  }
};

export const ALL: APIRoute = () =>
  Response.json(
    { error: 'Método no permitido.' },
    { status: 405, headers: { ...headers, Allow: 'GET' } },
  );
