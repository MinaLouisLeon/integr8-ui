import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './ContextMenu';

function Example({ onCopy = () => {} }: { onCopy?: () => void }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
      <ContextMenuContent className="extra">
        <ContextMenuLabel inset>Edit</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuItem onSelect={onCopy}>
            Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuCheckboxItem checked>Word wrap</ContextMenuCheckboxItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="tabs">
          <ContextMenuRadioItem value="tabs">Tabs</ContextMenuRadioItem>
          <ContextMenuRadioItem value="spaces">Spaces</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Email</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function openMenu() {
  fireEvent.contextMenu(screen.getByText('Right-click here'));
  return screen.getByRole('menu');
}

describe('ContextMenu', () => {
  it('opens on right-click and lists its items', () => {
    render(<Example />);
    expect(screen.queryByRole('menu')).toBeNull();

    const menu = openMenu();

    expect(menu.className).toContain('extra');
    expect(menu.className).toContain('bg-popover');
    expect(screen.getByRole('menuitem', { name: /Copy/ })).toBeTruthy();
    expect(screen.getByText('⌘C').dataset.slot).toBe('context-menu-shortcut');
    expect(screen.getByText('Edit').dataset.inset).toBe('true');
  });

  it('runs onSelect and closes when an item is picked', async () => {
    const onCopy = vi.fn();
    const user = userEvent.setup();
    render(<Example onCopy={onCopy} />);
    openMenu();

    await user.click(screen.getByRole('menuitem', { name: /Copy/ }));

    expect(onCopy).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('renders checkbox and radio items with their state', () => {
    render(<Example />);
    openMenu();

    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Word wrap' }).getAttribute('aria-checked'),
    ).toBe('true');
    expect(screen.getByRole('menuitemradio', { name: 'Tabs' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: 'Spaces' }).getAttribute('aria-checked')).toBe(
      'false',
    );
  });

  it('marks destructive items', () => {
    render(<Example />);
    openMenu();

    expect(screen.getByRole('menuitem', { name: 'Delete' }).dataset.variant).toBe('destructive');
    expect(screen.getByRole('menuitem', { name: /Copy/ }).dataset.variant).toBe('default');
  });

  it('opens a submenu with the right arrow key', async () => {
    const user = userEvent.setup();
    render(<Example />);
    openMenu();

    screen.getByRole('menuitem', { name: 'Share' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(await screen.findByRole('menuitem', { name: 'Email' })).toBeTruthy();
  });

  it('closes with Escape', async () => {
    const user = userEvent.setup();
    render(<Example />);
    openMenu();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).toBeNull();
  });
});
