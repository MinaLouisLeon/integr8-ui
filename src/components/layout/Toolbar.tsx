'use client';

import { Toolbar as ToolbarPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';
import { type ButtonSize, type ButtonVariant, buttonStyles } from '../basics/Button';
import { type ToggleSize, type ToggleVariant, toggleStyles } from '../basics/Toggle';

/** Props for {@link Toolbar}. */
export type ToolbarProps = ComponentProps<typeof ToolbarPrimitive.Root>;

/**
 * A row (or column) of buttons and toggles, such as an editor's formatting bar. Built on the
 * Radix Toolbar: one Tab stop, arrow keys move between the items. Give it an `aria-label`.
 *
 * @example
 * ```tsx
 * <Toolbar aria-label="Formatting">
 *   <ToolbarToggleGroup type="multiple" aria-label="Text style">
 *     <ToolbarToggleItem value="bold" aria-label="Bold"><BoldIcon /></ToolbarToggleItem>
 *     <ToolbarToggleItem value="italic" aria-label="Italic"><ItalicIcon /></ToolbarToggleItem>
 *   </ToolbarToggleGroup>
 *   <ToolbarSeparator />
 *   <ToolbarButton>Share</ToolbarButton>
 * </Toolbar>
 * ```
 */
export function Toolbar({ className, ...props }: ToolbarProps): JSX.Element {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      className={cn(
        'flex min-w-0 items-center gap-1 rounded-lg border bg-card p-1 text-card-foreground',
        'data-[orientation=vertical]:w-fit data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link ToolbarButton}. */
export type ToolbarButtonProps = ComponentProps<typeof ToolbarPrimitive.Button> & {
  /** Visual style, as on `Button`. Default `'ghost'`. */
  variant?: ButtonVariant | undefined;
  /** Size, as on `Button`. Default `'sm'`; use `'icon-sm'` for an icon-only button. */
  size?: ButtonSize | undefined;
};

/** A button in the {@link Toolbar}, styled like `Button`. Icon-only buttons need an `aria-label`. */
export function ToolbarButton({
  className,
  variant = 'ghost',
  size = 'sm',
  ...props
}: ToolbarButtonProps): JSX.Element {
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-button"
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  );
}

/** Props for {@link ToolbarLink}. */
export type ToolbarLinkProps = ComponentProps<typeof ToolbarPrimitive.Link>;

/** A link in the {@link Toolbar}. Use `asChild` to render your router's link. */
export function ToolbarLink({ className, ...props }: ToolbarLinkProps): JSX.Element {
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      className={cn(buttonStyles({ variant: 'link', size: 'sm' }), className)}
      {...props}
    />
  );
}

/** Props for {@link ToolbarSeparator}. */
export type ToolbarSeparatorProps = ComponentProps<typeof ToolbarPrimitive.Separator>;

/** A line between groups of toolbar items, across the toolbar's direction. */
export function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps): JSX.Element {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        'shrink-0 bg-border',
        'data-[orientation=vertical]:mx-1 data-[orientation=vertical]:h-5 data-[orientation=vertical]:w-px',
        'data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-5',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link ToolbarToggleGroup}. */
export type ToolbarToggleGroupProps = ComponentProps<typeof ToolbarPrimitive.ToggleGroup>;

/** A set of {@link ToolbarToggleItem}s; `type="single"` or `type="multiple"`. */
export function ToolbarToggleGroup({ className, ...props }: ToolbarToggleGroupProps): JSX.Element {
  return (
    <ToolbarPrimitive.ToggleGroup
      data-slot="toolbar-toggle-group"
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  );
}

/** Props for {@link ToolbarToggleItem}. */
export type ToolbarToggleItemProps = ComponentProps<typeof ToolbarPrimitive.ToggleItem> & {
  /** Visual style, as on `Toggle`. Default `'default'`. */
  variant?: ToggleVariant | undefined;
  /** Size, as on `Toggle`. Default `'sm'`. */
  size?: ToggleSize | undefined;
};

/** A button that stays pressed, inside a {@link ToolbarToggleGroup}. Styled like `Toggle`. */
export function ToolbarToggleItem({
  className,
  variant,
  size = 'sm',
  ...props
}: ToolbarToggleItemProps): JSX.Element {
  return (
    <ToolbarPrimitive.ToggleItem
      data-slot="toolbar-toggle-item"
      className={cn(toggleStyles({ variant, size }), className)}
      {...props}
    />
  );
}
