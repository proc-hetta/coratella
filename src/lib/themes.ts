import { browser } from '$app/env';

export const defaultTheme = 'wintry';
export const themes = ['wintry', 'reign', 'mint', 'rose', 'pine', 'cerberus'];
export const defaultMode = 'dark';
export const modes = ['system', 'dark', 'light'];

/** One year: preferences survive browser restarts. */
const preferenceMaxAge = 60 * 60 * 24 * 365;

function oneOf(values: string[], value: string | null | undefined, fallback: string) {
  return value && values.includes(value) ? value : fallback;
}

export const themeOrDefault = (value?: string | null) => oneOf(themes, value, defaultTheme);
export const modeOrDefault = (value?: string | null) => oneOf(modes, value, defaultMode);

// The server renders the allow-listed preferences on `<html>`, so the attributes are the source of truth.
const rootDataset = () => (browser ? document.documentElement.dataset : undefined);

export const getTheme = () => themeOrDefault(rootDataset()?.theme);
export const getMode = () => modeOrDefault(rootDataset()?.mode);

/** Applies a preference to `<html>` and persists it in the cookie read by the server hooks. */
function setPreference(name: 'theme' | 'mode', value: string) {
  if (!browser) return;
  document.documentElement.dataset[name] = value;
  document.cookie = `${name}=${value}; path=/; max-age=${preferenceMaxAge}; SameSite=Lax`;
}

export const setTheme = (theme: string) => setPreference('theme', theme);
export const setMode = (mode: string) => setPreference('mode', mode);
