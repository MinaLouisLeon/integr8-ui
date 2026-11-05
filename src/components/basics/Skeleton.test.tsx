import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders a hidden pulsing placeholder', () => {
    render(<Skeleton data-testid="skeleton" className="h-4 w-48" />);
    const skeleton = screen.getByTestId('skeleton');

    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
    expect(skeleton.dataset.slot).toBe('skeleton');
    expect(skeleton.className).toContain('animate-pulse');
    expect(skeleton.className).toContain('w-48');
  });
});
