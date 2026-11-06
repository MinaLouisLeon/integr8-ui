'use client';

import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './themeContext';
import { ThemeError } from './themeError';

/**
 * Reads and changes the current theme.
 *
 * @throws {@link ThemeError} with code `MISSING_PROVIDER` when used outside a `ThemeProvider`.
 *
 * @example
 * ```tsx
 * function DarkModeToggle() {
 *   const { base, setTheme } = useTheme();
 *   return (
 *     <button onClick={() => setTheme(base === 'dark' ? 'light' : 'dark')}>Toggle</button>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new ThemeError('MISSING_PROVIDER', 'useTheme must be used inside a <ThemeProvider>.');
  }
  return value;
}

/**
 * Like {@link useTheme}, but returns `null` outside a `ThemeProvider` instead of throwing. For
 * theme-aware parts that must also work without a provider, such as `Toaster`.
 *
 * @example
 * ```tsx
 * function Logo() {
 *   const base = useOptionalTheme()?.base ?? 'light';
 *   return <img src={base === 'dark' ? '/logo-light.svg' : '/logo-dark.svg'} alt="Integr8" />;
 * }
 * ```
 */
export function useOptionalTheme(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
