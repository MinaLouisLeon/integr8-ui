import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Slider, thumbCount } from './Slider';

describe('Slider', () => {
  it('renders one thumb by default and moves with the arrow keys', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<Slider defaultValue={[50]} aria-label="Volume" onValueChange={onValueChange} />);
    const thumb = screen.getByRole('slider');

    expect(thumb.getAttribute('aria-valuenow')).toBe('50');

    thumb.focus();
    await user.keyboard('{ArrowRight}');

    expect(thumb.getAttribute('aria-valuenow')).toBe('51');
    expect(onValueChange).toHaveBeenCalledWith([51]);
  });

  it('renders one thumb per value for a range', () => {
    render(<Slider defaultValue={[20, 80]} aria-label="Price" />);
    expect(screen.getAllByRole('slider')).toHaveLength(2);
  });

  it('renders thumbs for a controlled value and merges className', () => {
    const { container } = render(<Slider value={[1, 2, 3]} className="w-60" />);

    expect(screen.getAllByRole('slider')).toHaveLength(3);
    expect(container.querySelector('[data-slot="slider"]')?.className).toContain('w-60');
  });
});

describe('thumbCount', () => {
  it('counts value first, then defaultValue, and never less than one', () => {
    expect(thumbCount([1, 2], [1])).toBe(2);
    expect(thumbCount(undefined, [1, 2, 3])).toBe(3);
    expect(thumbCount(undefined, undefined)).toBe(1);
    expect(thumbCount([], undefined)).toBe(1);
  });
});
