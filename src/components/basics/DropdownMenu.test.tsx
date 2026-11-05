import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './DropdownMenu';

function Example({ onProfile }: { onProfile: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
      <DropdownMenuContent className="extra">
        <DropdownMenuLabel inset>Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onProfile}>
            Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem checked>Status bar</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="top">
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Nested</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function openMenu() {
  const user = userEvent.setup();
  screen.getByRole('button', { name: 'Menu' }).focus();
  await user.keyboard('{Enter}');
  return user;
}

describe('DropdownMenu', () => {
  it('opens from the keyboard and lists its items', async () => {
    render(<Example onProfile={() => {}} />);
    await openMenu();
    const menu = screen.getByRole('menu');

    expect(menu.className).toContain('extra');
    expect(menu.className).toContain('bg-popover');
    expect(screen.getByRole('menuitem', { name: /Profile/ })).toBeTruthy();
    expect(screen.getByText('⇧⌘P').dataset.slot).toBe('dropdown-menu-shortcut');
    expect(screen.getByText('Account').dataset.inset).toBe('true');
  });

  it('runs onSelect and closes when an item is picked', async () => {
    const onProfile = vi.fn();
    render(<Example onProfile={onProfile} />);
    const user = await openMenu();

    await user.click(screen.getByRole('menuitem', { name: /Profile/ }));

    expect(onProfile).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('renders checkbox and radio items with their state', async () => {
    render(<Example onProfile={() => {}} />);
    await openMenu();

    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Status bar' }).getAttribute('aria-checked'),
    ).toBe('true');
    expect(screen.getByRole('menuitemradio', { name: 'Top' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: 'Bottom' }).getAttribute('aria-checked')).toBe(
      'false',
    );
  });

  it('marks destructive items', async () => {
    render(<Example onProfile={() => {}} />);
    await openMenu();

    const item = screen.getByRole('menuitem', { name: 'Log out' });
    expect(item.dataset.variant).toBe('destructive');
    expect(screen.getByRole('menuitem', { name: /Profile/ }).dataset.variant).toBe('default');
  });

  it('opens a submenu with the right arrow key', async () => {
    render(<Example onProfile={() => {}} />);
    const user = await openMenu();

    screen.getByRole('menuitem', { name: 'More' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(await screen.findByRole('menuitem', { name: 'Nested' })).toBeTruthy();
  });
});
