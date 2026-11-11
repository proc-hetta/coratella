import { PUBLIC_LOGO, PUBLIC_LOGODARK, PUBLIC_LOGOLIGHT } from '$app/env/public';
import fallbackLogo from '#lib/images/logo.svg';

/** The logo matching the given color mode. */
export function logo(mode: string) {
  return (mode === 'dark' ? PUBLIC_LOGODARK : PUBLIC_LOGOLIGHT) ?? PUBLIC_LOGO ?? fallbackLogo;
}
