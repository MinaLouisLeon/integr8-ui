import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible';

describe('Collapsible', () => {
  it('shows and hides its content', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible>
        <CollapsibleTrigger>Details</CollapsibleTrigger>
        <CollapsibleContent className="extra">Hidden text</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'Details' });

    expect(screen.queryByText('Hidden text')).toBeNull();

    await user.click(trigger);
    const content = screen.getByText('Hidden text');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(content.className).toContain('extra');
    expect(content.className).toContain('data-[state=open]:animate-collapsible-down');

    await user.click(trigger);
    expect(screen.queryByText('Hidden text')).toBeNull();
  });
});
