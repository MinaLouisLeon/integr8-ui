import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './Menubar';

function Example({ onNew = () => {} }: { onNew?: () => void }) {
  return (
    <Menubar className="extra-bar">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent className="extra">
          <MenubarLabel inset>Workspace</MenubarLabel>
          <MenubarGroup>
            <MenubarItem onSelect={onNew}>
              New file <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Open recent</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>notes.md</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Close workspace</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>Minimap</MenubarCheckboxItem>
          <MenubarRadioGroup value="dark">
            <MenubarRadioItem value="light">Light</MenubarRadioItem>
            <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

async function openMenu(name: string) {
  const user = userEvent.setup();
  screen.getByRole('menuitem', { name }).focus();
  await user.keyboard('{Enter}');
  return user;
}

describe('Menubar', () => {
  it('renders a menubar with its triggers', () => {
    render(<Example />);

    const bar = screen.getByRole('menubar');
    expect(bar.className).toContain('extra-bar');
    expect(bar.dataset.slot).toBe('menubar');
    expect(screen.getByRole('menuitem', { name: 'File' }).dataset.slot).toBe('menubar-trigger');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens a menu from the keyboard and lists its items', async () => {
    render(<Example />);
    await openMenu('File');

    const menu = screen.getByRole('menu');
    expect(menu.className).toContain('extra');
    expect(menu.className).toContain('bg-popover');
    expect(screen.getByText('⌘N').dataset.slot).toBe('menubar-shortcut');
    expect(screen.getByText('Workspace').dataset.inset).toBe('true');
    expect(screen.getByRole('menuitem', { name: 'Close workspace' }).dataset.variant).toBe(
      'destructive',
    );
  });

  it('runs onSelect and closes when an item is picked', async () => {
    const onNew = vi.fn();
    render(<Example onNew={onNew} />);
    const user = await openMenu('File');

    await user.click(screen.getByRole('menuitem', { name: /New file/ }));

    expect(onNew).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('renders checkbox and radio items with their state', async () => {
    render(<Example />);
    await openMenu('View');

    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Minimap' }).getAttribute('aria-checked'),
    ).toBe('true');
    expect(screen.getByRole('menuitemradio', { name: 'Dark' }).getAttribute('aria-checked')).toBe(
      'true',
    );
  });

  it('opens a submenu with the right arrow key', async () => {
    render(<Example />);
    const user = await openMenu('File');

    screen.getByRole('menuitem', { name: 'Open recent' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(await screen.findByRole('menuitem', { name: 'notes.md' })).toBeTruthy();
  });
});
