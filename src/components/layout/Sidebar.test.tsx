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
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  type SidebarProps,
  SidebarProvider,
  type SidebarProviderProps,
  SidebarRail,
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

describe('Sidebar variants', () => {
  it('defaults to the sidebar variant with a bordered card column', () => {
    const { container } = render(<Shell />);
    const inner = container.querySelector('[data-slot="sidebar-inner"]') as HTMLElement;

    expect(sidebar(container).dataset.variant).toBe('sidebar');
    expect(inner.className).toContain('bg-card');
    expect(inner.className).toContain('border-r');
    expect(container.querySelector('[data-slot="sidebar-panel"]')).toBeNull();
  });

  it('wraps the content in a rounded panel with variant="floating"', () => {
    const { container } = render(<Shell sidebarProps={{ variant: 'floating' }} />);
    const panel = container.querySelector('[data-slot="sidebar-panel"]') as HTMLElement;

    expect(sidebar(container).dataset.variant).toBe('floating');
    expect(panel.className).toContain('rounded-lg');
    expect(panel.className).toContain('bg-card');
    expect(panel.textContent).toContain('Files');
    expect(sidebar(container).className).toContain(
      'data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]',
    );
  });

  it('turns the inset into a card with variant="inset"', () => {
    const { container } = render(<Shell sidebarProps={{ variant: 'inset' }} />);
    const inset = container.querySelector('[data-slot="sidebar-inset"]') as HTMLElement;
    const wrapper = container.querySelector('[data-slot="sidebar-wrapper"]') as HTMLElement;

    expect(sidebar(container).dataset.variant).toBe('inset');
    expect(inset.className).toContain('md:peer-data-[variant=inset]:rounded-xl');
    expect(wrapper.className).toContain('has-data-[variant=inset]:bg-card');
  });
});

describe('SidebarRail', () => {
  it('toggles the sidebar on click and stays out of the Tab order', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarRail />
        </Sidebar>
      </SidebarProvider>,
    );
    const rail = screen.getByRole('button', { name: 'Toggle sidebar' });

    expect(rail.tabIndex).toBe(-1);
    expect(rail.dataset.slot).toBe('sidebar-rail');
    await user.click(rail);
    expect(sidebar(container).dataset.state).toBe('collapsed');
    await user.click(rail);
    expect(sidebar(container).dataset.state).toBe('expanded');
  });

  it('uses a custom label and skips the toggle when onClick prevents default', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SidebarProvider>
        <Sidebar side="right">
          <SidebarRail label="Resize" onClick={(event) => event.preventDefault()} />
        </Sidebar>
      </SidebarProvider>,
    );
    const rail = screen.getByRole('button', { name: 'Resize' });

    expect(rail.className).toContain('left-0');
    await user.click(rail);
    expect(sidebar(container).dataset.state).toBe('expanded');
  });
});

describe('SidebarInput', () => {
  it('renders a compact input that hides in icon mode', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarInput aria-label="Search files" className="extra" />
        </Sidebar>
      </SidebarProvider>,
    );
    const input = screen.getByRole('textbox', { name: 'Search files' });

    expect(input.dataset.slot).toBe('sidebar-input');
    expect(input.className).toContain('group-data-[collapsible=icon]:hidden');
    expect(input.className).toContain('extra');
  });
});

describe('SidebarMenuAction', () => {
  it('renders a button next to the menu button and can show only on hover', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Projects</span>
              </SidebarMenuButton>
              <SidebarMenuAction aria-label="Add project" onClick={onClick} showOnHover>
                <svg />
              </SidebarMenuAction>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );
    const action = screen.getByRole('button', { name: 'Add project' });

    expect(action.getAttribute('type')).toBe('button');
    expect(action.className).toContain('md:opacity-0');
    expect(screen.getByRole('button', { name: 'Projects' }).className).toContain(
      'group-has-data-[slot=sidebar-menu-action]/menu-item:pr-8',
    );
    await user.click(action);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is always visible by default and supports asChild', () => {
    render(
      <SidebarProvider>
        <SidebarMenuAction asChild>
          <a href="#new">New</a>
        </SidebarMenuAction>
      </SidebarProvider>,
    );
    const link = screen.getByRole('link', { name: 'New' });

    expect(link.dataset.slot).toBe('sidebar-menu-action');
    expect(link.className).not.toContain('md:opacity-0');
    expect(link.hasAttribute('type')).toBe(false);
  });
});

describe('SidebarMenuSub', () => {
  it('renders a nested list with active and sized sub buttons', () => {
    render(
      <SidebarMenuSub className="extra">
        <SidebarMenuSubItem>
          <SidebarMenuSubButton isActive>Intro</SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild size="sm">
            <a href="#api">API</a>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </SidebarMenuSub>,
    );
    const list = screen.getByRole('list');
    const intro = screen.getByRole('button', { name: 'Intro' });
    const api = screen.getByRole('link', { name: 'API' });

    expect(list.dataset.slot).toBe('sidebar-menu-sub');
    expect(list.className).toContain('extra');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(intro.getAttribute('aria-current')).toBe('page');
    expect(intro.dataset.active).toBe('true');
    expect(intro.className).toContain('text-sm');
    expect(api.dataset.size).toBe('sm');
    expect(api.className).toContain('text-xs');
    expect(api.getAttribute('aria-current')).toBeNull();
  });
});

/** Removes a cookie set by a test. */
function clearCookie(name: string): void {
  // biome-ignore lint/suspicious/noDocumentCookie: tests read and clear real cookies.
  document.cookie = `${name}=; path=/; max-age=0`;
}

/** Saves a cookie, as a previous visit would have. */
function setCookie(name: string, value: string): void {
  // biome-ignore lint/suspicious/noDocumentCookie: tests read and clear real cookies.
  document.cookie = `${name}=${value}; path=/`;
}

describe('SidebarProvider persist="cookie"', () => {
  afterEach(() => {
    clearCookie('sidebar_state');
    clearCookie('ide_sidebar');
  });

  it('writes the state to the sidebar_state cookie on every change', async () => {
    const user = userEvent.setup();
    render(<Shell providerProps={{ persist: 'cookie' }} />);

    await user.click(screen.getByRole('button', { name: 'Toggle sidebar' }));
    expect(document.cookie).toContain('sidebar_state=false');

    await user.click(screen.getByRole('button', { name: 'Toggle sidebar' }));
    expect(document.cookie).toContain('sidebar_state=true');
  });

  it('starts from the saved cookie, under a custom name', () => {
    setCookie('ide_sidebar', 'false');
    const { container } = render(
      <Shell providerProps={{ persist: 'cookie', cookieName: 'ide_sidebar' }} />,
    );

    expect(sidebar(container).dataset.state).toBe('collapsed');
  });

  it('ignores a saved cookie when persist is off', () => {
    setCookie('sidebar_state', 'false');
    const { container } = render(<Shell />);
    expect(sidebar(container).dataset.state).toBe('expanded');
  });

  it('does not write a cookie when persist is off', async () => {
    const user = userEvent.setup();
    render(<Shell />);
    await user.click(screen.getByRole('button', { name: 'Toggle sidebar' }));
    expect(document.cookie).not.toContain('sidebar_state');
  });
});
