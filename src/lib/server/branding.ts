import { PUBLIC_LOGO, PUBLIC_LOGODARK, PUBLIC_LOGOLIGHT, PUBLIC_TITLE } from '$app/env/public';

const fallbackLogo = './src/lib/images/logo.svg';

/** Blog title and the logo matching the given color mode. */
export function branding(mode: string) {
  const modeLogo = mode === 'dark' ? PUBLIC_LOGODARK : PUBLIC_LOGOLIGHT;
  return {
    title: PUBLIC_TITLE,
    logo: modeLogo ?? PUBLIC_LOGO ?? fallbackLogo,
  };
}
