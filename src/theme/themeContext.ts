'use client';

import { type Context, createContext } from 'react';
import type { ThemeBase, ThemeDefinition } from './tokens';

/**
 * A theme name: one of the built-ins, `system`, or the name of a theme made with
 * `defineTheme`.
 */
export type ThemeName = 'light' | 'dark' | 'system' | 'integr8' | (string & {});

/** What {@link useTheme} returns. */
export interface ThemeContextValue {
  /** What the user picked. Can be `'system'`. */
  theme: ThemeName;
  /** The theme in use: `'light'`, `'dark'`, `'integr8'` or a custom name. Never `'system'`. */
  resolvedTheme: string;
  /** The base of the resolved theme. */
  base: ThemeBase;
  /** Every registered theme: the built-ins first, then custom ones. `system` is not listed. */
  themes: ThemeDefinition[];
  /**
   * Switches the theme and saves it through the storage adapter.
   *
   * @throws {@link ThemeError} with code `UNKNOWN_THEME` when the name is not registered.
   */
  setTheme(theme: ThemeName): void;
}

/** @internal */
export const ThemeContext: Context<ThemeContextValue | null> =
  createContext<ThemeContextValue | null>(null);
