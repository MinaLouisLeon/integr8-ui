import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '../../test/render';
import { ThemeProvider } from './ThemeProvider';
import type { ThemeContextValue } from './themeContext';
import { ThemeError } from './themeError';
import type { ThemeStorage } from './themeStorage';
import { useOptionalTheme, useTheme } from './useTheme';

function Orphan(): null {
  useTheme();
  return null;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useTheme', () => {
  it('throws MISSING_PROVIDER outside a ThemeProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const view = render(<Orphan />);

    expect(view.error()).toBeInstanceOf(ThemeError);
    expect((view.error() as ThemeError).code).toBe('MISSING_PROVIDER');
  });
});

let seen: ThemeContextValue | null | undefined;

function Probe(): null {
  seen = useOptionalTheme();
  return null;
}

describe('useOptionalTheme', () => {
  it('returns null outside a ThemeProvider, without throwing', () => {
    seen = undefined;
    const view = render(<Probe />);

    expect(view.error()).toBeUndefined();
    expect(seen).toBeNull();
  });

  it('returns the provider value inside a ThemeProvider', () => {
    const storage: ThemeStorage = { get: () => null, set: () => {} };
    render(
      <ThemeProvider defaultTheme="integr8" storage={storage}>
        <Probe />
      </ThemeProvider>,
    );

    expect(seen?.resolvedTheme).toBe('integr8');
    expect(seen?.base).toBe('dark');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });
});
