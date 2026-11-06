import { cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Visual style of a {@link Button}. */
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

/** Size of a {@link Button}. The `icon` sizes make a square button for a single icon. */
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    // Integr8 theme: pill buttons, like integr8-media.com.
    'integr8:rounded-full',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

/**
 * The class names of a {@link Button}, for elements that must look like one but cannot use
 * `asChild` (for example Radix `AlertDialog.Action`).
 *
 * @internal Not part of the public API.
 */
export function buttonStyles(
  options: { variant?: ButtonVariant | undefined; size?: ButtonSize | undefined } = {},
): string {
  return buttonVariants(options);
}

/** Props for {@link Button}. */
export type ButtonProps = ComponentProps<'button'> & {
  /** Visual style. Default `'default'` (primary color). */
  variant?: ButtonVariant | undefined;
  /** Height and padding. Default `'default'`. */
  size?: ButtonSize | undefined;
  /**
   * Render the single child element (for example a link) with the button's styles and props
   * instead of a `<button>`.
   */
  asChild?: boolean | undefined;
};

/**
 * A button. Pill-shaped in the Integr8 theme.
 *
 * @example
 * ```tsx
 * <Button onClick={save}>Save</Button>
 * <Button variant="outline" size="sm">Cancel</Button>
 * <Button asChild><a href="/docs">Docs</a></Button>
 * ```
 */
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps): JSX.Element {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? 'default'}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
