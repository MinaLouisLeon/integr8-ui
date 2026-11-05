import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders a status announced as Loading', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status', { name: 'Loading' });

    expect(spinner.getAttribute('data-slot')).toBe('spinner');
    expect(spinner.getAttribute('class')).toContain('animate-spin');
  });

  it('accepts a custom label and size', () => {
    render(<Spinner aria-label="Saving" className="size-6" />);
    const spinner = screen.getByRole('status', { name: 'Saving' });

    expect(spinner.getAttribute('class')).toContain('size-6');
    expect(spinner.getAttribute('class')).not.toMatch(/(^|\s)size-4(\s|$)/);
  });
});
