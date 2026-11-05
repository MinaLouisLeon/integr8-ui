import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Shortcut } from './Shortcut';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Shortcut', () => {
  it('draws one Kbd per key, hidden from screen readers, with a spoken label', () => {
    const { container } = render(<Shortcut keys="mod+shift+p" platform="mac" className="extra" />);

    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset.slot).toBe('shortcut');
    expect(root.dataset.variant).toBe('kbd');
    expect(root.className).toContain('extra');

    const kbds = Array.from(container.querySelectorAll('kbd'));
    expect(kbds.map((kbd) => kbd.textContent)).toEqual(['⌘', '⇧', 'P']);
    expect(kbds.every((kbd) => kbd.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(screen.getByText('Command+Shift+P').className).toContain('sr-only');
  });

  it('uses Ctrl on other platforms', () => {
    const { container } = render(<Shortcut keys={['mod', 'k']} platform="other" />);

    expect(Array.from(container.querySelectorAll('kbd')).map((kbd) => kbd.textContent)).toEqual([
      'Ctrl',
      'K',
    ]);
    expect(screen.getByText('Control+K')).toBeTruthy();
  });

  it('renders plain text in the text variant', () => {
    const { container } = render(<Shortcut keys="mod+s" variant="text" platform="other" />);

    expect(container.querySelector('kbd')).toBeNull();
    expect(screen.getByText('Ctrl+S').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('Control+S').className).toContain('sr-only');
  });

  it('detects an Apple platform when none is given', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    const { container } = render(<Shortcut keys="mod+k" />);

    expect(container.querySelector('kbd')?.textContent).toBe('⌘');
  });

  it('detects a non-Apple platform when none is given', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32');
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Windows NT 10.0');
    const { container } = render(<Shortcut keys="mod+k" />);

    expect(container.querySelector('kbd')?.textContent).toBe('Ctrl');
  });
});
