/**
 * Every CSS variable a theme defines, without the leading `--`.
 * Each theme sets all of them, so components can rely on any token being present.
 */
export const TOKEN_NAMES = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'success',
  'warning',
  'info',
  'border',
  'input',
  'ring',
  'brand-1',
  'brand-2',
  'brand-3',
  'brand-4',
  'radius',
  'font-sans',
  'font-display',
  'font-mono',
] as const;

/** Name of a theme token (a CSS variable without the leading `--`), for example `'primary'`. */
export type TokenName = (typeof TOKEN_NAMES)[number];

/** A full set of token values: one value for every {@link TokenName}. */
export type ThemeTokens = Readonly<Record<TokenName, string>>;

/** The two bases a theme can build on. Dark-based themes get the `dark` class. */
export type ThemeBase = 'light' | 'dark';

/**
 * A theme ready to be used by {@link ThemeProvider}. Create custom ones with {@link defineTheme}.
 */
export interface ThemeDefinition {
  /** Unique name, used as the `data-theme` value. Lowercase letters, digits and dashes. */
  readonly name: string;
  /** Human-readable name, shown in the theme switcher. */
  readonly label: string;
  /** The palette the theme builds on. Decides whether the `dark` class is set. */
  readonly base: ThemeBase;
  /** Every token value, with missing ones already filled in from the base palette. */
  readonly tokens: ThemeTokens;
}

/** Font stacks shared by the built-in themes. */
export const FONT_STACKS: {
  readonly sans: string;
  readonly display: string;
  readonly mono: string;
} = {
  sans: "'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif",
  display: "'Unbounded', 'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
};
