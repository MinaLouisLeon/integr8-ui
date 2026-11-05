import { type ThemeDefinition, TOKEN_NAMES } from './tokens';

/**
 * Builds the CSS rule for a custom theme: every token as a CSS variable, scoped to
 * `[data-theme="<name>"]`. Built-in themes live in `theme.css` and are not generated here.
 *
 * @internal
 */
export function themeToCss(theme: ThemeDefinition): string {
  const lines = TOKEN_NAMES.map((token) => `  --${token}: ${theme.tokens[token]};`);
  lines.push(`  color-scheme: ${theme.base};`);
  return `[data-theme="${theme.name}"] {\n${lines.join('\n')}\n}`;
}

/** CSS for a list of custom themes, one rule each. @internal */
export function themesToCss(themes: readonly ThemeDefinition[]): string {
  return themes.map(themeToCss).join('\n');
}
