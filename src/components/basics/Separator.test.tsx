import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Separator } from './Separator';

describe('Separator', () => {
  it('is decorative and horizontal by default', () => {
    render(<Separator data-testid="line" />);
    const line = screen.getByTestId('line');

    expect(line.getAttribute('role')).toBe('none');
    expect(line.dataset.orientation).toBe('horizontal');
    expect(line.className).toContain('bg-border');
  });

  it('is announced when not decorative', () => {
    render(<Separator decorative={false} orientation="vertical" />);
    const line = screen.getByRole('separator');

    expect(line.getAttribute('aria-orientation')).toBe('vertical');
    expect(line.dataset.orientation).toBe('vertical');
  });
});
