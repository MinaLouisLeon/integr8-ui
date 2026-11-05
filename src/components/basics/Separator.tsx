'use client';

import { Separator as SeparatorPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Separator}. */
export type SeparatorProps = ComponentProps<typeof SeparatorPrimitive.Root>;

/**
 * A thin line between content. Decorative by default (hidden from screen readers); set
 * `decorative={false}` when it separates meaningful sections.
 *
 * @example
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" className="h-4" />
 * ```
 */
export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps): JSX.Element {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      {...props}
    />
  );
}
