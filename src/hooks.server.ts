import * as auth from '$lib/server/auth.js';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { defaultTheme } from '$lib/themes';

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale),
    });
  });

const handleAuth: Handle = async ({ event, resolve }) => {
  if (!event.url.pathname.startsWith('/admin')) {
    return resolve(event);
  }

  const sessionToken = event.cookies.get(auth.sessionCookieName);

  if (!sessionToken) {
    event.locals.user = null;
    return redirect(302, '/login');
  }

  const { user, payload } = await auth.validateSessionToken(sessionToken);
  if (user?.user) {
    event.locals.user = user.user;
    auth.setSessionTokenCookie(event, sessionToken, payload.exp!);
    return resolve(event);
  } else {
    event.locals.user = null;
    auth.deleteSessionTokenCookie(event);
    return redirect(302, '/login');
  }
};

const handleTheme: Handle = ({ event, resolve }) => {
  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('%theme%', event.cookies.get('theme') ?? defaultTheme),
  });
};

export const handle: Handle = sequence(handleParaglide, handleAuth, handleTheme);
