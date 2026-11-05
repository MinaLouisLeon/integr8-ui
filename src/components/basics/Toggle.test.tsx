import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Toggle, toggleStyles } from './Toggle';

describe('Toggle', () => {
  it('switches between pressed and not pressed', async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    const toggle = screen.getByRole('button', { name: 'Bold' });

    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    await user.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(toggle.dataset.state).toBe('on');
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it('applies variant and size classes', () => {
    render(
      <Toggle variant="outline" size="lg" aria-label="Italic">
        I
      </Toggle>,
    );
    const { className } = screen.getByRole('button');

    expect(className).toContain('border-input');
    expect(className).toContain('h-10');
  });
});

describe('toggleStyles', () => {
  it('returns the default classes without options', () => {
    expect(toggleStyles()).toContain('h-9');
    expect(toggleStyles({ size: 'sm' })).toContain('h-8');
  });
});
