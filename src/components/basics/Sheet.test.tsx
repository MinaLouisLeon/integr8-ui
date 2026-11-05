import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  type SheetSide,
  SheetTitle,
  SheetTrigger,
} from './Sheet';

function Example({ side }: { side?: SheetSide }) {
  return (
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the list.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Apply</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

describe('Sheet', () => {
  it('slides in from the right by default', async () => {
    render(<Example />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Open' }));
    const sheet = screen.getByRole('dialog', { name: 'Filters' });

    expect(sheet.dataset.side).toBe('right');
    expect(sheet.className).toContain('right-0');
    expect(sheet.className).toContain('data-[state=open]:slide-in-from-right');
  });

  it.each(['top', 'bottom', 'left'] as const)('supports side="%s"', async (side) => {
    render(<Example side={side} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Open' }));
    const sheet = screen.getByRole('dialog');

    expect(sheet.dataset.side).toBe(side);
    expect(sheet.className).toContain(`slide-in-from-${side}`);
  });

  it('closes with SheetClose and the × button', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
