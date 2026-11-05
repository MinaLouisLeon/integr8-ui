import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';

describe('Tooltip', () => {
  it('shows on keyboard focus and hides with Escape', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip>
        <TooltipTrigger>Settings</TooltipTrigger>
        <TooltipContent className="extra">Open settings</TooltipContent>
      </Tooltip>,
    );

    await user.tab();
    const tooltip = await screen.findByRole('tooltip');

    expect(tooltip.textContent).toBe('Open settings');
    const content = document.querySelector('[data-slot="tooltip-content"]');
    expect(content?.className).toContain('extra');
    expect(content?.className).toContain('bg-foreground');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('works inside a shared TooltipProvider', () => {
    render(
      <TooltipProvider delayDuration={300}>
        <Tooltip open>
          <TooltipTrigger>A</TooltipTrigger>
          <TooltipContent>Tip A</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.getByRole('tooltip').textContent).toBe('Tip A');
  });
});
