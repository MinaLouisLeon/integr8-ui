'use client';

import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';
import {
  menuCheckItemClass,
  menuContentClass,
  menuIndicatorClass,
  menuItemClass,
  menuLabelClass,
  menuSeparatorClass,
  menuShortcutClass,
  menuSubTriggerClass,
  popperAnimation,
} from '../basics/floatingStyles';

/** Props for {@link ContextMenu}. */
export type ContextMenuProps = ComponentProps<typeof ContextMenuPrimitive.Root>;

/**
 * A menu that opens at the pointer on right-click (or long-press on touch, or the context-menu
 * key). Fully keyboard-usable (arrows, type-ahead, `Esc`).
 *
 * @example
 * ```tsx
 * <ContextMenu>
 *   <ContextMenuTrigger className="h-40 w-64 border border-dashed">Right-click here</ContextMenuTrigger>
 *   <ContextMenuContent>
 *     <ContextMenuItem>Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut></ContextMenuItem>
 *     <ContextMenuSeparator />
 *     <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
 *   </ContextMenuContent>
 * </ContextMenu>
 * ```
 */
export function ContextMenu(props: ContextMenuProps): JSX.Element {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

/** Props for {@link ContextMenuTrigger}. */
export type ContextMenuTriggerProps = ComponentProps<typeof ContextMenuPrimitive.Trigger>;

/** The area that opens the menu on right-click. Use `asChild` to make your own element the area. */
export function ContextMenuTrigger(props: ContextMenuTriggerProps): JSX.Element {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />;
}

/** Props for {@link ContextMenuPortal}. */
export type ContextMenuPortalProps = ComponentProps<typeof ContextMenuPrimitive.Portal>;

/** Renders its children into `document.body`. {@link ContextMenuContent} already uses it. */
export function ContextMenuPortal(props: ContextMenuPortalProps): JSX.Element {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />;
}

/** Props for {@link ContextMenuContent}. */
export type ContextMenuContentProps = ComponentProps<typeof ContextMenuPrimitive.Content>;

/** The menu panel, placed at the pointer. */
export function ContextMenuContent({ className, ...props }: ContextMenuContentProps): JSX.Element {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          menuContentClass,
          'max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin)',
          popperAnimation,
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

/** Props for {@link ContextMenuGroup}. */
export type ContextMenuGroupProps = ComponentProps<typeof ContextMenuPrimitive.Group>;

/** Groups related items. */
export function ContextMenuGroup(props: ContextMenuGroupProps): JSX.Element {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

/** Props for {@link ContextMenuItem}. */
export type ContextMenuItemProps = ComponentProps<typeof ContextMenuPrimitive.Item> & {
  /** Indent the item to line up with checkbox and radio items. */
  inset?: boolean | undefined;
  /** `'destructive'` colors the item for dangerous actions. Default `'default'`. */
  variant?: 'default' | 'destructive' | undefined;
};

/** A menu item. Runs `onSelect` and closes the menu when picked. */
export function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: ContextMenuItemProps): JSX.Element {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(menuItemClass, className)}
      {...props}
    />
  );
}

/** Props for {@link ContextMenuCheckboxItem}. */
export type ContextMenuCheckboxItemProps = ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>;

/** An item that toggles on and off, with a check mark. */
export function ContextMenuCheckboxItem({
  className,
  children,
  ...props
}: ContextMenuCheckboxItemProps): JSX.Element {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(menuCheckItemClass, className)}
      {...props}
    >
      <span className={menuIndicatorClass}>
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon aria-hidden="true" className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

/** Props for {@link ContextMenuRadioGroup}. */
export type ContextMenuRadioGroupProps = ComponentProps<typeof ContextMenuPrimitive.RadioGroup>;

/** A set of {@link ContextMenuRadioItem}s where one is picked. */
export function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps): JSX.Element {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

/** Props for {@link ContextMenuRadioItem}. */
export type ContextMenuRadioItemProps = ComponentProps<typeof ContextMenuPrimitive.RadioItem>;

/** One choice of a {@link ContextMenuRadioGroup}, with a dot when picked. */
export function ContextMenuRadioItem({
  className,
  children,
  ...props
}: ContextMenuRadioItemProps): JSX.Element {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(menuCheckItemClass, className)}
      {...props}
    >
      <span className={menuIndicatorClass}>
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon aria-hidden="true" className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

/** Props for {@link ContextMenuLabel}. */
export type ContextMenuLabelProps = ComponentProps<typeof ContextMenuPrimitive.Label> & {
  /** Indent the label to line up with checkbox and radio items. */
  inset?: boolean | undefined;
};

/** A heading for a group of items. Not selectable. */
export function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuLabelProps): JSX.Element {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(menuLabelClass, className)}
      {...props}
    />
  );
}

/** Props for {@link ContextMenuSeparator}. */
export type ContextMenuSeparatorProps = ComponentProps<typeof ContextMenuPrimitive.Separator>;

/** A divider line between groups. */
export function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuSeparatorProps): JSX.Element {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn(menuSeparatorClass, className)}
      {...props}
    />
  );
}

/** Props for {@link ContextMenuShortcut}. */
export type ContextMenuShortcutProps = ComponentProps<'span'>;

/**
 * A keyboard shortcut hint at the right of an item. Display only; it does not bind keys.
 * Put a `<Shortcut variant="text" />` inside for an OS-aware hint.
 */
export function ContextMenuShortcut({
  className,
  ...props
}: ContextMenuShortcutProps): JSX.Element {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(menuShortcutClass, className)}
      {...props}
    />
  );
}

/** Props for {@link ContextMenuSub}. */
export type ContextMenuSubProps = ComponentProps<typeof ContextMenuPrimitive.Sub>;

/** A submenu: a {@link ContextMenuSubTrigger} and a {@link ContextMenuSubContent}. */
export function ContextMenuSub(props: ContextMenuSubProps): JSX.Element {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

/** Props for {@link ContextMenuSubTrigger}. */
export type ContextMenuSubTriggerProps = ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  /** Indent the item to line up with checkbox and radio items. */
  inset?: boolean | undefined;
};

/** The item that opens a submenu, with a chevron. */
export function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuSubTriggerProps): JSX.Element {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(menuSubTriggerClass, className)}
      {...props}
    >
      {children}
      <ChevronRightIcon aria-hidden="true" className="ml-auto size-4" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

/** Props for {@link ContextMenuSubContent}. */
export type ContextMenuSubContentProps = ComponentProps<typeof ContextMenuPrimitive.SubContent>;

/** The submenu panel. */
export function ContextMenuSubContent({
  className,
  ...props
}: ContextMenuSubContentProps): JSX.Element {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent
        data-slot="context-menu-sub-content"
        className={cn(
          menuContentClass,
          'origin-(--radix-context-menu-content-transform-origin) shadow-lg',
          popperAnimation,
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}
