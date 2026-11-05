import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeContext, type ThemeContextValue } from '../../theme/themeContext';
import { Toaster, toast } from './Toaster';

const integr8Context: ThemeContextValue = {
  theme: 'integr8',
  resolvedTheme: 'integr8',
  base: 'dark',
  themes: [],
  setTheme: () => {},
};

afterEach(() => {
  act(() => {
    toast.dismiss();
  });
});

function toaster(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-sonner-toaster]');
}

describe('Toaster', () => {
  it('shows a toast with its description', async () => {
    render(<Toaster theme="light" />);

    act(() => {
      toast('Saved', { description: 'All changes are stored.' });
    });

    expect(await screen.findByText('Saved')).toBeTruthy();
    expect(screen.getByText('All changes are stored.')).toBeTruthy();
  });

  it('maps its colors to the theme tokens', async () => {
    render(<Toaster theme="light" className="extra" />);

    act(() => {
      toast('Hello');
    });
    await screen.findByText('Hello');

    const element = toaster();
    expect(element?.className).toContain('extra');
    expect(element?.style.getPropertyValue('--normal-bg')).toBe('var(--popover)');
    expect(element?.style.getPropertyValue('--normal-border')).toBe('var(--border)');
    expect(element?.style.getPropertyValue('--border-radius')).toBe('var(--radius)');
  });

  it('uses the base of the resolved theme from ThemeProvider', async () => {
    render(
      <ThemeContext.Provider value={integr8Context}>
        <Toaster />
      </ThemeContext.Provider>,
    );

    act(() => {
      toast('Dark toast');
    });
    await screen.findByText('Dark toast');

    expect(toaster()?.dataset.sonnerTheme).toBe('dark');
  });

  it('lets an explicit theme win over the provider', async () => {
    render(
      <ThemeContext.Provider value={integr8Context}>
        <Toaster theme="light" />
      </ThemeContext.Provider>,
    );

    act(() => {
      toast('Light toast');
    });
    await screen.findByText('Light toast');

    expect(toaster()?.dataset.sonnerTheme).toBe('light');
  });

  it('colors the type icons with the status tokens', async () => {
    render(<Toaster theme="light" />);

    act(() => {
      toast.success('Done');
      toast.error('Broken');
    });
    await screen.findByText('Done');
    await screen.findByText('Broken');

    const icons = Array.from(document.querySelectorAll('[data-icon] svg')).map((svg) =>
      svg.getAttribute('class'),
    );
    expect(icons.some((value) => value?.includes('text-success'))).toBe(true);
    expect(icons.some((value) => value?.includes('text-destructive'))).toBe(true);
  });
});
