import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Card}. */
export type CardProps = ComponentProps<'div'>;

/**
 * A bordered surface that groups related content. Compose it from {@link CardHeader},
 * {@link CardTitle}, {@link CardDescription}, {@link CardAction}, {@link CardContent} and
 * {@link CardFooter}.
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Project</CardTitle>
 *     <CardDescription>Last deployed 2 hours ago</CardDescription>
 *   </CardHeader>
 *   <CardContent>...</CardContent>
 *   <CardFooter><Button>Open</Button></CardFooter>
 * </Card>
 * ```
 */
export function Card({ className, ...props }: CardProps): JSX.Element {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link CardHeader}. */
export type CardHeaderProps = ComponentProps<'div'>;

/** The top of a {@link Card}: title, description and an optional {@link CardAction}. */
export function CardHeader({ className, ...props }: CardHeaderProps): JSX.Element {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link CardTitle}. */
export type CardTitleProps = ComponentProps<'div'>;

/** The title of a {@link Card}. Uses the display font in the Integr8 theme. */
export function CardTitle({ className, ...props }: CardTitleProps): JSX.Element {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold integr8:font-display', className)}
      {...props}
    />
  );
}

/** Props for {@link CardDescription}. */
export type CardDescriptionProps = ComponentProps<'div'>;

/** Secondary text under the {@link CardTitle}. */
export function CardDescription({ className, ...props }: CardDescriptionProps): JSX.Element {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Props for {@link CardAction}. */
export type CardActionProps = ComponentProps<'div'>;

/** A button or menu placed in the top-right corner of the {@link CardHeader}. */
export function CardAction({ className, ...props }: CardActionProps): JSX.Element {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

/** Props for {@link CardContent}. */
export type CardContentProps = ComponentProps<'div'>;

/** The main content of a {@link Card}. */
export function CardContent({ className, ...props }: CardContentProps): JSX.Element {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

/** Props for {@link CardFooter}. */
export type CardFooterProps = ComponentProps<'div'>;

/** The bottom row of a {@link Card}, usually for actions. */
export function CardFooter({ className, ...props }: CardFooterProps): JSX.Element {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}
