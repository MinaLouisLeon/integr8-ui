import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

describe('Switch', () => {
  it('toggles on click and with Space', async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch aria-label="Wi-Fi" onCheckedChange={onCheckedChange} className="extra" />);
    const toggle = screen.getByRole('switch', { name: 'Wi-Fi' });

    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(toggle.className).toContain('extra');

    await user.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    await user.keyboard(' ');
    expect(toggle.getAttribute('aria-checked')).toBe('false');
  });

  it('respects defaultChecked and disabled', async () => {
    render(<Switch aria-label="Locked" defaultChecked disabled />);
    const toggle = screen.getByRole('switch');

    await userEvent.setup().click(toggle);

    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });
});
