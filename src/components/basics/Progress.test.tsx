import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress, toPercent } from './Progress';

function indicator(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[data-slot="progress-indicator"]');
  if (element === null) throw new Error('no indicator');
  return element;
}

describe('Progress', () => {
  it('renders a progressbar and moves the indicator', () => {
    render(<Progress value={60} aria-label="Upload" className="h-1" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });

    expect(bar.getAttribute('aria-valuenow')).toBe('60');
    expect(bar.className).toContain('h-1');
    expect(indicator().style.transform).toBe('translateX(-40%)');
  });

  it('uses max to compute the percentage', () => {
    render(<Progress value={1} max={4} aria-label="Steps" />);
    expect(indicator().style.transform).toBe('translateX(-75%)');
  });

  it('shows an empty bar for an unknown value', () => {
    render(<Progress value={null} aria-label="Waiting" />);

    expect(screen.getByRole('progressbar').dataset.state).toBe('indeterminate');
    expect(indicator().style.transform).toBe('translateX(-100%)');
  });
});

describe('toPercent', () => {
  it.each([
    [50, undefined, 50],
    [5, 10, 50],
    [150, 100, 100],
    [-5, 100, 0],
    [null, 100, 0],
    [undefined, undefined, 0],
    [Number.NaN, 100, 0],
    [50, 0, 50],
  ])('toPercent(%s, %s) is %s', (value, max, expected) => {
    expect(toPercent(value, max)).toBe(expected);
  });
});
