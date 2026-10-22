import type { APIRoute } from 'astro';
import { SESSION_COOKIE_NAME } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect, request }) => {
  cookies.delete(SESSION_COOKIE_NAME, {
    path: '/',
  });

  const accept = request.headers.get('accept') || '';
  if (accept.includes('application/json')) {
    return new Response(
      JSON.stringify({ success: true, redirect: '/acceso' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return redirect('/acceso', 302);
};

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(SESSION_COOKIE_NAME, {
    path: '/',
  });

  return redirect('/acceso', 302);
};
