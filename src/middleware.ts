import { defineMiddleware } from 'astro:middleware';
import { verifySessionToken, SESSION_COOKIE_NAME } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  // Use Astro's routing-normalized URL, including decoded path segments.
  const url = context.url;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const pathname = url.pathname.slice(base.length).replace(/\/$/, '') || '/';
  const isAdminApi =
    pathname === '/api/admin' || pathname.startsWith('/api/admin/');

  // Protect /admin and any subpaths under /admin/
  if (isAdminApi || pathname === '/admin' || pathname.startsWith('/admin/')) {
    context.cache.set(false);
    const sessionCookie = context.cookies.get(SESSION_COOKIE_NAME)?.value;
    const verification = verifySessionToken(sessionCookie);

    if (!verification.valid) {
      if (isAdminApi) {
        return Response.json(
          { error: 'Debe iniciar sesión para acceder al panel.' },
          { status: 401, headers: { 'Cache-Control': 'no-store' } },
        );
      }
      return context.redirect(`${base}/acceso?error=unauthorized`, 302);
    }

    context.locals.user = {
      ...(verification.email !== undefined
        ? { email: verification.email }
        : {}),
    };
  }

  const response = await next();
  if (isAdminApi || pathname === '/admin' || pathname.startsWith('/admin/')) {
    response.headers.set('Cache-Control', 'no-store');
  }
  return response;
});
