import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';
import { Label } from './Label';

describe('Checkbox', () => {
  it('toggles when clicked or when its label is clicked', async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Label>
        <Checkbox onCheckedChange={onCheckedChange} />
        Accept
      </Label>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Accept' });

    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    await user.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    await user.click(screen.getByText('Accept'));
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles with the Space key', async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Notify" />);

    await user.tab();
    await user.keyboard(' ');

    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
  });

  it('shows the indeterminate state', () => {
    render(<Checkbox aria-label="All" checked="indeterminate" />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
    expect(checkbox.dataset.state).toBe('indeterminate');
  });

  it('can be disabled', async () => {
    render(<Checkbox aria-label="Off" disabled />);
    const checkbox = screen.getByRole('checkbox') as HTMLButtonElement;

    await userEvent.setup().click(checkbox);

    expect(checkbox.disabled).toBe(true);
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
  });
});
