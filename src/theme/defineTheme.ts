import { ThemeError } from './themeError';
import { basePalette, RESERVED_THEME_NAMES } from './themes/builtInThemes';
import { type ThemeBase, type ThemeDefinition, TOKEN_NAMES, type TokenName } from './tokens';

/** Input for {@link defineTheme}. */
export interface DefineThemeOptions {
  /** Unique name, used as the `data-theme` value. Lowercase letters, digits and dashes. */
  name: string;
  /** Human-readable name, shown in the theme switcher. */
  label: string;
  /** The palette to build on. Missing tokens come from it, and it decides the `dark` class. */
  base: ThemeBase;
  /** Token values to override. Missing tokens fall back to the base palette. */
  tokens: Partial<Record<TokenName, string>>;
  /** Font stacks. Shortcut for the `font-sans`, `font-display` and `font-mono` tokens. */
  fonts?: { sans?: string; display?: string; mono?: string };
  /** Base corner radius. Shortcut for the `radius` token. */
  radius?: string;
}

const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;
// Token values end up inside a <style> tag. Block characters that could close the rule,
// the tag, or start a new declaration.
const UNSAFE_VALUE = /[{};<>]/;

/**
 * Creates a brand theme to pass to `ThemeProvider` through its `themes` prop.
 *
 * Tokens you leave out fall back to the base palette (`light` or `dark`). `fonts` and
 * `radius` win over the same tokens in `tokens`.
 *
 * @throws {@link ThemeError} with code `INVALID_THEME` when the name is not lowercase
 * letters, digits and dashes, is reserved (`light`, `dark`, `system`, `integr8`,
 * `integr8-light`), the label is empty, the base is unknown, a token name is unknown, or a
 * value is empty or unsafe.
 *
 * @example
 * ```ts
 * const ocean = defineTheme({
 *   name: 'ocean',
 *   label: 'Ocean',
 *   base: 'dark',
 *   tokens: { primary: '#0ea5e9', ring: '#0ea5e9' },
 *   radius: '0.5rem',
 * });
 * ```
 */
export function defineTheme(def: DefineThemeOptions): ThemeDefinition {
  const { name, label, base } = def;

  if (!isValidThemeName(name)) {
    throw invalid(
      `defineTheme: "name" must be lowercase letters, digits and dashes; got ${String(name)}.`,
    );
  }
  if (RESERVED_THEME_NAMES.includes(name)) {
    throw invalid(`defineTheme: "${name}" is a built-in theme name and cannot be redefined.`);
  }
  if (typeof label !== 'string' || label.trim() === '') {
    throw invalid(`defineTheme: theme "${name}" needs a non-empty "label".`);
  }
  if (base !== 'light' && base !== 'dark') {
    throw invalid(`defineTheme: "base" must be 'light' or 'dark'; got ${String(base)}.`);
  }

  const overrides: Partial<Record<TokenName, string>> = { ...def.tokens };
  if (def.fonts?.sans !== undefined) overrides['font-sans'] = def.fonts.sans;
  if (def.fonts?.display !== undefined) overrides['font-display'] = def.fonts.display;
  if (def.fonts?.mono !== undefined) overrides['font-mono'] = def.fonts.mono;
  if (def.radius !== undefined) overrides.radius = def.radius;

  const tokens: Record<TokenName, string> = { ...basePalette(base).tokens };
  for (const [token, value] of Object.entries(overrides)) {
    if (!isTokenName(token)) {
      throw invalid(`defineTheme: theme "${name}" sets unknown token "${token}".`);
    }
    if (typeof value !== 'string' || value.trim() === '' || UNSAFE_VALUE.test(value)) {
      throw invalid(
        `defineTheme: theme "${name}" has an empty or unsafe value for token "${token}".`,
      );
    }
    tokens[token] = value.trim();
  }

  return Object.freeze({
    name,
    label: label.trim(),
    base,
    tokens: Object.freeze(tokens),
  });
}

/** True when `name` can be used as a theme name (lowercase letters, digits, dashes). @internal */
export function isValidThemeName(name: unknown): name is string {
  return typeof name === 'string' && NAME_PATTERN.test(name);
}

function isTokenName(value: string): value is TokenName {
  return (TOKEN_NAMES as readonly string[]).includes(value);
}

function invalid(message: string): ThemeError {
  return new ThemeError('INVALID_THEME', message);
}
