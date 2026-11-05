import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Kbd } from './Kbd';

describe('Kbd', () => {
  it('renders a kbd element', () => {
    render(<Kbd className="extra">Esc</Kbd>);
    const kbd = screen.getByText('Esc');

    expect(kbd.tagName).toBe('KBD');
    expect(kbd.dataset.slot).toBe('kbd');
    expect(kbd.className).toContain('bg-muted');
    expect(kbd.className).toContain('extra');
  });
});
