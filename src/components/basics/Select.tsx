'use client';

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Select as SelectPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';
import { popperAnimation } from './floatingStyles';

/** Props for {@link Select}. */
export type SelectProps = ComponentProps<typeof SelectPrimitive.Root>;

/**
 * A dropdown to pick one value from a list. Keyboard and type-ahead friendly.
 *
 * @example
 * ```tsx
 * <Select defaultValue="light">
 *   <SelectTrigger className="w-40" aria-label="Theme"><SelectValue /></SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="light">Light</SelectItem>
 *     <SelectItem value="dark">Dark</SelectItem>
 *   </SelectContent>
 * </Select>
 * ```
 */
export function Select(props: SelectProps): JSX.Element {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

/** Props for {@link SelectGroup}. */
export type SelectGroupProps = ComponentProps<typeof SelectPrimitive.Group>;

/** Groups items under a {@link SelectLabel}. */
export function SelectGroup(props: SelectGroupProps): JSX.Element {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

/** Props for {@link SelectValue}. */
export type SelectValueProps = ComponentProps<typeof SelectPrimitive.Value>;

/** Shows the picked item's text inside the trigger, or the `placeholder`. */
export function SelectValue(props: SelectValueProps): JSX.Element {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

/** Props for {@link SelectTrigger}. */
export type SelectTriggerProps = ComponentProps<typeof SelectPrimitive.Trigger> & {
  /** Height of the trigger. Default `'default'`. */
  size?: 'sm' | 'default' | undefined;
};

/** The button that opens the list. Set `aria-invalid` to show the error style. */
export function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: SelectTriggerProps): JSX.Element {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        'flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none transition-[color,box-shadow]',
        'data-[size=default]:h-9 data-[size=sm]:h-8 data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon aria-hidden="true" className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/** Props for {@link SelectContent}. */
export type SelectContentProps = ComponentProps<typeof SelectPrimitive.Content>;

/**
 * The list panel. Default `position="popper"` (below the trigger, as wide as it);
 * use `position="item-aligned"` for the native macOS-like placement.
 */
export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: SelectContentProps): JSX.Element {
  const popper = position === 'popper';
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          'relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md',
          popperAnimation,
          popper &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            popper &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

/** Props for {@link SelectLabel}. */
export type SelectLabelProps = ComponentProps<typeof SelectPrimitive.Label>;

/** A heading for a {@link SelectGroup}. Not selectable. */
export function SelectLabel({ className, ...props }: SelectLabelProps): JSX.Element {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('px-2 py-1.5 text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Props for {@link SelectItem}. */
export type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item>;

/** One option, with a check mark when picked. `value` must not be an empty string. */
export function SelectItem({ className, children, ...props }: SelectItemProps): JSX.Element {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none',
        'focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        '*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon aria-hidden="true" className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

/** Props for {@link SelectSeparator}. */
export type SelectSeparatorProps = ComponentProps<typeof SelectPrimitive.Separator>;

/** A divider line between groups. */
export function SelectSeparator({ className, ...props }: SelectSeparatorProps): JSX.Element {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

/** Props for {@link SelectScrollUpButton}. */
export type SelectScrollUpButtonProps = ComponentProps<typeof SelectPrimitive.ScrollUpButton>;

/** Shown at the top of a long list; scrolls up on hover. {@link SelectContent} renders it. */
export function SelectScrollUpButton({
  className,
  ...props
}: SelectScrollUpButtonProps): JSX.Element {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUpIcon aria-hidden="true" className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

/** Props for {@link SelectScrollDownButton}. */
export type SelectScrollDownButtonProps = ComponentProps<typeof SelectPrimitive.ScrollDownButton>;

/** Shown at the bottom of a long list; scrolls down on hover. {@link SelectContent} renders it. */
export function SelectScrollDownButton({
  className,
  ...props
}: SelectScrollDownButtonProps): JSX.Element {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDownIcon aria-hidden="true" className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}
