'use client';

import { Popover as PopoverPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';
import { popperAnimation } from './floatingStyles';

/** Props for {@link Popover}. */
export type PopoverProps = ComponentProps<typeof PopoverPrimitive.Root>;

/**
 * Floating content anchored to a trigger, such as a small form or a picker.
 *
 * @example
 * ```tsx
 * <Popover>
 *   <PopoverTrigger asChild><Button variant="outline">Dimensions</Button></PopoverTrigger>
 *   <PopoverContent>...</PopoverContent>
 * </Popover>
 * ```
 */
export function Popover(props: PopoverProps): JSX.Element {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

/** Props for {@link PopoverTrigger}. */
export type PopoverTriggerProps = ComponentProps<typeof PopoverPrimitive.Trigger>;

/** Opens and closes the {@link Popover}. */
export function PopoverTrigger(props: PopoverTriggerProps): JSX.Element {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/** Props for {@link PopoverAnchor}. */
export type PopoverAnchorProps = ComponentProps<typeof PopoverPrimitive.Anchor>;

/** Positions the popover against this element instead of the trigger. */
export function PopoverAnchor(props: PopoverAnchorProps): JSX.Element {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

/** Props for {@link PopoverContent}. */
export type PopoverContentProps = ComponentProps<typeof PopoverPrimitive.Content>;

/** The floating panel. Default `align="center"` and `sideOffset` 4px. */
export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: PopoverContentProps): JSX.Element {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden',
          popperAnimation,
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
