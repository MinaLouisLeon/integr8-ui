'use client';

import { CheckIcon, MinusIcon } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Checkbox}. `checked` can be `true`, `false` or `'indeterminate'`. */
export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root>;

/**
 * A checkbox. Shows a dash when `checked="indeterminate"`. Pair it with a {@link Label}.
 *
 * @example
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <Checkbox id="terms" />
 *   <Label htmlFor="terms">Accept the terms</Label>
 * </div>
 * ```
 */
export function Checkbox({ className, ...props }: CheckboxProps): JSX.Element {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer group/checkbox size-4 shrink-0 rounded-[4px] border border-input shadow-xs outline-none transition-shadow dark:bg-input/30',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon
          aria-hidden="true"
          className="size-3.5 group-data-[state=indeterminate]/checkbox:hidden"
        />
        <MinusIcon
          aria-hidden="true"
          className="hidden size-3.5 group-data-[state=indeterminate]/checkbox:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
