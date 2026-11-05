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
