import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Kbd}. */
export type KbdProps = ComponentProps<'kbd'>;

/**
 * A single keyboard key, such as `Esc` or `⌘`. For a full OS-aware shortcut use `Shortcut`.
 *
 * @example
 * ```tsx
 * Press <Kbd>Esc</Kbd> to close.
 * ```
 */
export function Kbd({ className, ...props }: KbdProps): JSX.Element {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm border bg-muted px-1 font-sans text-xs font-medium text-muted-foreground',
        "[&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  );
}
