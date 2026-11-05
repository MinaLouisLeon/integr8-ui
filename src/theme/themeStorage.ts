import type { ThemeName } from './themeContext';

/**
 * Where the picked theme is saved. Pass your own to `ThemeProvider` to save it somewhere
 * else, for example on a server per device. Both methods may be sync or async.
 */
export interface ThemeStorage {
  /** Returns the saved theme, or `null` when nothing is saved. */
  get(): ThemeName | null | Promise<ThemeName | null>;
  /** Saves the theme the user picked. */
  set(theme: ThemeName): void | Promise<void>;
}

/** localStorage key used by the default storage and by `getThemeScript()`. @internal */
export const DEFAULT_STORAGE_KEY = 'integr8-theme';

/**
 * Storage backed by `window.localStorage`. Does nothing on the server and when storage is
 * blocked (private mode, sandboxed iframes).
 *
 * @internal
 */
export function createLocalStorageThemeStorage(key: string = DEFAULT_STORAGE_KEY): ThemeStorage {
  return {
    get() {
      try {
        return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(theme) {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, theme);
        }
      } catch {
        // Storage is blocked; the theme still applies for this session.
      }
    },
  };
}
