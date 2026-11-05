'use client';

import { cva } from 'class-variance-authority';
import { Toggle as TogglePrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Visual style of a {@link Toggle} or {@link ToggleGroup}. */
export type ToggleVariant = 'default' | 'outline';

/** Size of a {@link Toggle} or {@link ToggleGroup}. */
export type ToggleSize = 'default' | 'sm' | 'lg';

const toggleVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap outline-none transition-[color,box-shadow]',
    'hover:bg-muted hover:text-muted-foreground',
    'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 min-w-9 px-2',
        sm: 'h-8 min-w-8 px-1.5',
        lg: 'h-10 min-w-10 px-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

/**
 * The class names of a {@link Toggle}, shared with {@link ToggleGroup} items.
 *
 * @internal Not part of the public API.
 */
export function toggleStyles(
  options: { variant?: ToggleVariant | undefined; size?: ToggleSize | undefined } = {},
): string {
  return toggleVariants(options);
}

/** Props for {@link Toggle}. */
export type ToggleProps = ComponentProps<typeof TogglePrimitive.Root> & {
  /** Visual style. Default `'default'`. */
  variant?: ToggleVariant | undefined;
  /** Height and padding. Default `'default'`. */
  size?: ToggleSize | undefined;
};

/**
 * A button that stays pressed (on) or not (off), such as Bold in a text toolbar.
 * Icon-only toggles need an `aria-label`.
 *
 * @example
 * ```tsx
 * <Toggle aria-label="Bold"><BoldIcon /></Toggle>
 * ```
 */
export function Toggle({ className, variant, size, ...props }: ToggleProps): JSX.Element {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  );
}
