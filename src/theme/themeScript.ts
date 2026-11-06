import type { ThemeName } from './themeContext';
import { DEFAULT_STORAGE_KEY } from './themeStorage';
import { BUILT_IN_THEMES, SYSTEM_THEME } from './themes/builtInThemes';

/** Options for {@link getThemeScript}. */
export interface ThemeScriptOptions {
  /** localStorage key to read. Default `'integr8-theme'`, the key the default storage uses. */
  storageKey?: string;
  /** Theme used when nothing is saved. Default `'system'`. Match `ThemeProvider`'s value. */
  defaultTheme?: ThemeName;
}

/**
 * Returns a tiny inline script that applies the saved theme before the first paint, so
 * server-rendered apps do not flash the wrong theme. Put it in `<head>` and add
 * `suppressHydrationWarning` to `<html>`, because the script changes its attributes.
 *
 * The script knows the built-in themes (`light`, `dark`, `system`, `integr8`,
 * `integr8-light`). A saved custom theme falls back to `defaultTheme` until `ThemeProvider`
 * mounts and applies it. It only reads localStorage, so apps with a custom `storage` adapter
 * get `defaultTheme` here.
 *
 * Safe to call on the server: it has no `'use client'` dependency.
 *
 * @example
 * ```tsx
 * // Next.js app/layout.tsx
 * <html lang="en" suppressHydrationWarning>
 *   <head>
 *     <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
 *   </head>
 *   <body>...</body>
 * </html>
 * ```
 */
export function getThemeScript(options: ThemeScriptOptions = {}): string {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const defaultTheme = options.defaultTheme ?? SYSTEM_THEME;
  const bases = Object.fromEntries(BUILT_IN_THEMES.map((theme) => [theme.name, theme.base]));

  // Kept ES5-ish and tiny: it runs before anything else on the page.
  return [
    '(function(){try{',
    `var k=${toScriptLiteral(storageKey)},d=${toScriptLiteral(defaultTheme)},b=${toScriptLiteral(bases)},t=null;`,
    'function h(x){return typeof x==="string"&&Object.prototype.hasOwnProperty.call(b,x)}',
    'try{t=localStorage.getItem(k)}catch(e){}',
    'if(t!=="system"&&!h(t))t=d;',
    'if(t==="system")t=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";',
    'if(!h(t))return;',
    'var r=document.documentElement;r.setAttribute("data-theme",t);r.classList.toggle("dark",b[t]==="dark")',
    '}catch(e){}})();',
  ].join('');
}

// Characters that could end the <script> tag or, in older engines, a line inside it.
// Built from char codes so none of them appears raw in this file.
const UNSAFE_IN_SCRIPT = new RegExp(`[<>${String.fromCharCode(0x2028, 0x2029)}]`, 'g');
const BACKSLASH = String.fromCharCode(92);

/** Turns a character into a JavaScript unicode escape, for example `<` into `\u003c`. */
function escapeChar(char: string): string {
  return `${BACKSLASH}u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
}

/** JSON that is also safe inside an inline `<script>` tag. */
function toScriptLiteral(value: unknown): string {
  return JSON.stringify(value).replace(UNSAFE_IN_SCRIPT, escapeChar);
}
