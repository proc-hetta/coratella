import { browser } from '$app/environment';

export const defaultTheme = 'wintry';
export const themes = ['wintry', 'reign', 'mint', 'rose', 'pine', 'cerberus'];
export const defaultMode = 'system';
export const modes = ['system', 'dark', 'light'];

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

export function getMode() {
  return browser
    ? (document.cookie
        .split('; ')
        .find((v) => v.includes('mode='))
        ?.split('=')[1] ??
        document.documentElement.getAttribute('data-mode') ??
        defaultMode)
    : defaultMode;
}

export function setMode(mode: string) {
  if (browser) {
    document.documentElement.setAttribute('data-mode', mode);
    document.cookie = `mode=${mode}; path=/`;
  }
}
