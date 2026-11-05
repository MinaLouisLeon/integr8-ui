import { LoaderCircleIcon } from 'lucide-react';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Spinner}. All lucide icon props are supported. */
export type SpinnerProps = ComponentProps<typeof LoaderCircleIcon>;

/**
 * A spinning loading indicator, announced to screen readers as "Loading".
 * Change the label with `aria-label` and the size with `className` (default `size-4`).
 * It keeps turning when the user prefers reduced motion, since it is the only loading sign.
 *
 * @example
 * ```tsx
 * <Button disabled><Spinner /> Saving</Button>
 * ```
 */
export function Spinner({ className, ...props }: SpinnerProps): JSX.Element {
  return (
    <LoaderCircleIcon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}
