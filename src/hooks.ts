import { deLocalizeUrl } from '#lib/paraglide/runtime.js';

export const reroute = (request: { url: string | URL }) => deLocalizeUrl(request.url).pathname;
