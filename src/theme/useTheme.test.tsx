import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '../../test/render';
import { ThemeError } from './themeError';
import { useTheme } from './useTheme';

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
