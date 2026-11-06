/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import themeCss from '../../styles/theme.css?raw';
import { TOKEN_NAMES } from '../tokens';
import {
  BUILT_IN_THEMES,
  basePalette,
  INTEGR8_THEME_NAMES,
  RESERVED_THEME_NAMES,
} from './builtInThemes';
import { darkTheme } from './dark';
import { integr8Theme } from './integr8';
import { integr8LightTheme } from './integr8Light';
import { lightTheme } from './light';

/** Reads the first `[data-theme="<name>"] { ... }` block of theme.css into a map. */
function readCssBlock(name: string): Map<string, string> {
  const start = themeCss.indexOf(`[data-theme="${name}"] {`);
  expect(start, `theme.css has no block for "${name}"`).toBeGreaterThanOrEqual(0);
  const open = themeCss.indexOf('{', start);
  const close = themeCss.indexOf('}', open);
  const declarations = new Map<string, string>();
  for (const part of themeCss.slice(open + 1, close).split(';')) {
    const colon = part.indexOf(':');
    if (colon === -1) continue;
    declarations.set(part.slice(0, colon).trim(), normalize(part.slice(colon + 1)));
  }
  return declarations;
}

/** Ignores formatting differences (line breaks, quote style). */
function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/"/g, "'").trim();
}

describe('built-in themes', () => {
  it('ships light, dark, integr8 and integr8-light in menu order', () => {
    expect(BUILT_IN_THEMES.map((theme) => theme.name)).toEqual([
      'light',
      'dark',
      'integr8',
      'integr8-light',
    ]);
  });

  it('reserves the built-in names and system', () => {
    expect(RESERVED_THEME_NAMES).toEqual(['system', 'light', 'dark', 'integr8', 'integr8-light']);
  });

  it('lists both Integr8 themes as the brand family', () => {
    expect(INTEGR8_THEME_NAMES).toEqual(['integr8', 'integr8-light']);
  });

  it('builds integr8-light on the light base with the brand fonts and radius', () => {
    expect(integr8LightTheme.base).toBe('light');
    expect(integr8LightTheme.tokens['brand-3']).toBe('#c6ff3d');
    expect(integr8LightTheme.tokens.accent).toBe('#7c5cff');
    expect(integr8LightTheme.tokens.radius).toBe(integr8Theme.tokens.radius);
    expect(integr8LightTheme.tokens['font-display']).toMatch(/^'Unbounded'/);
  });

  it('uses the Integr8 variant for both brand themes in theme.css', () => {
    expect(themeCss).toMatch(
      /@custom-variant integr8 \(&:where\(\[data-theme="integr8"\] \*, \[data-theme="integr8-light"\] \*\)\);/,
    );
  });

  it.each(BUILT_IN_THEMES)('$name defines every token', (theme) => {
    expect(Object.keys(theme.tokens).sort()).toEqual([...TOKEN_NAMES].sort());
    for (const token of TOKEN_NAMES) {
      expect(theme.tokens[token].trim()).not.toBe('');
    }
  });

  it.each(BUILT_IN_THEMES)('$name matches its block in theme.css', (theme) => {
    const css = readCssBlock(theme.name);
    for (const token of TOKEN_NAMES) {
      expect(css.get(`--${token}`), `--${token} in theme "${theme.name}"`).toBe(
        normalize(theme.tokens[token]),
      );
    }
    expect(css.get('color-scheme')).toBe(theme.base);
  });

  it('uses light as the :root default in theme.css', () => {
    expect(themeCss).toMatch(/:root,\s*\[data-theme="light"\]\s*\{/);
  });

  it('maps the base palettes', () => {
    expect(basePalette('light')).toBe(lightTheme);
    expect(basePalette('dark')).toBe(darkTheme);
  });

  it('builds integr8 on the dark base with the website values', () => {
    expect(integr8Theme.base).toBe('dark');
    expect(integr8Theme.tokens.background).toBe('#07060b');
    expect(integr8Theme.tokens.primary).toBe('#c6ff3d');
    expect(integr8Theme.tokens.accent).toBe('#7c5cff');
    expect(integr8Theme.tokens['font-display']).toMatch(/^'Unbounded'/);
  });

  it('freezes the built-in definitions', () => {
    expect(Object.isFrozen(lightTheme)).toBe(true);
    expect(Object.isFrozen(lightTheme.tokens)).toBe(true);
  });
});
