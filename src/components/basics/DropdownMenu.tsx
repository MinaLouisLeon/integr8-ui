'use client';

import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
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
} from './floatingStyles';

/** Props for {@link DropdownMenu}. */
export type DropdownMenuProps = ComponentProps<typeof DropdownMenuPrimitive.Root>;

/**
 * A menu that opens from a button. Fully keyboard-usable (arrows, type-ahead, `Esc`).
 *
 * @example
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild><Button variant="outline">Open</Button></DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuLabel>My account</DropdownMenuLabel>
 *     <DropdownMenuItem>Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut></DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */
export function DropdownMenu(props: DropdownMenuProps): JSX.Element {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

/** Props for {@link DropdownMenuPortal}. */
export type DropdownMenuPortalProps = ComponentProps<typeof DropdownMenuPrimitive.Portal>;

/** Renders its children into `document.body`. {@link DropdownMenuContent} already uses it. */
export function DropdownMenuPortal(props: DropdownMenuPortalProps): JSX.Element {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

/** Props for {@link DropdownMenuTrigger}. */
export type DropdownMenuTriggerProps = ComponentProps<typeof DropdownMenuPrimitive.Trigger>;

/** Opens the menu. Use `asChild` to make your own button the trigger. */
export function DropdownMenuTrigger(props: DropdownMenuTriggerProps): JSX.Element {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

/** Props for {@link DropdownMenuContent}. */
export type DropdownMenuContentProps = ComponentProps<typeof DropdownMenuPrimitive.Content>;

/** The menu panel. Default `sideOffset` is 4px. */
export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps): JSX.Element {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          menuContentClass,
          'max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)',
          popperAnimation,
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

/** Props for {@link DropdownMenuGroup}. */
export type DropdownMenuGroupProps = ComponentProps<typeof DropdownMenuPrimitive.Group>;

/** Groups related items. */
export function DropdownMenuGroup(props: DropdownMenuGroupProps): JSX.Element {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

/** Props for {@link DropdownMenuItem}. */
export type DropdownMenuItemProps = ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  /** Indent the item to line up with checkbox and radio items. */
  inset?: boolean | undefined;
  /** `'destructive'` colors the item for dangerous actions. Default `'default'`. */
  variant?: 'default' | 'destructive' | undefined;
};

/** A menu item. Runs `onSelect` and closes the menu when picked. */
export function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: DropdownMenuItemProps): JSX.Element {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(menuItemClass, className)}
      {...props}
    />
  );
}

/** Props for {@link DropdownMenuCheckboxItem}. */
export type DropdownMenuCheckboxItemProps = ComponentProps<
  typeof DropdownMenuPrimitive.CheckboxItem
>;

/** An item that toggles on and off, with a check mark. */
export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: DropdownMenuCheckboxItemProps): JSX.Element {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(menuCheckItemClass, className)}
      {...props}
    >
      <span className={menuIndicatorClass}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon aria-hidden="true" className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

/** Props for {@link DropdownMenuRadioGroup}. */
export type DropdownMenuRadioGroupProps = ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>;

/** A set of {@link DropdownMenuRadioItem}s where one is picked. */
export function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps): JSX.Element {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

/** Props for {@link DropdownMenuRadioItem}. */
export type DropdownMenuRadioItemProps = ComponentProps<typeof DropdownMenuPrimitive.RadioItem>;

/** One choice of a {@link DropdownMenuRadioGroup}, with a dot when picked. */
export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps): JSX.Element {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(menuCheckItemClass, className)}
      {...props}
    >
      <span className={menuIndicatorClass}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon aria-hidden="true" className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

/** Props for {@link DropdownMenuLabel}. */
export type DropdownMenuLabelProps = ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  /** Indent the label to line up with checkbox and radio items. */
  inset?: boolean | undefined;
};

/** A heading for a group of items. Not selectable. */
export function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps): JSX.Element {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(menuLabelClass, className)}
      {...props}
    />
  );
}

/** Props for {@link DropdownMenuSeparator}. */
export type DropdownMenuSeparatorProps = ComponentProps<typeof DropdownMenuPrimitive.Separator>;

/** A divider line between groups. */
export function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps): JSX.Element {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(menuSeparatorClass, className)}
      {...props}
    />
  );
}

/** Props for {@link DropdownMenuShortcut}. */
export type DropdownMenuShortcutProps = ComponentProps<'span'>;

/** A keyboard shortcut hint at the right of an item. Display only; it does not bind keys. */
export function DropdownMenuShortcut({
  className,
  ...props
}: DropdownMenuShortcutProps): JSX.Element {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(menuShortcutClass, className)}
      {...props}
    />
  );
}

/** Props for {@link DropdownMenuSub}. */
export type DropdownMenuSubProps = ComponentProps<typeof DropdownMenuPrimitive.Sub>;

/** A submenu: a {@link DropdownMenuSubTrigger} and a {@link DropdownMenuSubContent}. */
export function DropdownMenuSub(props: DropdownMenuSubProps): JSX.Element {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

/** Props for {@link DropdownMenuSubTrigger}. */
export type DropdownMenuSubTriggerProps = ComponentProps<
  typeof DropdownMenuPrimitive.SubTrigger
> & {
  /** Indent the item to line up with checkbox and radio items. */
  inset?: boolean | undefined;
};

/** The item that opens a submenu, with a chevron. */
export function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps): JSX.Element {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(menuSubTriggerClass, className)}
      {...props}
    >
      {children}
      <ChevronRightIcon aria-hidden="true" className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

/** Props for {@link DropdownMenuSubContent}. */
export type DropdownMenuSubContentProps = ComponentProps<typeof DropdownMenuPrimitive.SubContent>;

/** The submenu panel. */
export function DropdownMenuSubContent({
  className,
  ...props
}: DropdownMenuSubContentProps): JSX.Element {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        className={cn(
          menuContentClass,
          'origin-(--radix-dropdown-menu-content-transform-origin) shadow-lg',
          popperAnimation,
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}
