'use client';

import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link ScrollArea}. */
export type ScrollAreaProps = ComponentProps<typeof ScrollAreaPrimitive.Root>;

/**
 * A scrolling box with thin themed scrollbars. Native scrolling and keyboard still work.
 * Give it a fixed height (or width) with `className`. Shows a vertical bar; add a
 * horizontal one with `<ScrollBar orientation="horizontal" />` inside.
 *
 * @example
 * ```tsx
 * <ScrollArea className="h-72 w-48 rounded-md border">...</ScrollArea>
 * ```
 */
export function ScrollArea({ className, children, ...props }: ScrollAreaProps): JSX.Element {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

/** Props for {@link ScrollBar}. */
export type ScrollBarProps = ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>;

/** A scrollbar for a {@link ScrollArea}. Default `orientation="vertical"`. */
export function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: ScrollBarProps): JSX.Element {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'flex touch-none p-px transition-colors select-none',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}
