'use client';

import { Label as LabelPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Label}. */
export type LabelProps = ComponentProps<typeof LabelPrimitive.Root>;

/**
 * A label for a form control. Link it with `htmlFor`, or wrap the control. Dims itself when
 * the control before it (a `peer`) is disabled.
 *
 * @example
 * ```tsx
 * <Label htmlFor="name">Name</Label>
 * <Input id="name" />
 * ```
 */
export function Label({ className, ...props }: LabelProps): JSX.Element {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
