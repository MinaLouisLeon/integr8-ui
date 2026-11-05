import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog';

function Example({ showCloseButton }: { showCloseButton?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent className="extra" showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes here.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('opens from the trigger with an accessible name and description', async () => {
    render(<Example />);
    expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' });

    expect(dialog.getAttribute('aria-describedby')).toBe(screen.getByText('Make changes here.').id);
    expect(dialog.className).toContain('extra');
    expect(dialog.className).toContain('bg-background');
    expect(document.querySelector('[data-slot="dialog-overlay"]')).not.toBeNull();
  });

  it('closes with the × button', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes with Escape and with DialogClose', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('can hide the × button', async () => {
    render(<Example showCloseButton={false} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });
});
