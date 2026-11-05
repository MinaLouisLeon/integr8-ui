import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScrollArea, ScrollBar } from './ScrollArea';

describe('ScrollArea', () => {
  it('renders its children inside a viewport', () => {
    const { container } = render(
      <ScrollArea className="h-40">
        <p>Long content</p>
      </ScrollArea>,
    );
    const root = container.querySelector('[data-slot="scroll-area"]');
    const viewport = container.querySelector('[data-slot="scroll-area-viewport"]');

    expect(root?.className).toContain('h-40');
    expect(viewport?.contains(screen.getByText('Long content'))).toBe(true);
  });

  it('renders always-visible scrollbars in both orientations', () => {
    const { container } = render(
      <ScrollArea type="always">
        <p>Wide content</p>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>,
    );
    const bars = container.querySelectorAll('[data-slot="scroll-area-scrollbar"]');
    const orientations = [...bars].map((bar) => bar.getAttribute('data-orientation')).sort();

    expect(orientations).toEqual(['horizontal', 'vertical']);
    for (const bar of bars) {
      const horizontal = bar.getAttribute('data-orientation') === 'horizontal';
      expect(bar.className).toContain(horizontal ? 'h-2.5' : 'w-2.5');
    }
  });
});
