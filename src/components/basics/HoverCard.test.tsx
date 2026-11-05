import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './HoverCard';

describe('HoverCard', () => {
  it('renders its content in a portal when open', () => {
    render(
      <HoverCard open>
        <HoverCardTrigger href="/u/mina">@mina</HoverCardTrigger>
        <HoverCardContent className="extra">Designer at Integr8.</HoverCardContent>
      </HoverCard>,
    );
    const content = screen.getByText('Designer at Integr8.');

    expect(screen.getByRole('link', { name: '@mina' }).dataset.slot).toBe('hover-card-trigger');
    expect(content.dataset.slot).toBe('hover-card-content');
    expect(content.className).toContain('bg-popover');
    expect(content.className).toContain('extra');
  });

  it('renders nothing when closed', () => {
    render(
      <HoverCard>
        <HoverCardTrigger href="#">@mina</HoverCardTrigger>
        <HoverCardContent>Hidden</HoverCardContent>
      </HoverCard>,
    );

    expect(screen.queryByText('Hidden')).toBeNull();
  });
});
