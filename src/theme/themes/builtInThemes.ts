import type { ThemeBase, ThemeDefinition } from '../tokens';
import { darkTheme } from './dark';
import { integr8Theme } from './integr8';
import { lightTheme } from './light';

/** The palettes that ship with the package, in menu order. `system` is not a palette. */
export const BUILT_IN_THEMES: readonly ThemeDefinition[] = Object.freeze([
  lightTheme,
  darkTheme,
  integr8Theme,
]);

/** The theme that follows the OS setting and resolves to `light` or `dark`. */
export const SYSTEM_THEME = 'system';

/** Names custom themes may not use. */
export const RESERVED_THEME_NAMES: readonly string[] = Object.freeze([
  SYSTEM_THEME,
  ...BUILT_IN_THEMES.map((theme) => theme.name),
]);

/** The built-in palette a base falls back to. */
export function basePalette(base: ThemeBase): ThemeDefinition {
  return base === 'dark' ? darkTheme : lightTheme;
}
