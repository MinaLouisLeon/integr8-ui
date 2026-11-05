import { describe, expect, it } from 'vitest';
import { defineTheme } from './defineTheme';
import { themesToCss, themeToCss } from './themeCss';
import { TOKEN_NAMES } from './tokens';

const ocean = defineTheme({
  name: 'ocean',
  label: 'Ocean',
  base: 'dark',
  tokens: { primary: '#0ea5e9' },
});

describe('themeToCss', () => {
  it('scopes every token to the theme name', () => {
    const css = themeToCss(ocean);

    expect(css.startsWith('[data-theme="ocean"] {')).toBe(true);
    expect(css.endsWith('}')).toBe(true);
    for (const token of TOKEN_NAMES) {
      expect(css).toContain(`--${token}: ${ocean.tokens[token]};`);
    }
    expect(css).toContain('color-scheme: dark;');
  });
});

describe('themesToCss', () => {
  it('returns one rule per theme', () => {
    const paper = defineTheme({ name: 'paper', label: 'Paper', base: 'light', tokens: {} });
    const css = themesToCss([ocean, paper]);

    expect(css).toContain('[data-theme="ocean"]');
    expect(css).toContain('[data-theme="paper"]');
    expect(css).toContain('color-scheme: light;');
  });

  it('returns an empty string for no themes', () => {
    expect(themesToCss([])).toBe('');
  });
});
