import type { APIRoute } from 'astro';
import {
  validateCredentials,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from '../../../lib/auth';

export const prerender = false;

async function parseCredentials(
  request: Request,
): Promise<{ email: string; password: string } | null> {
  const contentType = request.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const body = await request.json();
      return {
        email: typeof body?.email === 'string' ? body.email : '',
        password: typeof body?.password === 'string' ? body.password : '',
      };
    }

    if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await request.formData();
      return {
        email: String(formData.get('email') || ''),
        password: String(formData.get('password') || ''),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const contentType = request.headers.get('content-type') || '';

  if (
    !contentType.includes('application/json') &&
    !contentType.includes('application/x-www-form-urlencoded') &&
    !contentType.includes('multipart/form-data')
  ) {
    return new Response(JSON.stringify({ error: 'Unsupported Content-Type' }), {
      status: 415,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const credentials = await parseCredentials(request);

  if (!credentials) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const isValid = validateCredentials(credentials.email, credentials.password);

  if (!isValid) {
    return new Response(
      JSON.stringify({
        error: 'Credenciales inválidas. Verifique su correo y contraseña.',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const token = createSessionToken(credentials.email);

  cookies.set(SESSION_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    secure: import.meta.env.PROD,
  });

  return new Response(JSON.stringify({ success: true, redirect: '/admin' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const ALL: APIRoute = () => {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', Allow: 'POST' },
  });
};
