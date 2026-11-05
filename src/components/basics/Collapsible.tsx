'use client';

import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Collapsible}. */
export type CollapsibleProps = ComponentProps<typeof CollapsiblePrimitive.Root>;

/**
 * A single section that shows and hides its content. For several sections use
 * {@link Accordion}.
 *
 * @example
 * ```tsx
 * <Collapsible>
 *   <CollapsibleTrigger asChild><Button variant="ghost">Show details</Button></CollapsibleTrigger>
 *   <CollapsibleContent>...</CollapsibleContent>
 * </Collapsible>
 * ```
 */
export function Collapsible(props: CollapsibleProps): JSX.Element {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

/** Props for {@link CollapsibleTrigger}. */
export type CollapsibleTriggerProps = ComponentProps<typeof CollapsiblePrimitive.Trigger>;

/** Toggles the {@link Collapsible}. */
export function CollapsibleTrigger(props: CollapsibleTriggerProps): JSX.Element {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />;
}

/** Props for {@link CollapsibleContent}. */
export type CollapsibleContentProps = ComponentProps<typeof CollapsiblePrimitive.Content>;

/** The content that shows and hides, animated open and closed. */
export function CollapsibleContent({ className, ...props }: CollapsibleContentProps): JSX.Element {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        'overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
        className,
      )}
      {...props}
    />
  );
}
