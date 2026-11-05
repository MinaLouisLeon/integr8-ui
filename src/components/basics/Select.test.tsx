import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './Select';

function Example({
  onValueChange,
  position = 'popper',
}: {
  onValueChange: (value: string) => void;
  position?: 'popper' | 'item-aligned';
}) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Fruit" size="sm">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent position={position}>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="carrot" disabled>
          Carrot
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

describe('Select', () => {
  it('shows the placeholder and the trigger size', () => {
    render(<Example onValueChange={() => {}} />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });

    expect(trigger.textContent).toContain('Pick a fruit');
    expect(trigger.dataset.size).toBe('sm');
  });

  it('opens from the keyboard and picks an item', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<Example onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });

    trigger.focus();
    await user.keyboard('{Enter}');
    const listbox = await screen.findByRole('listbox');
    expect(listbox.className).toContain('data-[side=bottom]:translate-y-1');
    expect(screen.getByRole('option', { name: 'Carrot' }).getAttribute('aria-disabled')).toBe(
      'true',
    );

    await user.click(screen.getByRole('option', { name: 'Banana' }));

    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect(trigger.textContent).toContain('Banana');
  });

  it('drops the popper offsets with position="item-aligned"', async () => {
    render(<Example onValueChange={() => {}} position="item-aligned" />);

    screen.getByRole('combobox').focus();
    await userEvent.setup().keyboard('{Enter}');
    const listbox = await screen.findByRole('listbox');

    expect(listbox.className).not.toContain('data-[side=bottom]:translate-y-1');
  });
});
