import { defineMiddleware } from 'astro:middleware';
import { verifySessionToken, SESSION_COOKIE_NAME } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Protect /admin and any subpaths under /admin/
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const sessionCookie = context.cookies.get(SESSION_COOKIE_NAME)?.value;
    const verification = verifySessionToken(sessionCookie);

    if (!verification.valid) {
      return context.redirect('/acceso?error=unauthorized', 302);
    }

    context.locals.user = {
      ...(verification.email !== undefined
        ? { email: verification.email }
        : {}),
    };
  }

  return next();
});
