'use client';

import { Command as CommandPrimitive } from 'cmdk';
import { SearchIcon } from 'lucide-react';
import type { ComponentProps, JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../basics/Dialog';
import { menuShortcutClass } from '../basics/floatingStyles';

/** Props for {@link Command}. All cmdk `Command` props are supported. */
export type CommandProps = ComponentProps<typeof CommandPrimitive>;

/**
 * A searchable list of commands, filtered as you type and fully keyboard-usable (arrows,
 * `Enter`). Use it inline, or inside {@link CommandDialog} for a ⌘K palette.
 * Give it an accessible name with `label`.
 *
 * @example
 * ```tsx
 * <Command label="Commands">
 *   <CommandInput placeholder="Type a command…" />
 *   <CommandList>
 *     <CommandEmpty>No results.</CommandEmpty>
 *     <CommandGroup heading="Files">
 *       <CommandItem onSelect={openFile}>Open file <CommandShortcut>⌘O</CommandShortcut></CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </Command>
 * ```
 */
export function Command({ className, ...props }: CommandProps): JSX.Element {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link CommandDialog}. */
export type CommandDialogProps = Omit<ComponentProps<typeof Dialog>, 'children'> & {
  /** Title announced by screen readers (not shown). Default `'Command palette'`. */
  title?: string | undefined;
  /** Description announced by screen readers (not shown). Default `'Search for a command to run.'` */
  description?: string | undefined;
  /** Classes for the dialog window. */
  className?: string | undefined;
  /** Show the × button in the top-right corner. Default `false` (`Esc` closes the palette). */
  showCloseButton?: boolean | undefined;
  /** Props for the inner {@link Command}, such as `filter`, `loop` or `shouldFilter`. */
  commandProps?: Omit<CommandProps, 'children'> | undefined;
  /** A {@link CommandInput} and a {@link CommandList}. */
  children?: ReactNode;
};

/**
 * A command palette: a {@link Command} in a {@link Dialog}. Control it with `open` and
 * `onOpenChange`, and open it from your own key binding (for example ⌘K).
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * useEffect(() => {
 *   const onKeyDown = (event: KeyboardEvent) => {
 *     if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
 *       event.preventDefault();
 *       setOpen((value) => !value);
 *     }
 *   };
 *   document.addEventListener('keydown', onKeyDown);
 *   return () => document.removeEventListener('keydown', onKeyDown);
 * }, []);
 *
 * <CommandDialog open={open} onOpenChange={setOpen}>
 *   <CommandInput placeholder="Type a command…" />
 *   <CommandList>...</CommandList>
 * </CommandDialog>
 * ```
 */
export function CommandDialog({
  title = 'Command palette',
  description = 'Search for a command to run.',
  className,
  showCloseButton = false,
  commandProps,
  children,
  ...props
}: CommandDialogProps): JSX.Element {
  return (
    <Dialog {...props}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn('overflow-hidden p-0', className)}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command
          label={title}
          {...commandProps}
          className={cn(
            '**:data-[slot=command-input-wrapper]:h-12 **:data-[slot=command-input]:h-12',
            '[&_[cmdk-group]]:px-2 [&_[cmdk-group-heading]]:px-2',
            '[&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3',
            commandProps?.className,
          )}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/** Props for {@link CommandInput}. */
export type CommandInputProps = ComponentProps<typeof CommandPrimitive.Input>;

/** The search box, with a search icon. Typing filters the items. */
export function CommandInput({ className, ...props }: CommandInputProps): JSX.Element {
  return (
    <div data-slot="command-input-wrapper" className="flex h-9 items-center gap-2 border-b px-3">
      <SearchIcon aria-hidden="true" className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  );
}

/** Props for {@link CommandList}. */
export type CommandListProps = ComponentProps<typeof CommandPrimitive.List>;

/** The scrolling list that holds groups and items. Max height 300px. */
export function CommandList({ className, ...props }: CommandListProps): JSX.Element {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn('max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto', className)}
      {...props}
    />
  );
}

/** Props for {@link CommandEmpty}. */
export type CommandEmptyProps = ComponentProps<typeof CommandPrimitive.Empty>;

/** Shown when no item matches the search. */
export function CommandEmpty({ className, ...props }: CommandEmptyProps): JSX.Element {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn('py-6 text-center text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Props for {@link CommandGroup}. */
export type CommandGroupProps = ComponentProps<typeof CommandPrimitive.Group>;

/** A group of items with an optional `heading`. Hidden when none of its items match. */
export function CommandGroup({ className, ...props }: CommandGroupProps): JSX.Element {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'overflow-hidden p-1 text-foreground',
        '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link CommandSeparator}. */
export type CommandSeparatorProps = ComponentProps<typeof CommandPrimitive.Separator>;

/** A divider line between groups. Hidden while searching unless `alwaysRender` is set. */
export function CommandSeparator({ className, ...props }: CommandSeparatorProps): JSX.Element {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('-mx-1 h-px bg-border', className)}
      {...props}
    />
  );
}

/** Props for {@link CommandItem}. */
export type CommandItemProps = ComponentProps<typeof CommandPrimitive.Item>;

/**
 * One command. Runs `onSelect` when clicked or picked with `Enter`. Matching uses the text
 * content, or `value` and `keywords` when given.
 */
export function CommandItem({ className, ...props }: CommandItemProps): JSX.Element {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none',
        'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
        'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        "data-[selected=true]:[&_svg:not([class*='text-'])]:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link CommandShortcut}. */
export type CommandShortcutProps = ComponentProps<'span'>;

/**
 * A keyboard shortcut hint at the right of an item. Display only; it does not bind keys.
 * Put a `<Shortcut variant="text" />` inside for an OS-aware hint.
 */
export function CommandShortcut({ className, ...props }: CommandShortcutProps): JSX.Element {
  return (
    <span data-slot="command-shortcut" className={cn(menuShortcutClass, className)} {...props} />
  );
}
