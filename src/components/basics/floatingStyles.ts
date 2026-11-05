// Class names shared by floating content (menus, popovers, hover cards) and menu items.
// Internal: used by DropdownMenu, ContextMenu, Menubar and Command. Not public API.

/** Enter/exit animation for content positioned by Radix Popper (reads `data-side`). */
export const popperAnimation: string = [
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
  'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
].join(' ');

/** The surface of a menu (dropdown, context menu, menubar, submenu). */
export const menuContentClass: string =
  'z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md';

// Icons are muted, and take the accent text color while the item is highlighted so they stay
// readable on the accent background (violet in Integr8).
const svgInItem = [
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
  "data-[highlighted]:[&_svg:not([class*='text-'])]:text-accent-foreground",
].join(' ');

/** A plain menu item, with `data-inset` and `data-variant="destructive"` support. */
export const menuItemClass: string = [
  'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none',
  'focus:bg-accent focus:text-accent-foreground',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8',
  'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive',
  'dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:*:[svg]:!text-destructive',
  svgInItem,
].join(' ');

/** A checkbox or radio menu item: room on the left for the indicator. */
export const menuCheckItemClass: string = [
  'relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none',
  'focus:bg-accent focus:text-accent-foreground',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  svgInItem,
].join(' ');

/** The box on the left of a checkbox or radio menu item that holds its indicator. */
export const menuIndicatorClass: string =
  'pointer-events-none absolute left-2 flex size-3.5 items-center justify-center';

/** The item that opens a submenu. */
export const menuSubTriggerClass: string = [
  'flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none',
  'focus:bg-accent focus:text-accent-foreground data-[inset]:pl-8',
  'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
  svgInItem,
].join(' ');

/** A group heading inside a menu. */
export const menuLabelClass: string = 'px-2 py-1.5 text-sm font-medium data-[inset]:pl-8';

/** A divider line inside a menu. */
export const menuSeparatorClass: string = '-mx-1 my-1 h-px bg-border';

/** A keyboard shortcut hint at the right of a menu item. */
export const menuShortcutClass: string = [
  'ml-auto text-xs tracking-widest text-muted-foreground',
  // Readable on the accent background of a highlighted menu item or selected command item.
  'in-data-[highlighted]:text-accent-foreground in-data-[selected=true]:text-accent-foreground',
].join(' ');
