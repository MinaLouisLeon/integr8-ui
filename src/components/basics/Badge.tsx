import { cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Visual style of a {@link Badge}. */
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info';

const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow]',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
    '[&>svg]:pointer-events-none [&>svg]:size-3',
    // Integr8 theme: pill badges, like integr8-media.com.
    'in-data-[theme=integr8]:rounded-full',
  ],
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        success: 'border-transparent bg-success/15 text-success',
        warning: 'border-transparent bg-warning/15 text-warning',
        info: 'border-transparent bg-info/15 text-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

/** Props for {@link Badge}. */
export type BadgeProps = ComponentProps<'span'> & {
  /** Visual style. Default `'default'` (primary color). */
  variant?: BadgeVariant | undefined;
  /** Render the single child element (for example a link) with the badge's styles. */
  asChild?: boolean | undefined;
};

/**
 * A small label for a status or count. Pill-shaped in the Integr8 theme.
 *
 * @example
 * ```tsx
 * <Badge>New</Badge>
 * <Badge variant="success">Online</Badge>
 * ```
 */
export function Badge({ className, variant, asChild = false, ...props }: BadgeProps): JSX.Element {
  const Comp = asChild ? Slot.Root : 'span';
  return (
    <Comp
      data-slot="badge"
      data-variant={variant ?? 'default'}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}
