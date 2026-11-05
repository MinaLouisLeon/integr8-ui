import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Sidebar,
  SidebarContent,
  SidebarError,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProps,
  SidebarProvider,
  type SidebarProviderProps,
  SidebarTrigger,
  useSidebar,
} from './Sidebar';

function Shell({
  providerProps,
  sidebarProps,
}: {
  providerProps?: Omit<SidebarProviderProps, 'children'>;
  sidebarProps?: Omit<SidebarProps, 'children'>;
}): ReactNode {
  return (
    <SidebarProvider {...providerProps}>
      <Sidebar {...sidebarProps}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Project</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Files">
                  <svg />
                  <span>Files</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>3</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <svg />
                  <span>Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
      </SidebarInset>
    </SidebarProvider>
  );
}

function sidebar(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-slot="sidebar"]') as HTMLElement;
}

describe('Sidebar', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts expanded and collapses to icons with the trigger', async () => {
    const user = userEvent.setup();
    const { container } = render(<Shell />);
    const trigger = screen.getByRole('button', { name: 'Toggle sidebar' });

    expect(sidebar(container).dataset.state).toBe('expanded');
    expect(sidebar(container).dataset.collapsible).toBe('');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    await user.click(trigger);

    expect(sidebar(container).dataset.state).toBe('collapsed');
    expect(sidebar(container).dataset.collapsible).toBe('icon');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('honours defaultOpen and the offcanvas mode, which makes the hidden sidebar inert', () => {
    const { container } = render(
      <Shell providerProps={{ defaultOpen: false }} sidebarProps={{ collapsible: 'offcanvas' }} />,
    );

    expect(sidebar(container).dataset.collapsible).toBe('offcanvas');
    expect(sidebar(container).hasAttribute('inert')).toBe(true);
  });

  it('works controlled and reports changes through onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(<Shell providerProps={{ open: true, onOpenChange }} />);

    await user.click(screen.getByRole('button', { name: 'Toggle sidebar' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Still open: the parent did not update the `open` prop.
    expect(sidebar(container).dataset.state).toBe('expanded');
  });

  it('toggles with Ctrl+B or ⌘B, and the shortcut can be changed or turned off', () => {
    const { container, unmount } = render(<Shell />);

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(sidebar(container).dataset.state).toBe('collapsed');
    fireEvent.keyDown(window, { key: 'B', metaKey: true });
    expect(sidebar(container).dataset.state).toBe('expanded');
    fireEvent.keyDown(window, { key: 'b', ctrlKey: true, shiftKey: true });
    expect(sidebar(container).dataset.state).toBe('expanded');
    unmount();

    const custom = render(<Shell providerProps={{ keyboardShortcut: 'j' }} />);
    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(sidebar(custom.container).dataset.state).toBe('expanded');
    fireEvent.keyDown(window, { key: 'j', ctrlKey: true });
    expect(sidebar(custom.container).dataset.state).toBe('collapsed');
    custom.unmount();

    const off = render(<Shell providerProps={{ keyboardShortcut: false }} />);
    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(sidebar(off.container).dataset.state).toBe('expanded');
  });

  it('marks the active menu button and keeps its label as the accessible name', () => {
    render(<Shell />);

    const files = screen.getByRole('button', { name: 'Files' });
    expect(files.dataset.active).toBe('true');
    expect(files.getAttribute('aria-current')).toBe('page');
    expect(files.getAttribute('type')).toBe('button');
    expect(screen.getByRole('button', { name: 'Search' }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByText('3').dataset.slot).toBe('sidebar-menu-badge');
  });

  it('renders a menu button as its child with asChild', () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton asChild isActive>
          <a href="/inbox">Inbox</a>
        </SidebarMenuButton>
      </SidebarProvider>,
    );

    const link = screen.getByRole('link', { name: 'Inbox' });
    expect(link.dataset.slot).toBe('sidebar-menu-button');
    expect(link.hasAttribute('type')).toBe(false);
  });

  it('renders a fixed sidebar with collapsible="none"', async () => {
    const user = userEvent.setup();
    const { container } = render(<Shell sidebarProps={{ collapsible: 'none' }} />);

    await user.click(screen.getByRole('button', { name: 'Toggle sidebar' }));

    expect(sidebar(container).dataset.collapsible).toBe('none');
    expect(sidebar(container).dataset.state).toBeUndefined();
  });

  it('puts a right sidebar on the right with a left border', () => {
    const { container } = render(<Shell sidebarProps={{ side: 'right', className: 'extra' }} />);
    const inner = container.querySelector('[data-slot="sidebar-inner"]') as HTMLElement;

    expect(sidebar(container).dataset.side).toBe('right');
    expect(sidebar(container).className).toContain('extra');
    expect(inner.className).toContain('border-l');
  });

  it('sets the width variables on the wrapper and lets style override them', () => {
    const { container } = render(<Shell providerProps={{ style: { color: 'red' } }} />);
    const wrapper = container.querySelector('[data-slot="sidebar-wrapper"]') as HTMLElement;

    expect(wrapper.style.getPropertyValue('--sidebar-width')).toBe('16rem');
    expect(wrapper.style.getPropertyValue('--sidebar-width-icon')).toBe('3rem');
    expect(wrapper.style.color).toBe('red');
  });

  it('calls the trigger onClick and skips the toggle when it prevents default', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SidebarProvider>
        <Sidebar />
        <SidebarTrigger label="Menu" onClick={(event) => event.preventDefault()} />
      </SidebarProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Menu' }));

    expect(sidebar(container).dataset.state).toBe('expanded');
  });

  it('becomes a sheet on small screens', async () => {
    const user = userEvent.setup();
    // jsdom has no matchMedia; report a narrow screen.
    const original = window.matchMedia;
    window.matchMedia = vi.fn(
      (media: string) =>
        ({
          media,
          matches: media.includes('max-width'),
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    try {
      render(<Shell sidebarProps={{ mobileTitle: 'Navigation' }} />);

      expect(screen.queryByRole('dialog')).toBeNull();

      await user.click(screen.getByRole('button', { name: 'Toggle sidebar' }));

      const dialog = screen.getByRole('dialog', { name: 'Navigation' });
      expect(dialog.dataset.slot).toBe('sidebar');
      expect(dialog.dataset.mobile).toBe('true');
    } finally {
      window.matchMedia = original;
    }
  });
});

describe('useSidebar', () => {
  it('throws a SidebarError outside SidebarProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let caught: unknown;
    try {
      renderHook(() => useSidebar());
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(SidebarError);
    expect((caught as SidebarError).code).toBe('NO_SIDEBAR_PROVIDER');
    vi.restoreAllMocks();
  });

  it('exposes the state and actions', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>,
    });

    expect(result.current.state).toBe('collapsed');
    expect(result.current.open).toBe(false);
    expect(result.current.isMobile).toBe(false);
  });
});
