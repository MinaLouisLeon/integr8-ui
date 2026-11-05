import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

describe('RadioGroup', () => {
  it('picks one item at a time', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RadioGroup defaultValue="monthly" onValueChange={onValueChange} className="extra">
        <RadioGroupItem value="monthly" aria-label="Monthly" />
        <RadioGroupItem value="yearly" aria-label="Yearly" />
      </RadioGroup>,
    );
    const monthly = screen.getByRole('radio', { name: 'Monthly' });
    const yearly = screen.getByRole('radio', { name: 'Yearly' });

    expect(screen.getByRole('radiogroup').className).toContain('extra');
    expect(monthly.getAttribute('aria-checked')).toBe('true');

    await user.click(yearly);

    expect(yearly.getAttribute('aria-checked')).toBe('true');
    expect(monthly.getAttribute('aria-checked')).toBe('false');
    expect(onValueChange).toHaveBeenCalledWith('yearly');
  });
});
