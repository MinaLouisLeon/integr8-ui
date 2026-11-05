'use client';

import { Progress as ProgressPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Progress}. `value` from 0 to `max` (default 100); `null` means unknown. */
export type ProgressProps = ComponentProps<typeof ProgressPrimitive.Root>;

/**
 * A bar that shows how far a task has come. Give it an `aria-label` or `aria-labelledby`.
 *
 * @example
 * ```tsx
 * <Progress value={60} aria-label="Upload" />
 * ```
 */
export function Progress({ className, ...props }: ProgressProps): JSX.Element {
  const percent = toPercent(props.value, props.max);
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - percent}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

/** Turns a value into a 0–100 percentage, clamped. Unknown values count as 0. @internal */
export function toPercent(value: number | null | undefined, max: number | undefined): number {
  const limit = max !== undefined && max > 0 ? max : 100;
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, (value / limit) * 100));
}
