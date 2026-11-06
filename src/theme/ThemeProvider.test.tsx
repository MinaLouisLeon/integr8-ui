import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, type MatchMediaMock, mockMatchMedia, render } from '../../test/render';
import { defineTheme } from './defineTheme';
import { CUSTOM_THEMES_STYLE_ATTRIBUTE, ThemeProvider } from './ThemeProvider';
import type { ThemeContextValue } from './themeContext';
import { ThemeError } from './themeError';
import type { ThemeStorage } from './themeStorage';
import { useTheme } from './useTheme';

const root = document.documentElement;
let media: MatchMediaMock;
let current: ThemeContextValue;

function Probe(): null {
  current = useTheme();
  return null;
}

const ocean = defineTheme({
  name: 'ocean',
  label: 'Ocean',
  base: 'dark',
  tokens: { primary: '#0ea5e9' },
});
const paper = defineTheme({ name: 'paper', label: 'Paper', base: 'light', tokens: {} });

function memoryStorage(initial: string | null = null) {
  let value = initial;
  return {
    get: (): string | null => value,
    set: vi.fn((theme: string): void => {
      value = theme;
    }),
  };
}

beforeEach(() => {
  media = mockMatchMedia(false);
});

afterEach(() => {
  cleanup();
  media.restore();
  window.localStorage.clear();
  root.removeAttribute('data-theme');
  root.classList.remove('dark');
  vi.restoreAllMocks();
  for (const style of document.head.querySelectorAll(`[${CUSTOM_THEMES_STYLE_ATTRIBUTE}]`)) {
    style.remove();
  }
});

describe('ThemeProvider', () => {
  describe('system theme', () => {
    it('defaults to system and resolves to light on a light OS', () => {
      render(
        <ThemeProvider>
          <Probe />
        </ThemeProvider>,
      );

      expect(current.theme).toBe('system');
      expect(current.resolvedTheme).toBe('light');
      expect(current.base).toBe('light');
      expect(root.getAttribute('data-theme')).toBe('light');
      expect(root.classList.contains('dark')).toBe(false);
    });

    it('resolves to dark on a dark OS', () => {
      media.setDark(true);
      render(
        <ThemeProvider>
          <Probe />
        </ThemeProvider>,
      );

      expect(current.resolvedTheme).toBe('dark');
      expect(root.getAttribute('data-theme')).toBe('dark');
      expect(root.classList.contains('dark')).toBe(true);
    });

    it('follows a live OS change', () => {
      render(
        <ThemeProvider>
          <Probe />
        </ThemeProvider>,
      );

      act(() => media.setDark(true));
      expect(current.theme).toBe('system');
      expect(current.resolvedTheme).toBe('dark');
      expect(root.classList.contains('dark')).toBe(true);

      act(() => media.setDark(false));
      expect(current.resolvedTheme).toBe('light');
      expect(root.classList.contains('dark')).toBe(false);
    });

    it('ignores OS changes when a fixed theme is picked', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <Probe />
        </ThemeProvider>,
      );

      act(() => media.setDark(true));
      expect(current.resolvedTheme).toBe('light');
      expect(root.classList.contains('dark')).toBe(false);
    });
  });

  describe('setTheme', () => {
    it('applies data-theme and the dark class for dark-based themes', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <Probe />
        </ThemeProvider>,
      );

      act(() => current.setTheme('integr8'));
      expect(current.theme).toBe('integr8');
      expect(current.resolvedTheme).toBe('integr8');
      expect(current.base).toBe('dark');
      expect(root.getAttribute('data-theme')).toBe('integr8');
      expect(root.classList.contains('dark')).toBe(true);

      act(() => current.setTheme('light'));
      expect(root.getAttribute('data-theme')).toBe('light');
      expect(root.classList.contains('dark')).toBe(false);
    });

    it('applies integr8-light as a light-based theme', () => {
      render(
        <ThemeProvider defaultTheme="integr8">
          <Probe />
        </ThemeProvider>,
      );
      expect(root.classList.contains('dark')).toBe(true);

      act(() => current.setTheme('integr8-light'));
      expect(current.resolvedTheme).toBe('integr8-light');
      expect(current.base).toBe('light');
      expect(root.getAttribute('data-theme')).toBe('integr8-light');
      expect(root.classList.contains('dark')).toBe(false);
    });

    it('saves to localStorage under integr8-theme by default', () => {
      render(
        <ThemeProvider>
          <Probe />
        </ThemeProvider>,
      );

      act(() => current.setTheme('dark'));
      expect(window.localStorage.getItem('integr8-theme')).toBe('dark');
    });

    it('throws UNKNOWN_THEME for a name that is not registered', () => {
      render(
        <ThemeProvider>
          <Probe />
        </ThemeProvider>,
      );

      expect(() => current.setTheme('neon')).toThrow(ThemeError);
      try {
        current.setTheme('neon');
      } catch (error) {
        expect((error as ThemeError).code).toBe('UNKNOWN_THEME');
      }
    });
  });

  describe('storage', () => {
    it('starts with the theme saved in localStorage', () => {
      window.localStorage.setItem('integr8-theme', 'integr8');
      render(
        <ThemeProvider>
          <Probe />
        </ThemeProvider>,
      );

      expect(current.theme).toBe('integr8');
      expect(root.getAttribute('data-theme')).toBe('integr8');
    });

    it('falls back to the default for an unknown saved theme', () => {
      window.localStorage.setItem('integr8-theme', 'removed-theme');
      render(
        <ThemeProvider defaultTheme="dark">
          <Probe />
        </ThemeProvider>,
      );

      expect(current.theme).toBe('dark');
      expect(root.getAttribute('data-theme')).toBe('dark');
    });

    it('reads and writes through a sync adapter', () => {
      const storage = memoryStorage('dark');
      render(
        <ThemeProvider storage={storage}>
          <Probe />
        </ThemeProvider>,
      );

      expect(current.theme).toBe('dark');
      act(() => current.setTheme('integr8'));
      expect(storage.set).toHaveBeenCalledWith('integr8');
      expect(window.localStorage.getItem('integr8-theme')).toBeNull();
    });

    it('applies the result of an async adapter when it resolves', async () => {
      const storage: ThemeStorage = {
        get: () => Promise.resolve('integr8'),
        set: () => Promise.resolve(),
      };
      render(
        <ThemeProvider defaultTheme="light" storage={storage}>
          <Probe />
        </ThemeProvider>,
      );

      expect(current.theme).toBe('light');
      await act(async () => {});
      expect(current.theme).toBe('integr8');
      expect(root.getAttribute('data-theme')).toBe('integr8');
    });

    it('does not let a late async load override a theme the user picked', async () => {
      let resolveLoad: (theme: string | null) => void = () => {};
      const storage: ThemeStorage = {
        get: () =>
          new Promise((resolve) => {
            resolveLoad = resolve;
          }),
        set: () => {},
      };
      render(
        <ThemeProvider defaultTheme="light" storage={storage}>
          <Probe />
        </ThemeProvider>,
      );

      act(() => current.setTheme('dark'));
      await act(async () => resolveLoad('integr8'));
      expect(current.theme).toBe('dark');
    });

    it('keeps the default when the adapter fails', async () => {
      const storage: ThemeStorage = {
        get: () => Promise.reject(new Error('offline')),
        set: () => Promise.reject(new Error('offline')),
      };
      render(
        <ThemeProvider defaultTheme="dark" storage={storage}>
          <Probe />
        </ThemeProvider>,
      );

      await act(async () => {});
      expect(current.theme).toBe('dark');
      expect(() => act(() => current.setTheme('light'))).not.toThrow();
      await act(async () => {});
      expect(current.theme).toBe('light');
    });

    it('keeps the default when the adapter throws synchronously', () => {
      const storage: ThemeStorage = {
        get: () => {
          throw new Error('broken');
        },
        set: () => {
          throw new Error('broken');
        },
      };
      render(
        <ThemeProvider defaultTheme="integr8" storage={storage}>
          <Probe />
        </ThemeProvider>,
      );

      expect(current.theme).toBe('integr8');
      act(() => current.setTheme('dark'));
      expect(current.theme).toBe('dark');
    });
  });

  describe('custom themes', () => {
    it('lists built-ins first, then custom themes', () => {
      render(
        <ThemeProvider themes={[ocean, paper]}>
          <Probe />
        </ThemeProvider>,
      );

      expect(current.themes.map((theme) => theme.name)).toEqual([
        'light',
        'dark',
        'integr8',
        'integr8-light',
        'ocean',
        'paper',
      ]);
    });

    it('applies a custom theme with the dark class from its base', () => {
      const themes = [ocean, paper];
      render(
        <ThemeProvider themes={themes}>
          <Probe />
        </ThemeProvider>,
      );

      act(() => current.setTheme('ocean'));
      expect(current.resolvedTheme).toBe('ocean');
      expect(current.base).toBe('dark');
      expect(root.getAttribute('data-theme')).toBe('ocean');
      expect(root.classList.contains('dark')).toBe(true);

      act(() => current.setTheme('paper'));
      expect(root.classList.contains('dark')).toBe(false);
    });

    it('injects one style tag with the custom theme CSS and removes it on unmount', () => {
      const view = render(
        <ThemeProvider themes={[ocean]}>
          <Probe />
        </ThemeProvider>,
      );

      const styles = document.head.querySelectorAll(`style[${CUSTOM_THEMES_STYLE_ATTRIBUTE}]`);
      expect(styles).toHaveLength(1);
      expect(styles[0]?.textContent).toContain('[data-theme="ocean"]');
      expect(styles[0]?.textContent).toContain('--primary: #0ea5e9;');

      view.unmount();
      expect(document.head.querySelector(`style[${CUSTOM_THEMES_STYLE_ATTRIBUTE}]`)).toBeNull();
    });

    it('adds no style tag without custom themes', () => {
      render(
        <ThemeProvider>
          <Probe />
        </ThemeProvider>,
      );

      expect(document.head.querySelector(`style[${CUSTOM_THEMES_STYLE_ATTRIBUTE}]`)).toBeNull();
    });

    it('accepts a custom theme as defaultTheme', () => {
      render(
        <ThemeProvider defaultTheme="ocean" themes={[ocean]}>
          <Probe />
        </ThemeProvider>,
      );

      expect(root.getAttribute('data-theme')).toBe('ocean');
    });

    it('rejects a theme registered twice', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const view = render(<ThemeProvider themes={[ocean, ocean]}>{null}</ThemeProvider>);

      expect(view.error()).toBeInstanceOf(ThemeError);
      expect((view.error() as ThemeError).code).toBe('INVALID_THEME');
    });

    it('rejects a hand-made theme with a reserved or invalid name', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const fake = { ...ocean, name: 'dark' };
      const view = render(<ThemeProvider themes={[fake]}>{null}</ThemeProvider>);

      expect((view.error() as ThemeError).code).toBe('INVALID_THEME');
    });
  });

  describe('defaultTheme and target', () => {
    it('throws UNKNOWN_THEME for an unregistered defaultTheme', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const view = render(<ThemeProvider defaultTheme="neon">{null}</ThemeProvider>);

      expect(view.error()).toBeInstanceOf(ThemeError);
      expect((view.error() as ThemeError).code).toBe('UNKNOWN_THEME');
    });

    it('applies the theme to a custom target only', () => {
      const target = document.createElement('div');
      document.body.append(target);
      render(
        <ThemeProvider defaultTheme="integr8" target={target}>
          <Probe />
        </ThemeProvider>,
      );

      expect(target.getAttribute('data-theme')).toBe('integr8');
      expect(target.classList.contains('dark')).toBe(true);
      expect(root.hasAttribute('data-theme')).toBe(false);
    });
  });
});
