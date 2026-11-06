import type { ComponentProps, JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link PageHeader}. */
export type PageHeaderProps = Omit<ComponentProps<'header'>, 'title'> & {
  /** The page title. Rendered as a heading. */
  title: ReactNode;
  /** A short line under the title. */
  description?: ReactNode;
  /** Shown above the title, usually a `<Breadcrumb>`. */
  breadcrumb?: ReactNode;
  /** Buttons or menus shown at the end of the title row (they wrap below on narrow screens). */
  actions?: ReactNode;
  /** Heading level of the title. Default `1`. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  /** Extra content under the title row, such as `<Tabs>`. */
  children?: ReactNode;
};

/**
 * The top of a page: optional breadcrumb, the title with a description, and actions.
 * Renders a `<header>`. In the Integr8 theme the title uses the display font.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   breadcrumb={<Breadcrumb>...</Breadcrumb>}
 *   title="Projects"
 *   description="Everything your team is building."
 *   actions={<Button>New project</Button>}
 * />
 * ```
 */
export function PageHeader({
  className,
  title,
  description,
  breadcrumb,
  actions,
  headingLevel = 1,
  children,
  ...props
}: PageHeaderProps): JSX.Element {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <header data-slot="page-header" className={cn('flex flex-col gap-4', className)} {...props}>
      {breadcrumb ? <div data-slot="page-header-breadcrumb">{breadcrumb}</div> : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Heading
            data-slot="page-header-title"
            className="text-2xl font-semibold tracking-tight text-balance"
          >
            {title}
          </Heading>
          {description ? (
            <div data-slot="page-header-description" className="text-sm text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div
            data-slot="page-header-actions"
            className="flex shrink-0 flex-wrap items-center gap-2"
          >
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </header>
  );
}
