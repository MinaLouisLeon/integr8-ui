import { cva } from 'class-variance-authority';
import type { ComponentProps, JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Visual style of an {@link EmptyState}. */
export type EmptyStateVariant = 'default' | 'outline';

const emptyStateVariants = cva(
  'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg p-6 text-center text-balance md:p-12',
  {
    variants: {
      variant: {
        default: '',
        outline: 'border border-dashed',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

/** Props for {@link EmptyState}. */
export type EmptyStateProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** The main message, such as "No projects yet". Rendered as a heading. */
  title: ReactNode;
  /** Secondary text that explains what to do next. */
  description?: ReactNode;
  /** An icon shown above the title, for example a lucide icon. Hidden from screen readers. */
  icon?: ReactNode;
  /** Heading level of the title. Default `3`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
  /** `'outline'` draws a dashed border around the area. Default `'default'` (no border). */
  variant?: EmptyStateVariant | undefined;
  /** Actions, such as buttons or links, shown under the text. */
  children?: ReactNode;
};

/**
 * The placeholder for a list, table or page that has nothing to show yet, with an optional
 * icon, a short explanation and actions.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<FolderIcon />}
 *   title="No projects yet"
 *   description="Create a project to get started."
 * >
 *   <Button>New project</Button>
 * </EmptyState>
 * ```
 */
export function EmptyState({
  className,
  title,
  description,
  icon,
  headingLevel = 3,
  variant,
  children,
  ...props
}: EmptyStateProps): JSX.Element {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <div
      data-slot="empty-state"
      data-variant={variant ?? 'default'}
      className={cn(emptyStateVariants({ variant }), className)}
      {...props}
    >
      <div className="flex max-w-sm flex-col items-center gap-2">
        {icon ? (
          <div
            data-slot="empty-state-icon"
            aria-hidden="true"
            className="mb-2 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6"
          >
            {icon}
          </div>
        ) : null}
        <Heading data-slot="empty-state-title" className="text-lg font-medium tracking-tight">
          {title}
        </Heading>
        {description ? (
          <div
            data-slot="empty-state-description"
            className="text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary"
          >
            {description}
          </div>
        ) : null}
      </div>
      {children ? (
        <div
          data-slot="empty-state-actions"
          className="flex w-full max-w-sm min-w-0 flex-wrap items-center justify-center gap-2"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
