'use client';

import { Avatar as AvatarPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Avatar}. */
export type AvatarProps = ComponentProps<typeof AvatarPrimitive.Root>;

/**
 * A round user picture that falls back to initials while the image loads or if it fails.
 * Size it with `className` (default `size-8`).
 *
 * @example
 * ```tsx
 * <Avatar>
 *   <AvatarImage src="/mina.png" alt="Mina" />
 *   <AvatarFallback>ML</AvatarFallback>
 * </Avatar>
 * ```
 */
export function Avatar({ className, ...props }: AvatarProps): JSX.Element {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

/** Props for {@link AvatarImage}. */
export type AvatarImageProps = ComponentProps<typeof AvatarPrimitive.Image>;

/** The picture. Shown only once it has loaded. */
export function AvatarImage({ className, ...props }: AvatarImageProps): JSX.Element {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

/** Props for {@link AvatarFallback}. */
export type AvatarFallbackProps = ComponentProps<typeof AvatarPrimitive.Fallback>;

/** Shown until the image loads, or when there is none: usually initials or an icon. */
export function AvatarFallback({ className, ...props }: AvatarFallbackProps): JSX.Element {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted text-sm',
        className,
      )}
      {...props}
    />
  );
}
