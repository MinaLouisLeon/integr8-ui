'use client';

import { cva } from 'class-variance-authority';
import { PanelLeftIcon } from 'lucide-react';
import { Slot } from 'radix-ui';
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type JSX,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { cn } from '../../lib/cn';
import { Button, type ButtonProps } from '../basics/Button';
import { Separator, type SeparatorProps } from '../basics/Separator';
import { Sheet, SheetContent, SheetTitle } from '../basics/Sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '../basics/Tooltip';

// ---------- Types, context and error ----------

/** Whether the desktop sidebar is shown at full width (`expanded`) or not (`collapsed`). */
export type SidebarState = 'expanded' | 'collapsed';

/**
 * How a {@link Sidebar} collapses on desktop: `icon` keeps a narrow strip of icons,
 * `offcanvas` hides it completely, `none` never collapses.
 */
export type SidebarCollapsible = 'icon' | 'offcanvas' | 'none';

/** The edge of the layout a {@link Sidebar} sits on. */
export type SidebarSide = 'left' | 'right';

/** Size of a {@link SidebarMenuButton}. */
export type SidebarMenuButtonSize = 'default' | 'sm' | 'lg';

/** What {@link useSidebar} returns. */
export interface SidebarContextValue {
  /** `expanded` or `collapsed` (desktop). */
  state: SidebarState;
  /** Desktop: `true` while expanded. */
  open: boolean;
  /** Desktop: expand (`true`) or collapse (`false`). */
  setOpen: (open: boolean) => void;
  /** Mobile: `true` while the sidebar sheet is open. */
  openMobile: boolean;
  /** Mobile: open or close the sidebar sheet. */
  setOpenMobile: (open: boolean) => void;
  /** `true` below the `md` breakpoint (768px), where the sidebar is a sheet. */
  isMobile: boolean;
  /** Toggles the sheet on mobile and expands/collapses on desktop. */
  toggleSidebar: () => void;
}

/** Codes of {@link SidebarError}. */
export type SidebarErrorCode = 'NO_SIDEBAR_PROVIDER';

/** Thrown when a sidebar part is used outside {@link SidebarProvider}. */
export class SidebarError extends Error {
  /** A stable code for the error. */
  readonly code: SidebarErrorCode;
  constructor(code: SidebarErrorCode, message: string) {
    super(message);
    this.name = 'SidebarError';
    this.code = code;
  }
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/** The side of the surrounding Sidebar, so tooltips open away from it. */
const SidebarSideContext = createContext<SidebarSide>('left');

/**
 * Returns the sidebar state and actions of the surrounding {@link SidebarProvider}.
 *
 * @throws {@link SidebarError} `NO_SIDEBAR_PROVIDER` outside a `SidebarProvider`.
 *
 * @example
 * ```tsx
 * const { state, toggleSidebar } = useSidebar();
 * ```
 */
export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new SidebarError(
      'NO_SIDEBAR_PROVIDER',
      'useSidebar and the Sidebar parts must be used inside <SidebarProvider>.',
    );
  }
  return context;
}

// ---------- Mobile detection ----------

const MOBILE_QUERY = '(max-width: 767px)';

function hasMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function subscribeMobile(onChange: () => void): () => void {
  if (!hasMatchMedia()) return () => {};
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getMobileSnapshot(): boolean {
  return hasMatchMedia() && window.matchMedia(MOBILE_QUERY).matches;
}

function getServerMobileSnapshot(): boolean {
  return false;
}

function useIsMobile(): boolean {
  return useSyncExternalStore(subscribeMobile, getMobileSnapshot, getServerMobileSnapshot);
}

// ---------- Provider ----------

/** Props for {@link SidebarProvider}. */
export type SidebarProviderProps = ComponentProps<'div'> & {
  /** Desktop: start expanded. Default `true`. Ignored when `open` is set. */
  defaultOpen?: boolean | undefined;
  /** Desktop: controlled expanded state. Use with `onOpenChange`, for example to save it. */
  open?: boolean | undefined;
  /** Called with the new desktop state when the sidebar expands or collapses. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * The letter that toggles the sidebar together with ⌘ (macOS) or Ctrl (elsewhere).
   * Default `'b'`. `false` turns the shortcut off (for example inside a text editor where
   * Ctrl+B means bold).
   */
  keyboardShortcut?: string | false | undefined;
};

/**
 * Holds the sidebar state and lays out its children in a row: put a {@link Sidebar} and a
 * {@link SidebarInset} inside. Fills the viewport height by default; for a sidebar inside a
 * box (an IDE window), give it `className="h-full min-h-0"`.
 *
 * Sets the CSS variables `--sidebar-width` (16rem) and `--sidebar-width-icon` (3rem); override
 * them with `style`.
 *
 * @example
 * ```tsx
 * <SidebarProvider>
 *   <Sidebar>...</Sidebar>
 *   <SidebarInset>
 *     <SidebarTrigger />
 *     ...
 *   </SidebarInset>
 * </SidebarProvider>
 * ```
 */
export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  keyboardShortcut = 'b',
  className,
  style,
  children,
  ...props
}: SidebarProviderProps): JSX.Element {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile((value) => !value);
    else setOpen(!open);
  }, [isMobile, open, setOpen]);

  useEffect(() => {
    if (keyboardShortcut === false) return;
    const key = keyboardShortcut.toLowerCase();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (
        event.key.toLowerCase() === key &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [keyboardShortcut, toggleSidebar]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      state: open ? 'expanded' : 'collapsed',
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [open, setOpen, openMobile, isMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            '--sidebar-width': '16rem',
            '--sidebar-width-icon': '3rem',
            ...style,
          } as CSSProperties
        }
        className={cn('group/sidebar-wrapper flex min-h-svh w-full', className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// ---------- Sidebar ----------

/** Props for {@link Sidebar}. */
export type SidebarProps = ComponentProps<'div'> & {
  /** The edge it sits on. Default `'left'`. */
  side?: SidebarSide | undefined;
  /** How it collapses on desktop. Default `'icon'` (a strip of icons with tooltips). */
  collapsible?: SidebarCollapsible | undefined;
  /** Screen reader title of the mobile sheet. Default `'Sidebar'`. */
  mobileTitle?: string | undefined;
};

/**
 * The sidebar column. On desktop it expands and collapses (to icons or off-canvas); below
 * 768px it becomes a {@link Sheet} opened by {@link SidebarTrigger}. Must be inside a
 * {@link SidebarProvider}.
 *
 * @example
 * ```tsx
 * <Sidebar collapsible="icon">
 *   <SidebarHeader>Integr8</SidebarHeader>
 *   <SidebarContent>
 *     <SidebarGroup>
 *       <SidebarGroupLabel>Project</SidebarGroupLabel>
 *       <SidebarMenu>
 *         <SidebarMenuItem>
 *           <SidebarMenuButton isActive tooltip="Files"><FilesIcon /><span>Files</span></SidebarMenuButton>
 *         </SidebarMenuItem>
 *       </SidebarMenu>
 *     </SidebarGroup>
 *   </SidebarContent>
 * </Sidebar>
 * ```
 */
export function Sidebar({
  side = 'left',
  collapsible = 'icon',
  mobileTitle = 'Sidebar',
  className,
  children,
  ...props
}: SidebarProps): JSX.Element {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const border = side === 'left' ? 'border-r' : 'border-l';

  if (collapsible === 'none') {
    return (
      <SidebarSideContext.Provider value={side}>
        <div
          data-slot="sidebar"
          data-side={side}
          data-collapsible="none"
          className={cn(
            'flex h-full w-(--sidebar-width) shrink-0 flex-col bg-card text-card-foreground',
            border,
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </SidebarSideContext.Provider>
    );
  }

  if (isMobile) {
    return (
      <SidebarSideContext.Provider value={side}>
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            data-slot="sidebar"
            data-side={side}
            data-mobile="true"
            side={side}
            showCloseButton={false}
            aria-describedby={undefined}
            style={{ '--sidebar-width': '18rem' } as CSSProperties}
            className={cn(
              'w-(--sidebar-width) gap-0 bg-card p-0 text-card-foreground sm:max-w-(--sidebar-width)',
              className,
            )}
            {...props}
          >
            <SheetTitle className="sr-only">{mobileTitle}</SheetTitle>
            <div data-slot="sidebar-inner" className="flex h-full w-full flex-col">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </SidebarSideContext.Provider>
    );
  }

  const hidden = state === 'collapsed' && collapsible === 'offcanvas';

  return (
    <SidebarSideContext.Provider value={side}>
      <div
        data-slot="sidebar"
        data-side={side}
        data-state={state}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        inert={hidden}
        className={cn(
          'group peer hidden shrink-0 overflow-hidden text-card-foreground md:flex',
          // Sticky full height on a page; clamped to the provider's height inside a box.
          'sticky top-0 h-svh max-h-full',
          'w-(--sidebar-width) transition-[width] duration-200 ease-linear',
          'data-[collapsible=offcanvas]:w-0 data-[collapsible=icon]:w-(--sidebar-width-icon)',
          // Right sidebars slide out to the right: overflow goes to the start side.
          side === 'right' && 'justify-end',
          className,
        )}
        {...props}
      >
        <div
          data-slot="sidebar-inner"
          className={cn(
            'flex h-full w-(--sidebar-width) shrink-0 flex-col bg-card',
            'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
            border,
          )}
        >
          {children}
        </div>
      </div>
    </SidebarSideContext.Provider>
  );
}

// ---------- Trigger and inset ----------

/** Props for {@link SidebarTrigger}. */
export type SidebarTriggerProps = ButtonProps & {
  /** Screen reader label. Default `'Toggle sidebar'`. */
  label?: string | undefined;
};

/**
 * A ghost icon button that expands/collapses the sidebar (or opens the mobile sheet).
 * Shows a panel icon unless you pass children.
 */
export function SidebarTrigger({
  className,
  onClick,
  label = 'Toggle sidebar',
  variant = 'ghost',
  size = 'icon-sm',
  children,
  ...props
}: SidebarTriggerProps): JSX.Element {
  const { toggleSidebar, open, openMobile, isMobile } = useSidebar();
  return (
    <Button
      data-slot="sidebar-trigger"
      variant={variant}
      size={size}
      aria-expanded={isMobile ? openMobile : open}
      className={className}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleSidebar();
      }}
      {...props}
    >
      {children ?? <PanelLeftIcon />}
      <span className="sr-only">{label}</span>
    </Button>
  );
}

/** Props for {@link SidebarInset}. */
export type SidebarInsetProps = ComponentProps<'main'>;

/** The main content area next to the {@link Sidebar}. Renders a `<main>`. */
export function SidebarInset({ className, ...props }: SidebarInsetProps): JSX.Element {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn('relative flex min-w-0 flex-1 flex-col bg-background', className)}
      {...props}
    />
  );
}

// ---------- Sections ----------

/** Props for {@link SidebarHeader}. */
export type SidebarHeaderProps = ComponentProps<'div'>;

/** The top of the sidebar, for the app name or a workspace switcher. Does not scroll. */
export function SidebarHeader({ className, ...props }: SidebarHeaderProps): JSX.Element {
  return (
    <div
      data-slot="sidebar-header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

/** Props for {@link SidebarFooter}. */
export type SidebarFooterProps = ComponentProps<'div'>;

/** The bottom of the sidebar, for the user menu or settings. Does not scroll. */
export function SidebarFooter({ className, ...props }: SidebarFooterProps): JSX.Element {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

/** Props for {@link SidebarContent}. */
export type SidebarContentProps = ComponentProps<'div'>;

/** The scrolling middle of the sidebar, holding the {@link SidebarGroup}s. */
export function SidebarContent({ className, ...props }: SidebarContentProps): JSX.Element {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link SidebarSeparator}. */
export type SidebarSeparatorProps = SeparatorProps;

/** A horizontal line between sidebar sections. */
export function SidebarSeparator({ className, ...props }: SidebarSeparatorProps): JSX.Element {
  return (
    <Separator data-slot="sidebar-separator" className={cn('mx-2 w-auto', className)} {...props} />
  );
}

// ---------- Groups ----------

/** Props for {@link SidebarGroup}. */
export type SidebarGroupProps = ComponentProps<'div'>;

/** A titled section of the sidebar. */
export function SidebarGroup({ className, ...props }: SidebarGroupProps): JSX.Element {
  return (
    <div
      data-slot="sidebar-group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  );
}

/** Props for {@link SidebarGroupLabel}. */
export type SidebarGroupLabelProps = ComponentProps<'div'> & {
  /** Render the single child element (for example a `CollapsibleTrigger`) instead of a div. */
  asChild?: boolean | undefined;
};

/** The small muted title of a {@link SidebarGroup}. Fades out in icon mode. */
export function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: SidebarGroupLabelProps): JSX.Element {
  const Comp = asChild ? Slot.Root : 'div';
  return (
    <Comp
      data-slot="sidebar-group-label"
      className={cn(
        'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground outline-none',
        'transition-[margin,opacity] duration-200 ease-linear',
        'focus-visible:ring-2 focus-visible:ring-ring',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        '[&>svg]:size-4 [&>svg]:shrink-0',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link SidebarGroupContent}. */
export type SidebarGroupContentProps = ComponentProps<'div'>;

/** The body of a {@link SidebarGroup}, usually a {@link SidebarMenu}. */
export function SidebarGroupContent({
  className,
  ...props
}: SidebarGroupContentProps): JSX.Element {
  return (
    <div data-slot="sidebar-group-content" className={cn('w-full text-sm', className)} {...props} />
  );
}

// ---------- Menu ----------

/** Props for {@link SidebarMenu}. */
export type SidebarMenuProps = ComponentProps<'ul'>;

/** A list of {@link SidebarMenuItem}s. Renders a `<ul>`. */
export function SidebarMenu({ className, ...props }: SidebarMenuProps): JSX.Element {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
}

/** Props for {@link SidebarMenuItem}. */
export type SidebarMenuItemProps = ComponentProps<'li'>;

/** One entry of a {@link SidebarMenu}: a {@link SidebarMenuButton} and an optional badge. */
export function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps): JSX.Element {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  [
    'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none',
    'transition-[width,height,padding]',
    'hover:bg-muted hover:text-foreground',
    'focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    'data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-accent-foreground',
    'group-has-data-[slot=sidebar-menu-badge]/menu-item:pr-8',
    // Icon mode: a square button that shows only the icon.
    'group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!',
    '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
  ],
  {
    variants: {
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

/** Props for {@link SidebarMenuButton}. */
export type SidebarMenuButtonProps = ComponentProps<'button'> & {
  /** Render the single child element (for example a router link) instead of a `<button>`. */
  asChild?: boolean | undefined;
  /** Marks the current page: accent background and `aria-current="page"`. */
  isActive?: boolean | undefined;
  /** Height. Default `'default'`. */
  size?: SidebarMenuButtonSize | undefined;
  /** Label shown in a tooltip while the sidebar is collapsed to icons. */
  tooltip?: ReactNode;
};

/**
 * A menu entry: an icon followed by a `<span>` label. In icon mode only the icon shows and
 * `tooltip` (if given) names it on hover and focus.
 *
 * @example
 * ```tsx
 * <SidebarMenuButton asChild isActive tooltip="Inbox">
 *   <a href="/inbox"><InboxIcon /><span>Inbox</span></a>
 * </SidebarMenuButton>
 * ```
 */
export function SidebarMenuButton({
  className,
  asChild = false,
  isActive = false,
  size,
  tooltip,
  ...props
}: SidebarMenuButtonProps): JSX.Element {
  const { state, isMobile } = useSidebar();
  const side = useContext(SidebarSideContext);
  const Comp = asChild ? Slot.Root : 'button';

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-size={size ?? 'default'}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      className={cn(sidebarMenuButtonVariants({ size }), className)}
      {...(asChild ? {} : { type: 'button' as const })}
      {...props}
    />
  );

  if (!tooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side={side === 'left' ? 'right' : 'left'}
        align="center"
        hidden={state !== 'collapsed' || isMobile}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/** Props for {@link SidebarMenuBadge}. */
export type SidebarMenuBadgeProps = ComponentProps<'div'>;

/** A small count at the end of a {@link SidebarMenuItem}, such as unread items. Hidden in icon mode. */
export function SidebarMenuBadge({ className, ...props }: SidebarMenuBadgeProps): JSX.Element {
  return (
    <div
      data-slot="sidebar-menu-badge"
      className={cn(
        'pointer-events-none absolute top-1.5 right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1',
        'text-xs font-medium text-muted-foreground tabular-nums select-none',
        'peer-data-[active=true]/menu-button:text-accent-foreground',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}
