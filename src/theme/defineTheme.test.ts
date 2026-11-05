import { describe, expect, it } from 'vitest';
import { defineTheme, isValidThemeName } from './defineTheme';
import { ThemeError } from './themeError';
import { darkTheme } from './themes/dark';
import { lightTheme } from './themes/light';
import type { TokenName } from './tokens';

function expectInvalid(run: () => unknown): void {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(ThemeError);
    expect((error as ThemeError).code).toBe('INVALID_THEME');
    return;
  }
  throw new Error('expected defineTheme to throw');
}

describe('defineTheme', () => {
  it('fills missing tokens from the base palette', () => {
    const ocean = defineTheme({
      name: 'ocean',
      label: 'Ocean',
      base: 'dark',
      tokens: { primary: '#0ea5e9' },
    });

    expect(ocean.name).toBe('ocean');
    expect(ocean.label).toBe('Ocean');
    expect(ocean.base).toBe('dark');
    expect(ocean.tokens.primary).toBe('#0ea5e9');
    expect(ocean.tokens.background).toBe(darkTheme.tokens.background);
    expect(ocean.tokens.radius).toBe(darkTheme.tokens.radius);
  });

  it('uses the light palette for a light base', () => {
    const paper = defineTheme({ name: 'paper', label: 'Paper', base: 'light', tokens: {} });

    expect(paper.tokens).toEqual(lightTheme.tokens);
  });

  it('lets fonts and radius win over the same tokens', () => {
    const brand = defineTheme({
      name: 'brand',
      label: 'Brand',
      base: 'light',
      tokens: { 'font-sans': 'Arial', radius: '2px' },
      fonts: { sans: 'Geist, sans-serif', display: 'Fraunces, serif', mono: 'Fira Code' },
      radius: '0',
    });

    expect(brand.tokens['font-sans']).toBe('Geist, sans-serif');
    expect(brand.tokens['font-display']).toBe('Fraunces, serif');
    expect(brand.tokens['font-mono']).toBe('Fira Code');
    expect(brand.tokens.radius).toBe('0');
  });

  it('keeps tokens from `tokens` when fonts leave them out', () => {
    const brand = defineTheme({
      name: 'brand',
      label: 'Brand',
      base: 'light',
      tokens: { 'font-mono': 'Fira Code' },
      fonts: { sans: 'Geist' },
    });

    expect(brand.tokens['font-mono']).toBe('Fira Code');
    expect(brand.tokens['font-display']).toBe(lightTheme.tokens['font-display']);
  });

  it('trims values and the label', () => {
    const brand = defineTheme({
      name: 'brand',
      label: '  Brand ',
      base: 'light',
      tokens: { primary: '  red ' },
    });

    expect(brand.label).toBe('Brand');
    expect(brand.tokens.primary).toBe('red');
  });

  it('returns a frozen definition and does not change the base palette', () => {
    const brand = defineTheme({
      name: 'brand',
      label: 'Brand',
      base: 'dark',
      tokens: { primary: 'red' },
    });

    expect(Object.isFrozen(brand)).toBe(true);
    expect(Object.isFrozen(brand.tokens)).toBe(true);
    expect(darkTheme.tokens.primary).not.toBe('red');
  });

  it.each(['', 'Ocean', '1ocean', 'ocean theme', 'ocean"]', 'océan'])(
    'rejects the name %j',
    (name) => {
      expectInvalid(() => defineTheme({ name, label: 'X', base: 'light', tokens: {} }));
    },
  );

  it.each(['light', 'dark', 'system', 'integr8'])('rejects the reserved name %s', (name) => {
    expectInvalid(() => defineTheme({ name, label: 'X', base: 'light', tokens: {} }));
  });

  it('rejects an empty label', () => {
    expectInvalid(() => defineTheme({ name: 'brand', label: '  ', base: 'light', tokens: {} }));
  });

  it('rejects an unknown base', () => {
    expectInvalid(() =>
      defineTheme({ name: 'brand', label: 'Brand', base: 'sepia' as 'light', tokens: {} }),
    );
  });

  it('rejects an unknown token', () => {
    expectInvalid(() =>
      defineTheme({
        name: 'brand',
        label: 'Brand',
        base: 'light',
        tokens: { shadow: '0 0 1px' } as Partial<Record<TokenName, string>>,
      }),
    );
  });

  it.each(['', '   ', 'red; --x: 1', 'red}', '</style>'])('rejects the value %j', (value) => {
    expectInvalid(() =>
      defineTheme({ name: 'brand', label: 'Brand', base: 'light', tokens: { primary: value } }),
    );
  });
});

describe('isValidThemeName', () => {
  it('accepts lowercase letters, digits and dashes starting with a letter', () => {
    expect(isValidThemeName('ocean-2')).toBe(true);
    expect(isValidThemeName('Ocean')).toBe(false);
    expect(isValidThemeName(42)).toBe(false);
  });
});
