import { browser } from '$app/env';

export const defaultTheme = 'wintry';
export const themes = ['wintry', 'reign', 'mint', 'rose', 'pine', 'cerberus'];
export const defaultMode = 'system';
export const modes = ['system', 'dark', 'light'];

type Preference = 'theme' | 'mode';

/** Reads a preference from its cookie, then from the `data-*` attribute on `<html>`. */
function readPreference(name: Preference, fallback: string) {
  if (!browser) return fallback;
  const fromCookie = document.cookie
    .split('; ')
    .find((v) => v.includes(`${name}=`))
    ?.split('=')[1];
  return fromCookie ?? document.documentElement.getAttribute(`data-${name}`) ?? fallback;
}

/** Applies a preference to `<html>` and persists it in a cookie read by the server hooks. */
function writePreference(name: Preference, value: string) {
  if (!browser) return;
  document.documentElement.setAttribute(`data-${name}`, value);
  document.cookie = `${name}=${value}; path=/`;
}

export const getTheme = () => readPreference('theme', defaultTheme);
export const setTheme = (theme: string) => writePreference('theme', theme);
export const getMode = () => readPreference('mode', defaultMode);
export const setMode = (mode: string) => writePreference('mode', mode);
