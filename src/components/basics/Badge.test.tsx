import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders a span with the default variant', () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText('New');

    expect(badge.tagName).toBe('SPAN');
    expect(badge.dataset.slot).toBe('badge');
    expect(badge.className).toContain('bg-primary');
    expect(badge.className).toContain('in-data-[theme=integr8]:rounded-full');
  });

  it.each([
    ['success', 'text-success'],
    ['warning', 'text-warning'],
    ['info', 'text-info'],
    ['destructive', 'bg-destructive'],
  ] as const)('applies the %s variant', (variant, expected) => {
    render(<Badge variant={variant}>{variant}</Badge>);
    expect(screen.getByText(variant).className).toContain(expected);
  });

  it('renders its child with asChild and merges className', () => {
    render(
      <Badge asChild className="extra">
        <a href="/inbox">3</a>
      </Badge>,
    );
    const link = screen.getByRole('link', { name: '3' });

    expect(link.className).toContain('extra');
    expect(link.dataset.slot).toBe('badge');
  });
});
