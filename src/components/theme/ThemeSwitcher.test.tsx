import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type MatchMediaMock, mockMatchMedia, render as renderRaw } from '../../../test/render';
import { defineTheme } from '../../theme/defineTheme';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { ThemeError } from '../../theme/themeError';
import type { ThemeStorage } from '../../theme/themeStorage';
import { ThemeSwitcher } from './ThemeSwitcher';

const ocean = defineTheme({ name: 'ocean', label: 'Ocean', base: 'dark', tokens: {} });
const customThemes = [ocean];

let media: MatchMediaMock;

function memoryStorage(initial: string | null = null) {
  let value = initial;
  return {
    get: (): string | null => value,
    set: vi.fn((theme: string): void => {
      value = theme;
    }),
  } satisfies ThemeStorage;
}

beforeEach(() => {
  media = mockMatchMedia(false);
});

afterEach(() => {
  media.restore();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.classList.remove('dark');
});

async function openMenu(name: RegExp) {
  const user = userEvent.setup();
  screen.getByRole('button', { name }).focus();
  await user.keyboard('{Enter}');
  return user;
}

describe('ThemeSwitcher', () => {
  it('lists System, the four built-in themes and registered ones', async () => {
    render(
      <ThemeProvider storage={memoryStorage()} themes={customThemes}>
        <ThemeSwitcher />
      </ThemeProvider>,
    );
    await openMenu(/Theme/);

    expect(screen.getAllByRole('menuitemradio').map((item) => item.textContent)).toEqual([
      'System',
      'Light',
      'Dark',
      'Integr8',
      'Integr8 Light',
      'Ocean',
    ]);
    expect(screen.getByRole('menuitemradio', { name: 'System' }).getAttribute('aria-checked')).toBe(
      'true',
    );
  });

  it('names the button after the picked theme', () => {
    render(
      <ThemeProvider storage={memoryStorage('integr8')}>
        <ThemeSwitcher label="Appearance" />
      </ThemeProvider>,
    );

    expect(screen.getByRole('button', { name: 'Appearance: Integr8' })).toBeTruthy();
  });

  it('switches and saves the theme', async () => {
    const storage = memoryStorage();
    render(
      <ThemeProvider storage={storage}>
        <ThemeSwitcher />
      </ThemeProvider>,
    );
    const user = await openMenu(/Theme/);

    await user.click(screen.getByRole('menuitemradio', { name: 'Integr8 Light' }));

    expect(document.documentElement.dataset.theme).toBe('integr8-light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(storage.set).toHaveBeenCalledWith('integr8-light');
    expect(screen.getByRole('button', { name: 'Theme: Integr8 Light' })).toBeTruthy();
  });

  it('shows the theme name with showLabel and uses the custom system label', () => {
    render(
      <ThemeProvider storage={memoryStorage()}>
        <ThemeSwitcher showLabel systemLabel="Automatic" className="extra" />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', { name: 'Automatic' });
    expect(button.className).toContain('extra');
    expect(button.dataset.slot).toBe('theme-switcher');
  });

  it('throws MISSING_PROVIDER outside a ThemeProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { error, unmount } = renderRaw(<ThemeSwitcher />);
    expect(error()).toBeInstanceOf(ThemeError);
    expect((error() as ThemeError).code).toBe('MISSING_PROVIDER');
    unmount();
  });
});
