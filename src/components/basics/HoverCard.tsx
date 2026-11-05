'use client';

import { HoverCard as HoverCardPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';
import { popperAnimation } from './floatingStyles';

/** Props for {@link HoverCard}. */
export type HoverCardProps = ComponentProps<typeof HoverCardPrimitive.Root>;

/**
 * A preview card that opens when a pointer rests on a link. Sighted mouse users only: do not
 * put anything there that is not also reachable another way.
 *
 * @example
 * ```tsx
 * <HoverCard>
 *   <HoverCardTrigger asChild><a href="/u/mina">@mina</a></HoverCardTrigger>
 *   <HoverCardContent>Designer at Integr8.</HoverCardContent>
 * </HoverCard>
 * ```
 */
export function HoverCard(props: HoverCardProps): JSX.Element {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

/** Props for {@link HoverCardTrigger}. */
export type HoverCardTriggerProps = ComponentProps<typeof HoverCardPrimitive.Trigger>;

/** The link that opens the card on hover. */
export function HoverCardTrigger(props: HoverCardTriggerProps): JSX.Element {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

/** Props for {@link HoverCardContent}. */
export type HoverCardContentProps = ComponentProps<typeof HoverCardPrimitive.Content>;

/** The card. Default `align="center"` and `sideOffset` 4px. */
export function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: HoverCardContentProps): JSX.Element {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden',
          popperAnimation,
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}
