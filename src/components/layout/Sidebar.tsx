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
import { Input, type InputProps } from '../basics/Input';
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

/**
 * Look of a {@link Sidebar} on desktop: `sidebar` is a full-height column with a border,
 * `floating` is a rounded card with a gap around it, `inset` puts the page content in a
 * rounded card next to the sidebar (use with {@link SidebarInset}).
 */
export type SidebarVariant = 'sidebar' | 'floating' | 'inset';

/** Size of a {@link SidebarMenuButton}. */
export type SidebarMenuButtonSize = 'default' | 'sm' | 'lg';

/** Size of a {@link SidebarMenuSubButton}. */
export type SidebarMenuSubButtonSize = 'sm' | 'md';

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

// ---------- Cookie persistence ----------

/** Default cookie name used by `persist="cookie"`, the same as shadcn's sidebar. */
const DEFAULT_COOKIE_NAME = 'sidebar_state';
/** Default cookie lifetime: 7 days, in seconds. */
const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** Reads the saved desktop state, or `undefined` when there is none (or no document). */
function readOpenCookie(name: string): boolean | undefined {
  if (typeof document === 'undefined') return undefined;
  const key = `${encodeURIComponent(name)}=`;
  for (const part of document.cookie.split(';')) {
    const entry = part.trim();
    if (entry.startsWith(key)) {
      const value = entry.slice(key.length);
      if (value === 'true') return true;
      if (value === 'false') return false;
    }
  }
  return undefined;
}

function writeOpenCookie(name: string, open: boolean, maxAge: number): void {
  if (typeof document === 'undefined') return;
  // biome-ignore lint/suspicious/noDocumentCookie: a plain cookie is the documented option here.
  document.cookie = `${encodeURIComponent(name)}=${open}; path=/; max-age=${maxAge}; SameSite=Lax`;
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
  /**
   * Save the desktop expanded state. `'cookie'` writes it to a cookie (`cookieName`) on every
   * change and reads it back on the first render, when `open` is not set. Default: off (save
   * it yourself with `open` / `onOpenChange`).
   *
   * With server rendering, read the cookie on the server and pass it as `defaultOpen`, so the
   * server and the browser render the same state.
   */
  persist?: 'cookie' | undefined;
  /** Name of the cookie used by `persist="cookie"`. Default `'sidebar_state'`. */
  cookieName?: string | undefined;
  /** Lifetime of the cookie, in seconds. Default 7 days. */
  cookieMaxAge?: number | undefined;
};

/**
 * Holds the sidebar state and lays out its children in a row: put a {@link Sidebar} and a
 * {@link SidebarInset} inside. Fills the viewport height by default; for a sidebar inside a
 * box (an IDE window), give it `className="h-full min-h-0"`.
 *
 * Sets the CSS variables `--sidebar-width` (16rem) and `--sidebar-width-icon` (3rem); override
 * them with `style`. `persist="cookie"` remembers the expanded state in a cookie.
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
  persist,
  cookieName = DEFAULT_COOKIE_NAME,
  cookieMaxAge = DEFAULT_COOKIE_MAX_AGE,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps): JSX.Element {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(() =>
    persist === 'cookie' ? (readOpenCookie(cookieName) ?? defaultOpen) : defaultOpen,
  );
  const open = openProp ?? uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      if (persist === 'cookie') writeOpenCookie(cookieName, next, cookieMaxAge);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange, persist, cookieName, cookieMaxAge],
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
        className={cn(
          'group/sidebar-wrapper flex min-h-svh w-full',
          // Inset variant: the area around the content card takes the sidebar color.
          'has-data-[variant=inset]:bg-card',
          className,
        )}
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
  /**
   * Look on desktop: `'sidebar'` (full-height column), `'floating'` (rounded card) or
   * `'inset'` (the {@link SidebarInset} becomes a rounded card). Default `'sidebar'`.
   * The mobile sheet looks the same for every variant.
   */
  variant?: SidebarVariant | undefined;
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
  variant = 'sidebar',
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
  // Floating and inset leave a 0.5rem gap on each side, so the icon strip is 1rem wider.
  const padded = variant !== 'sidebar';

  return (
    <SidebarSideContext.Provider value={side}>
      <div
        data-slot="sidebar"
        data-side={side}
        data-state={state}
        data-variant={variant}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        inert={hidden}
        className={cn(
          'group peer hidden shrink-0 overflow-hidden text-card-foreground md:flex',
          // Sticky full height on a page; clamped to the provider's height inside a box.
          'sticky top-0 h-svh max-h-full',
          'w-(--sidebar-width) transition-[width] duration-200 ease-linear',
          'data-[collapsible=offcanvas]:w-0',
          padded
            ? 'data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]'
            : 'data-[collapsible=icon]:w-(--sidebar-width-icon)',
          // Right sidebars slide out to the right: overflow goes to the start side.
          side === 'right' && 'justify-end',
          className,
        )}
        {...props}
      >
        <div
          data-slot="sidebar-inner"
          className={cn(
            'relative flex h-full w-(--sidebar-width) shrink-0 flex-col',
            padded
              ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]'
              : cn('bg-card group-data-[collapsible=icon]:w-(--sidebar-width-icon)', border),
          )}
        >
          {variant === 'floating' ? (
            <div
              data-slot="sidebar-panel"
              className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border bg-card shadow-sm"
            >
              {children}
            </div>
          ) : (
            children
          )}
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

/**
 * The main content area next to the {@link Sidebar}. Renders a `<main>`. Next to a left
 * sidebar with `variant="inset"` it becomes a rounded card with a small gap (desktop).
 */
export function SidebarInset({ className, ...props }: SidebarInsetProps): JSX.Element {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'relative flex min-w-0 flex-1 flex-col bg-background',
        'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0',
        'md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:border md:peer-data-[variant=inset]:shadow-sm',
        'md:peer-data-[variant=inset]:peer-data-[collapsible=offcanvas]:ml-2',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link SidebarRail}. */
export type SidebarRailProps = ComponentProps<'button'> & {
  /** Screen reader label and tooltip. Default `'Toggle sidebar'`. */
  label?: string | undefined;
};

/**
 * A thin strip on the inner edge of the {@link Sidebar}: click it to expand or collapse.
 * It is a mouse convenience, so it is left out of the Tab order; keyboard users have
 * {@link SidebarTrigger} and the ⌘B / Ctrl+B shortcut. Put it as the last child of `Sidebar`.
 * Not shown while an `offcanvas` sidebar is hidden or on mobile.
 */
export function SidebarRail({
  className,
  onClick,
  label = 'Toggle sidebar',
  ...props
}: SidebarRailProps): JSX.Element {
  const { toggleSidebar } = useSidebar();
  const side = useContext(SidebarSideContext);
  return (
    <button
      type="button"
      data-slot="sidebar-rail"
      aria-label={label}
      title={label}
      tabIndex={-1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleSidebar();
      }}
      className={cn(
        'absolute inset-y-0 z-20 hidden w-2 transition-colors ease-linear sm:flex',
        side === 'left' ? 'right-0 cursor-w-resize' : 'left-0 cursor-e-resize',
        'group-data-[collapsible=icon]:cursor-e-resize',
        side === 'right' && 'group-data-[collapsible=icon]:cursor-w-resize',
        // A line in the middle of the strip that lights up on hover.
        "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:content-['']",
        'hover:after:bg-ring',
        className,
      )}
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

/** Props for {@link SidebarInput}. */
export type SidebarInputProps = InputProps;

/**
 * A compact search or filter box for the sidebar, usually in {@link SidebarHeader}. Hidden in
 * icon mode. Give it an `aria-label` (or a visible label).
 *
 * @example
 * ```tsx
 * <SidebarHeader>
 *   <SidebarInput type="search" placeholder="Search files…" aria-label="Search files" />
 * </SidebarHeader>
 * ```
 */
export function SidebarInput({ className, ...props }: SidebarInputProps): JSX.Element {
  return (
    <Input
      data-slot="sidebar-input"
      className={cn(
        'h-8 w-full bg-background shadow-none group-data-[collapsible=icon]:hidden',
        className,
      )}
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
    'group-has-data-[slot=sidebar-menu-action]/menu-item:pr-8',
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

/** Props for {@link SidebarMenuAction}. */
export type SidebarMenuActionProps = ComponentProps<'button'> & {
  /** Render the single child element (for example a `DropdownMenuTrigger`) instead of a button. */
  asChild?: boolean | undefined;
  /**
   * Desktop: show the action only while the menu item is hovered or focused (or its menu is
   * open). Default `false` (always shown).
   */
  showOnHover?: boolean | undefined;
};

/**
 * A small icon button at the end of a {@link SidebarMenuItem}, for example a "…" menu or a
 * "+" to add a child. Put it after the {@link SidebarMenuButton}; give it an `aria-label`.
 * Hidden in icon mode.
 *
 * @example
 * ```tsx
 * <SidebarMenuItem>
 *   <SidebarMenuButton><FolderIcon /><span>Projects</span></SidebarMenuButton>
 *   <DropdownMenu>
 *     <DropdownMenuTrigger asChild>
 *       <SidebarMenuAction showOnHover aria-label="More"><MoreHorizontalIcon /></SidebarMenuAction>
 *     </DropdownMenuTrigger>
 *     <DropdownMenuContent side="right" align="start">...</DropdownMenuContent>
 *   </DropdownMenu>
 * </SidebarMenuItem>
 * ```
 */
export function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: SidebarMenuActionProps): JSX.Element {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="sidebar-menu-action"
      className={cn(
        'absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-muted-foreground outline-none',
        'transition-transform hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
        'peer-data-[active=true]/menu-button:text-accent-foreground',
        // A bigger touch target on small screens.
        'after:absolute after:-inset-2 md:after:hidden',
        'peer-data-[size=sm]/menu-button:top-1 peer-data-[size=lg]/menu-button:top-3.5',
        'group-data-[collapsible=icon]:hidden',
        '[&>svg]:size-4 [&>svg]:shrink-0',
        showOnHover &&
          'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0',
        className,
      )}
      {...(asChild ? {} : { type: 'button' as const })}
      {...props}
    />
  );
}

// ---------- Sub menu ----------

/** Props for {@link SidebarMenuSub}. */
export type SidebarMenuSubProps = ComponentProps<'ul'>;

/**
 * A nested list under a {@link SidebarMenuItem}, drawn with a line on its start side. Often
 * placed in a `CollapsibleContent`. Hidden in icon mode.
 *
 * @example
 * ```tsx
 * <Collapsible asChild defaultOpen>
 *   <SidebarMenuItem>
 *     <CollapsibleTrigger asChild>
 *       <SidebarMenuButton><BookIcon /><span>Docs</span></SidebarMenuButton>
 *     </CollapsibleTrigger>
 *     <CollapsibleContent>
 *       <SidebarMenuSub>
 *         <SidebarMenuSubItem>
 *           <SidebarMenuSubButton asChild isActive><a href="/docs/intro">Intro</a></SidebarMenuSubButton>
 *         </SidebarMenuSubItem>
 *       </SidebarMenuSub>
 *     </CollapsibleContent>
 *   </SidebarMenuItem>
 * </Collapsible>
 * ```
 */
export function SidebarMenuSub({ className, ...props }: SidebarMenuSubProps): JSX.Element {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      className={cn(
        'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link SidebarMenuSubItem}. */
export type SidebarMenuSubItemProps = ComponentProps<'li'>;

/** One entry of a {@link SidebarMenuSub}. Renders an `<li>`. */
export function SidebarMenuSubItem({ className, ...props }: SidebarMenuSubItemProps): JSX.Element {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      className={cn('group/menu-sub-item relative', className)}
      {...props}
    />
  );
}

/** Props for {@link SidebarMenuSubButton}. */
export type SidebarMenuSubButtonProps = ComponentProps<'button'> & {
  /** Render the single child element (for example a router link) instead of a `<button>`. */
  asChild?: boolean | undefined;
  /** Marks the current page: accent background and `aria-current="page"`. */
  isActive?: boolean | undefined;
  /** Text size. Default `'md'`. */
  size?: SidebarMenuSubButtonSize | undefined;
};

/** A link or button inside a {@link SidebarMenuSubItem}. Same states as {@link SidebarMenuButton}. */
export function SidebarMenuSubButton({
  className,
  asChild = false,
  isActive = false,
  size = 'md',
  ...props
}: SidebarMenuSubButtonProps): JSX.Element {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-size={size}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-7 w-full min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-left text-foreground outline-none',
        'hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
        'data-[active=true]:bg-accent data-[active=true]:text-accent-foreground',
        size === 'sm' ? 'text-xs' : 'text-sm',
        '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground data-[active=true]:[&>svg]:text-accent-foreground',
        className,
      )}
      {...(asChild ? {} : { type: 'button' as const })}
      {...props}
    />
  );
}
