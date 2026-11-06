import { afterEach, describe, expect, it, vi } from 'vitest';
import { getThemeScript } from './themeScript';

const root = document.documentElement;
const originalMatchMedia = window.matchMedia;

function run(script: string): void {
  // The script is meant for an inline <script> tag; run it the same way here.
  new Function(script)();
}

function mockPrefersDark(matches: boolean): void {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  window.localStorage.clear();
  root.removeAttribute('data-theme');
  root.classList.remove('dark');
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe('getThemeScript', () => {
  it('applies the saved theme and the dark class', () => {
    window.localStorage.setItem('integr8-theme', 'integr8');
    run(getThemeScript());

    expect(root.getAttribute('data-theme')).toBe('integr8');
    expect(root.classList.contains('dark')).toBe(true);
  });

  it('knows integr8-light as a light-based built-in theme', () => {
    root.classList.add('dark');
    window.localStorage.setItem('integr8-theme', 'integr8-light');
    run(getThemeScript());

    expect(root.getAttribute('data-theme')).toBe('integr8-light');
    expect(root.classList.contains('dark')).toBe(false);
  });

  it('removes the dark class for a light theme', () => {
    root.classList.add('dark');
    window.localStorage.setItem('integr8-theme', 'light');
    run(getThemeScript());

    expect(root.getAttribute('data-theme')).toBe('light');
    expect(root.classList.contains('dark')).toBe(false);
  });

  it('resolves system through prefers-color-scheme', () => {
    mockPrefersDark(true);
    run(getThemeScript());

    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.classList.contains('dark')).toBe(true);

    mockPrefersDark(false);
    run(getThemeScript());
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(root.classList.contains('dark')).toBe(false);
  });

  it('uses defaultTheme when nothing is saved', () => {
    run(getThemeScript({ defaultTheme: 'integr8' }));

    expect(root.getAttribute('data-theme')).toBe('integr8');
  });

  it('falls back to defaultTheme for an unknown saved value', () => {
    window.localStorage.setItem('integr8-theme', 'constructor');
    run(getThemeScript({ defaultTheme: 'dark' }));

    expect(root.getAttribute('data-theme')).toBe('dark');
  });

  it('leaves the page alone when the default is a custom theme it does not know', () => {
    run(getThemeScript({ defaultTheme: 'ocean' }));

    expect(root.hasAttribute('data-theme')).toBe(false);
  });

  it('reads a custom storage key', () => {
    window.localStorage.setItem('my-key', 'dark');
    run(getThemeScript({ storageKey: 'my-key', defaultTheme: 'light' }));

    expect(root.getAttribute('data-theme')).toBe('dark');
  });

  it('does not throw when storage and matchMedia are missing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    window.matchMedia = undefined as unknown as typeof window.matchMedia;

    expect(() => run(getThemeScript())).not.toThrow();
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('cannot be broken out of the script tag', () => {
    const script = getThemeScript({ storageKey: '</script><script>alert(1)</script>' });

    expect(script).not.toContain('</script>');
    expect(script).not.toContain('<script>');
  });
});
