import { cva } from 'class-variance-authority';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Visual style of an {@link Alert}. */
export type AlertVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

const alertVariants = cva(
  [
    'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm',
    'has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3',
    '[&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  ],
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive: 'bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90',
        success: 'bg-card text-success *:data-[slot=alert-description]:text-success/90',
        warning: 'bg-card text-warning *:data-[slot=alert-description]:text-warning/90',
        info: 'bg-card text-info *:data-[slot=alert-description]:text-info/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

/** Props for {@link Alert}. */
export type AlertProps = ComponentProps<'div'> & {
  /** Visual style. Default `'default'`. */
  variant?: AlertVariant | undefined;
};

/**
 * A callout for a message the user should notice. Put an optional icon first, then
 * {@link AlertTitle} and {@link AlertDescription}.
 *
 * @example
 * ```tsx
 * <Alert variant="destructive">
 *   <CircleAlertIcon />
 *   <AlertTitle>Upload failed</AlertTitle>
 *   <AlertDescription>The file is larger than 10 MB.</AlertDescription>
 * </Alert>
 * ```
 */
export function Alert({ className, variant, ...props }: AlertProps): JSX.Element {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

/** Props for {@link AlertTitle}. */
export type AlertTitleProps = ComponentProps<'div'>;

/** The title line of an {@link Alert}. */
export function AlertTitle({ className, ...props }: AlertTitleProps): JSX.Element {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
      {...props}
    />
  );
}

/** Props for {@link AlertDescription}. */
export type AlertDescriptionProps = ComponentProps<'div'>;

/** The body text of an {@link Alert}. */
export function AlertDescription({ className, ...props }: AlertDescriptionProps): JSX.Element {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed',
        className,
      )}
      {...props}
    />
  );
}
