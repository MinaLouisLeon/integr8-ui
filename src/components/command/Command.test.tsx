import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './Command';

function Example({ onOpen = () => {} }: { onOpen?: () => void }) {
  return (
    <Command label="Commands" className="extra">
      <CommandInput placeholder="Search" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Files">
          <CommandItem onSelect={onOpen}>
            Open file <CommandShortcut>⌘O</CommandShortcut>
          </CommandItem>
          <CommandItem>Save file</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem disabled>Preferences</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

describe('Command', () => {
  it('renders the input, groups and items with theme classes', () => {
    const { container } = render(<Example />);

    const root = container.querySelector<HTMLElement>('[data-slot="command"]');
    expect(root?.className).toContain('extra');
    expect(root?.className).toContain('bg-popover');
    expect(screen.getByRole('combobox').getAttribute('placeholder')).toBe('Search');
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByText('Files')).toBeTruthy();
    expect(screen.getByText('⌘O').dataset.slot).toBe('command-shortcut');
  });

  it('filters the items as you type', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.type(screen.getByRole('combobox'), 'save');

    expect(screen.getByRole('option', { name: 'Save file' })).toBeTruthy();
    expect(screen.queryByRole('option', { name: /Open file/ })).toBeNull();
    // cmdk keeps a group with no matches in the DOM but hides it.
    expect(screen.getByText('Settings').closest('[cmdk-group]')?.hasAttribute('hidden')).toBe(true);
  });

  it('shows CommandEmpty when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.type(screen.getByRole('combobox'), 'zzzz');

    expect(screen.getByText('No results.').dataset.slot).toBe('command-empty');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('runs onSelect when an item is picked with Enter', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<Example onOpen={onOpen} />);

    await user.type(screen.getByRole('combobox'), 'open{Enter}');

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('runs onSelect when an item is clicked', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<Example onOpen={onOpen} />);

    await user.click(screen.getByRole('option', { name: /Open file/ }));

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('marks disabled items', () => {
    render(<Example />);

    const item = screen.getByRole('option', { name: 'Preferences' });
    expect(item.getAttribute('aria-disabled')).toBe('true');
    expect(item.dataset.disabled).toBe('true');
  });
});

describe('CommandDialog', () => {
  it('opens as a dialog named by its hidden title, without a close button by default', () => {
    render(
      <CommandDialog open>
        <CommandInput placeholder="Type a command" />
        <CommandList>
          <CommandItem>Reload</CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Command palette' });
    expect(dialog.className).toContain('p-0');
    expect(screen.getByText('Search for a command to run.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    expect(screen.getByRole('option', { name: 'Reload' })).toBeTruthy();
  });

  it('takes a custom title, a close button and props for the inner Command', () => {
    render(
      <CommandDialog
        open
        title="Go to file"
        description="Find a file by name."
        showCloseButton
        className="extra"
        commandProps={{ className: 'inner', loop: true }}
      >
        <CommandInput />
        <CommandList>
          <CommandItem>index.ts</CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Go to file' });
    expect(dialog.className).toContain('extra');
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
    expect(dialog.querySelector('[data-slot="command"]')?.className).toContain('inner');
  });

  it('closes with Escape', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CommandDialog open onOpenChange={onOpenChange}>
        <CommandInput />
        <CommandList>
          <CommandItem>Reload</CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
