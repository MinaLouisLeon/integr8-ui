import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from './Popover';

describe('Popover', () => {
  it('opens from the trigger and closes with Escape', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverAnchor>
          <span>Anchor</span>
        </PopoverAnchor>
        <PopoverTrigger>Dimensions</PopoverTrigger>
        <PopoverContent className="w-96">Set the size</PopoverContent>
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Dimensions' }));
    const content = screen.getByRole('dialog');

    expect(content.textContent).toBe('Set the size');
    expect(content.className).toContain('w-96');
    expect(content.className).not.toMatch(/(^|\s)w-72(\s|$)/);

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
