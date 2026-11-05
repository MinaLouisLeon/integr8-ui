'use client';

import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import { Menubar as MenubarPrimitive } from 'radix-ui';
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

/** Props for {@link Menubar}. */
export type MenubarProps = ComponentProps<typeof MenubarPrimitive.Root>;

/**
 * A row of menus like a desktop app's File / Edit / View bar. Arrow keys move between menus
 * and items; type-ahead and `Esc` work as in a native menu bar.
 *
 * @example
 * ```tsx
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>File</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem>New file <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
 *       <MenubarSeparator />
 *       <MenubarItem>Exit</MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 */
export function Menubar({ className, ...props }: MenubarProps): JSX.Element {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        'flex h-9 items-center gap-1 rounded-md border bg-background p-1 shadow-xs',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link MenubarMenu}. */
export type MenubarMenuProps = ComponentProps<typeof MenubarPrimitive.Menu>;

/** One menu of the bar: a {@link MenubarTrigger} and a {@link MenubarContent}. */
export function MenubarMenu(props: MenubarMenuProps): JSX.Element {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

/** Props for {@link MenubarGroup}. */
export type MenubarGroupProps = ComponentProps<typeof MenubarPrimitive.Group>;

/** Groups related items. */
export function MenubarGroup(props: MenubarGroupProps): JSX.Element {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

/** Props for {@link MenubarPortal}. */
export type MenubarPortalProps = ComponentProps<typeof MenubarPrimitive.Portal>;

/** Renders its children into `document.body`. {@link MenubarContent} already uses it. */
export function MenubarPortal(props: MenubarPortalProps): JSX.Element {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

/** Props for {@link MenubarRadioGroup}. */
export type MenubarRadioGroupProps = ComponentProps<typeof MenubarPrimitive.RadioGroup>;

/** A set of {@link MenubarRadioItem}s where one is picked. */
export function MenubarRadioGroup(props: MenubarRadioGroupProps): JSX.Element {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />;
}

/** Props for {@link MenubarTrigger}. */
export type MenubarTriggerProps = ComponentProps<typeof MenubarPrimitive.Trigger>;

/** The button in the bar that opens a menu. */
export function MenubarTrigger({ className, ...props }: MenubarTriggerProps): JSX.Element {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        'flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none',
        'focus:bg-accent focus:text-accent-foreground',
        'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link MenubarContent}. */
export type MenubarContentProps = ComponentProps<typeof MenubarPrimitive.Content>;

/** The menu panel under its trigger. Defaults: `align="start"`, `alignOffset={-4}`, `sideOffset={8}`. */
export function MenubarContent({
  className,
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: MenubarContentProps): JSX.Element {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          menuContentClass,
          'min-w-[12rem] origin-(--radix-menubar-content-transform-origin)',
          popperAnimation,
          className,
        )}
        {...props}
      />
    </MenubarPortal>
  );
}

/** Props for {@link MenubarItem}. */
export type MenubarItemProps = ComponentProps<typeof MenubarPrimitive.Item> & {
  /** Indent the item to line up with checkbox and radio items. */
  inset?: boolean | undefined;
  /** `'destructive'` colors the item for dangerous actions. Default `'default'`. */
  variant?: 'default' | 'destructive' | undefined;
};

/** A menu item. Runs `onSelect` and closes the menu when picked. */
export function MenubarItem({
  className,
  inset,
  variant = 'default',
  ...props
}: MenubarItemProps): JSX.Element {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(menuItemClass, className)}
      {...props}
    />
  );
}

/** Props for {@link MenubarCheckboxItem}. */
export type MenubarCheckboxItemProps = ComponentProps<typeof MenubarPrimitive.CheckboxItem>;

/** An item that toggles on and off, with a check mark. */
export function MenubarCheckboxItem({
  className,
  children,
  ...props
}: MenubarCheckboxItemProps): JSX.Element {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(menuCheckItemClass, className)}
      {...props}
    >
      <span className={menuIndicatorClass}>
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon aria-hidden="true" className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

/** Props for {@link MenubarRadioItem}. */
export type MenubarRadioItemProps = ComponentProps<typeof MenubarPrimitive.RadioItem>;

/** One choice of a {@link MenubarRadioGroup}, with a dot when picked. */
export function MenubarRadioItem({
  className,
  children,
  ...props
}: MenubarRadioItemProps): JSX.Element {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(menuCheckItemClass, className)}
      {...props}
    >
      <span className={menuIndicatorClass}>
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon aria-hidden="true" className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

/** Props for {@link MenubarLabel}. */
export type MenubarLabelProps = ComponentProps<typeof MenubarPrimitive.Label> & {
  /** Indent the label to line up with checkbox and radio items. */
  inset?: boolean | undefined;
};

/** A heading for a group of items. Not selectable. */
export function MenubarLabel({ className, inset, ...props }: MenubarLabelProps): JSX.Element {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(menuLabelClass, className)}
      {...props}
    />
  );
}

/** Props for {@link MenubarSeparator}. */
export type MenubarSeparatorProps = ComponentProps<typeof MenubarPrimitive.Separator>;

/** A divider line between groups. */
export function MenubarSeparator({ className, ...props }: MenubarSeparatorProps): JSX.Element {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn(menuSeparatorClass, className)}
      {...props}
    />
  );
}

/** Props for {@link MenubarShortcut}. */
export type MenubarShortcutProps = ComponentProps<'span'>;

/**
 * A keyboard shortcut hint at the right of an item. Display only; it does not bind keys.
 * Put a `<Shortcut variant="text" />` inside for an OS-aware hint.
 */
export function MenubarShortcut({ className, ...props }: MenubarShortcutProps): JSX.Element {
  return (
    <span data-slot="menubar-shortcut" className={cn(menuShortcutClass, className)} {...props} />
  );
}

/** Props for {@link MenubarSub}. */
export type MenubarSubProps = ComponentProps<typeof MenubarPrimitive.Sub>;

/** A submenu: a {@link MenubarSubTrigger} and a {@link MenubarSubContent}. */
export function MenubarSub(props: MenubarSubProps): JSX.Element {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

/** Props for {@link MenubarSubTrigger}. */
export type MenubarSubTriggerProps = ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  /** Indent the item to line up with checkbox and radio items. */
  inset?: boolean | undefined;
};

/** The item that opens a submenu, with a chevron. */
export function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenubarSubTriggerProps): JSX.Element {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(menuSubTriggerClass, className)}
      {...props}
    >
      {children}
      <ChevronRightIcon aria-hidden="true" className="ml-auto size-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

/** Props for {@link MenubarSubContent}. */
export type MenubarSubContentProps = ComponentProps<typeof MenubarPrimitive.SubContent>;

/** The submenu panel. */
export function MenubarSubContent({ className, ...props }: MenubarSubContentProps): JSX.Element {
  return (
    <MenubarPortal>
      <MenubarPrimitive.SubContent
        data-slot="menubar-sub-content"
        className={cn(
          menuContentClass,
          'origin-(--radix-menubar-content-transform-origin) shadow-lg',
          popperAnimation,
          className,
        )}
        {...props}
      />
    </MenubarPortal>
  );
}
