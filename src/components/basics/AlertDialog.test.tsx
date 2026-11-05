import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog';

function Example({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete the project?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe('AlertDialog', () => {
  it('opens as an alertdialog and focuses Cancel', async () => {
    render(<Example onConfirm={() => {}} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('alertdialog', { name: 'Delete the project?' })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }));
  });

  it('runs the action and closes', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<Example onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const confirm = screen.getByRole('button', { name: 'Confirm' });
    expect(confirm.className).toContain('bg-destructive');

    await user.click(confirm);

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('closes with Cancel without running the action', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<Example onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    expect(cancel.className).toContain('border');

    await user.click(cancel);

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
