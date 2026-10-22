import type { APIRoute } from 'astro';
import {
  getMunicipality,
  municipalityIds,
  municipalityUpdateSchema,
  updateMunicipality,
} from '../../../../lib/municipalities-repository';

export const prerender = false;

const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};
const maximumBodyBytes = 128 * 1024;

function errorResponse(error: string, status: number): Response {
  return Response.json({ error }, { status, headers });
}

function isKnownId(
  id: string | undefined,
): id is (typeof municipalityIds)[number] {
  return municipalityIds.some((municipalityId) => municipalityId === id);
}

async function parseBody(
  request: Request,
): Promise<{ value: unknown } | { error: string; status: number }> {
  const contentLength = Number(request.headers.get('content-length'));
  if (contentLength > maximumBodyBytes) {
    return { error: 'El formulario supera el tamaño permitido.', status: 413 };
  }
  if (!request.body)
    return { error: 'El cuerpo JSON es obligatorio.', status: 400 };

  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let text = '';

  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > maximumBodyBytes) {
        await reader.cancel();
        return {
          error: 'El formulario supera el tamaño permitido.',
          status: 413,
        };
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
    const value: unknown = JSON.parse(text);
    return { value };
  } catch {
    return {
      error: 'El cuerpo de la solicitud debe ser JSON válido.',
      status: 400,
    };
  } finally {
    reader.releaseLock();
  }
}

export const GET: APIRoute = async ({ locals, params }) => {
  if (!locals.user) {
    return errorResponse('Se requiere una sesión administrativa activa.', 401);
  }
  if (!isKnownId(params.id)) {
    return errorResponse('Municipalidad no encontrada.', 404);
  }

  try {
    const municipality = await getMunicipality(params.id);
    return municipality
      ? Response.json(municipality, { headers })
      : errorResponse('Municipalidad no encontrada.', 404);
  } catch {
    return errorResponse('No fue posible cargar la ficha municipal.', 500);
  }
};

export const PUT: APIRoute = async ({ locals, params, request, url }) => {
  if (!locals.user) {
    return errorResponse('Se requiere una sesión administrativa activa.', 401);
  }
  if (!isKnownId(params.id)) {
    return errorResponse('Municipalidad no encontrada.', 404);
  }
  if (request.headers.get('origin') !== url.origin) {
    return errorResponse('El origen de la solicitud no está permitido.', 403);
  }
  if (
    request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !==
    'application/json'
  ) {
    return errorResponse('Use el formato application/json.', 415);
  }

  const body = await parseBody(request);
  if ('error' in body) return errorResponse(body.error, body.status);
  const parsed = municipalityUpdateSchema.safeParse(body.value);
  if (!parsed.success) {
    return Response.json(
      {
        error: 'Revise los campos del formulario.',
        issues: parsed.error.issues.map(({ path, message }) => ({
          path,
          message,
        })),
      },
      { status: 422, headers },
    );
  }

  try {
    const municipality = await updateMunicipality(params.id, parsed.data);
    return municipality
      ? Response.json(municipality, { headers })
      : errorResponse('Municipalidad no encontrada.', 404);
  } catch {
    return errorResponse(
      'No fue posible guardar los cambios. Inténtelo de nuevo.',
      500,
    );
  }
};

export const ALL: APIRoute = () =>
  Response.json(
    { error: 'Método no permitido.' },
    { status: 405, headers: { ...headers, Allow: 'GET, PUT' } },
  );
