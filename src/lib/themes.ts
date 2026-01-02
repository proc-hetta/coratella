import { browser } from '$app/environment';

export const defaultTheme = 'wintry';
export const themes = ['wintry', 'reign', 'mint', 'rose', 'pine', 'cerberus'];
export const defaultVariant = 'dark';
export const themeVariants = ['system', 'light', 'dark'];

export function getTheme() {
  return browser
    ? (document.cookie
        .split('; ')
        .find((v) => v.includes('theme='))
        ?.split('=')[1] ??
        document.documentElement.getAttribute('data-theme') ??
        defaultTheme)
    : defaultTheme;
}

export function setTheme(theme: string) {
  if (browser) {
    document.documentElement.setAttribute('data-theme', theme);
    document.cookie = `theme=${theme}; path=/`;
  }
}
