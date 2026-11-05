import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';

describe('ToggleGroup', () => {
  it('keeps one item on in single mode', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ToggleGroup type="single" defaultValue="left" onValueChange={onValueChange}>
        <ToggleGroupItem value="left" aria-label="Left">
          L
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right">
          R
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const left = screen.getByRole('radio', { name: 'Left' });
    const right = screen.getByRole('radio', { name: 'Right' });

    expect(left.dataset.state).toBe('on');

    await user.click(right);

    expect(right.dataset.state).toBe('on');
    expect(left.dataset.state).toBe('off');
    expect(onValueChange).toHaveBeenCalledWith('right');
  });

  it('allows several items in multiple mode', async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="bold" aria-label="Bold">
          B
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          I
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    await user.click(screen.getByRole('button', { name: 'Bold' }));
    await user.click(screen.getByRole('button', { name: 'Italic' }));

    expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Italic' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('passes the group style to items, and items can override it', () => {
    const { container } = render(
      <ToggleGroup type="single" variant="outline" size="sm">
        <ToggleGroupItem value="a" aria-label="A">
          A
        </ToggleGroupItem>
        <ToggleGroupItem value="b" aria-label="B" variant="default" size="lg">
          B
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const group = container.querySelector<HTMLElement>('[data-slot="toggle-group"]');
    const a = screen.getByRole('radio', { name: 'A' });
    const b = screen.getByRole('radio', { name: 'B' });

    expect(group?.dataset.variant).toBe('outline');
    expect(a.dataset.variant).toBe('outline');
    expect(a.className).toContain('h-8');
    expect(b.dataset.variant).toBe('default');
    expect(b.className).toContain('h-10');
  });
});
