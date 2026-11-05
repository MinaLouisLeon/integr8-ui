'use client';

import {
  type JSX,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { isValidThemeName } from './defineTheme';
import { ThemeContext, type ThemeContextValue, type ThemeName } from './themeContext';
import { themesToCss } from './themeCss';
import { ThemeError } from './themeError';
import { createLocalStorageThemeStorage, type ThemeStorage } from './themeStorage';
import { BUILT_IN_THEMES, RESERVED_THEME_NAMES, SYSTEM_THEME } from './themes/builtInThemes';
import { lightTheme } from './themes/light';
import type { ThemeDefinition } from './tokens';

/** Props for {@link ThemeProvider}. */
export interface ThemeProviderProps {
  children: ReactNode;
  /** Theme used when nothing is saved yet. Default `'system'`. */
  defaultTheme?: ThemeName;
  /** Where the picked theme is saved. Default: localStorage key `'integr8-theme'`. */
  storage?: ThemeStorage;
  /**
   * Extra brand themes made with `defineTheme`. Pass a stable array (for example one defined
   * outside the component), so the theme CSS is not rebuilt on every render.
   */
  themes?: ThemeDefinition[];
  /** Element that gets `data-theme` and the `dark` class. Default `document.documentElement`. */
  target?: HTMLElement;
}

/** Attribute on the `<style>` element that holds the CSS for custom themes. @internal */
export const CUSTOM_THEMES_STYLE_ATTRIBUTE = 'data-integr8-ui-themes';

const DARK_QUERY = '(prefers-color-scheme: dark)';
const defaultStorage = createLocalStorageThemeStorage();

/**
 * Applies the current theme and lets components read and change it through `useTheme()`.
 *
 * Sets `data-theme="<resolved theme>"` on the target and adds the `dark` class when the theme
 * is dark-based, so Tailwind's `dark:` variant works. `system` follows the OS setting live.
 *
 * @throws {@link ThemeError} with code `UNKNOWN_THEME` when `defaultTheme` is not registered,
 * or `INVALID_THEME` when a custom theme has a bad or duplicate name.
 *
 * @example
 * ```tsx
 * <ThemeProvider defaultTheme="system">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme = SYSTEM_THEME,
  storage = defaultStorage,
  themes: customThemes,
  target,
}: ThemeProviderProps): JSX.Element {
  const custom = useMemo(() => checkCustomThemes(customThemes ?? []), [customThemes]);
  const allThemes = useMemo(() => [...BUILT_IN_THEMES, ...custom], [custom]);
  const isKnown = useCallback(
    (name: unknown): name is ThemeName =>
      typeof name === 'string' &&
      (name === SYSTEM_THEME || allThemes.some((theme) => theme.name === name)),
    [allThemes],
  );

  // Read the saved theme once. A sync result is used right away; an async one is applied
  // when it resolves (unless the user picked a theme in the meantime).
  const pendingLoad = useRef<Promise<ThemeName | null> | null>(null);
  const [picked, setPicked] = useState<ThemeName>(() => {
    const saved = safeGet(storage);
    if (isThenable<ThemeName | null>(saved)) {
      pendingLoad.current = Promise.resolve(saved);
      return defaultTheme;
    }
    return saved ?? defaultTheme;
  });
  const userPicked = useRef(false);

  useEffect(() => {
    const load = pendingLoad.current;
    if (load === null) return;
    // `active` (not clearing the ref) guards against the double effect run of StrictMode.
    let active = true;
    load.then(
      (saved) => {
        if (!active) return;
        pendingLoad.current = null;
        if (!userPicked.current && saved !== null) setPicked(saved);
      },
      () => {
        // Keep the default theme when the storage cannot be read.
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const prefersDark = usePrefersDark();
  // A saved theme that is no longer registered falls back to the default.
  const theme = isKnown(picked) ? picked : defaultTheme;
  const resolvedTheme = theme === SYSTEM_THEME ? (prefersDark ? 'dark' : 'light') : theme;
  const definition = allThemes.find((item) => item.name === resolvedTheme) ?? lightTheme;
  const base = definition.base;

  // Custom theme CSS goes into one <style> tag in the document head.
  const customCss = useMemo(() => themesToCss(custom), [custom]);
  useLayoutEffect(() => {
    if (customCss === '') return;
    const doc = target?.ownerDocument ?? document;
    const style = doc.createElement('style');
    style.setAttribute(CUSTOM_THEMES_STYLE_ATTRIBUTE, '');
    style.textContent = customCss;
    doc.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, [customCss, target]);

  useLayoutEffect(() => {
    const element = target ?? document.documentElement;
    element.setAttribute('data-theme', resolvedTheme);
    element.classList.toggle('dark', base === 'dark');
  }, [target, resolvedTheme, base]);

  const setTheme = useCallback(
    (next: ThemeName) => {
      if (!isKnown(next)) {
        throw new ThemeError('UNKNOWN_THEME', `setTheme: "${next}" is not a registered theme.`);
      }
      userPicked.current = true;
      setPicked(next);
      safeSet(storage, next);
    },
    [isKnown, storage],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, base, themes: allThemes, setTheme }),
    [theme, resolvedTheme, base, allThemes, setTheme],
  );

  if (!isKnown(defaultTheme)) {
    throw new ThemeError(
      'UNKNOWN_THEME',
      `ThemeProvider: defaultTheme "${defaultTheme}" is not a registered theme.`,
    );
  }

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

function checkCustomThemes(themes: readonly ThemeDefinition[]): ThemeDefinition[] {
  const seen = new Set<string>();
  for (const theme of themes) {
    if (!isValidThemeName(theme.name) || RESERVED_THEME_NAMES.includes(theme.name)) {
      throw new ThemeError(
        'INVALID_THEME',
        `ThemeProvider: "${theme.name}" is not a valid custom theme name. Create themes with defineTheme().`,
      );
    }
    if (seen.has(theme.name)) {
      throw new ThemeError(
        'INVALID_THEME',
        `ThemeProvider: theme "${theme.name}" is registered twice.`,
      );
    }
    seen.add(theme.name);
  }
  return [...themes];
}

function subscribeToColorScheme(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(DARK_QUERY).matches
  );
}

function getServerPrefersDark(): boolean {
  return false;
}

function usePrefersDark(): boolean {
  return useSyncExternalStore(subscribeToColorScheme, getPrefersDark, getServerPrefersDark);
}

function safeGet(storage: ThemeStorage): ThemeName | null | Promise<ThemeName | null> {
  try {
    return storage.get();
  } catch {
    return null;
  }
}

function safeSet(storage: ThemeStorage, theme: ThemeName): void {
  try {
    const result = storage.set(theme);
    if (isThenable(result)) {
      Promise.resolve(result).catch(() => {
        // Saving failed; the theme still applies for this session.
      });
    }
  } catch {
    // Saving failed; the theme still applies for this session.
  }
}

function isThenable<T>(value: unknown): value is PromiseLike<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}
