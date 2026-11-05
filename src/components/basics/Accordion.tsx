'use client';

import { ChevronDownIcon } from 'lucide-react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Accordion}. Set `type="single"` or `type="multiple"`. */
export type AccordionProps = ComponentProps<typeof AccordionPrimitive.Root>;

/**
 * A stack of sections that expand and collapse.
 *
 * @example
 * ```tsx
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="billing">
 *     <AccordionTrigger>Billing</AccordionTrigger>
 *     <AccordionContent>Invoices are sent monthly.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
export function Accordion(props: AccordionProps): JSX.Element {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

/** Props for {@link AccordionItem}. */
export type AccordionItemProps = ComponentProps<typeof AccordionPrimitive.Item>;

/** One section of an {@link Accordion}. */
export function AccordionItem({ className, ...props }: AccordionItemProps): JSX.Element {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b last:border-b-0', className)}
      {...props}
    />
  );
}

/** Props for {@link AccordionTrigger}. */
export type AccordionTriggerProps = ComponentProps<typeof AccordionPrimitive.Trigger>;

/** The clickable header of an {@link AccordionItem}, with a chevron that turns when open. */
export function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps): JSX.Element {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-none transition-all hover:underline',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/** Props for {@link AccordionContent}. */
export type AccordionContentProps = ComponentProps<typeof AccordionPrimitive.Content>;

/** The body of an {@link AccordionItem}, animated open and closed. */
export function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps): JSX.Element {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
