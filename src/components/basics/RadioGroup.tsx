'use client';

import { CircleIcon } from 'lucide-react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link RadioGroup}. */
export type RadioGroupProps = ComponentProps<typeof RadioGroupPrimitive.Root>;

/**
 * A set of options where exactly one is picked. Arrow keys move between items.
 *
 * @example
 * ```tsx
 * <RadioGroup defaultValue="monthly">
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="monthly" id="monthly" />
 *     <Label htmlFor="monthly">Monthly</Label>
 *   </div>
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="yearly" id="yearly" />
 *     <Label htmlFor="yearly">Yearly</Label>
 *   </div>
 * </RadioGroup>
 * ```
 */
export function RadioGroup({ className, ...props }: RadioGroupProps): JSX.Element {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  );
}

/** Props for {@link RadioGroupItem}. */
export type RadioGroupItemProps = ComponentProps<typeof RadioGroupPrimitive.Item>;

/** One option of a {@link RadioGroup}. */
export function RadioGroupItem({ className, ...props }: RadioGroupItemProps): JSX.Element {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs outline-none transition-[color,box-shadow] dark:bg-input/30',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        'data-[state=checked]:border-primary',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary"
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
