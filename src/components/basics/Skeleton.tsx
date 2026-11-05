import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Skeleton}. */
export type SkeletonProps = ComponentProps<'div'>;

/**
 * A pulsing placeholder shown while content loads. Size it with `className`.
 * Hidden from screen readers; announce loading elsewhere (for example with {@link Spinner}).
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-48" />
 * ```
 */
export function Skeleton({ className, ...props }: SkeletonProps): JSX.Element {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}
