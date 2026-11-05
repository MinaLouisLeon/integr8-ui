import { ChevronRightIcon, EllipsisIcon } from 'lucide-react';
import { Slot } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Breadcrumb}. */
export type BreadcrumbProps = ComponentProps<'nav'>;

/**
 * Shows where the current page sits in a hierarchy.
 *
 * @example
 * ```tsx
 * <Breadcrumb>
 *   <BreadcrumbList>
 *     <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem><BreadcrumbPage>Settings</BreadcrumbPage></BreadcrumbItem>
 *   </BreadcrumbList>
 * </Breadcrumb>
 * ```
 */
export function Breadcrumb(props: BreadcrumbProps): JSX.Element {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

/** Props for {@link BreadcrumbList}. */
export type BreadcrumbListProps = ComponentProps<'ol'>;

/** The ordered list inside a {@link Breadcrumb}. */
export function BreadcrumbList({ className, ...props }: BreadcrumbListProps): JSX.Element {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link BreadcrumbItem}. */
export type BreadcrumbItemProps = ComponentProps<'li'>;

/** One step of a {@link Breadcrumb}. */
export function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps): JSX.Element {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  );
}

/** Props for {@link BreadcrumbLink}. */
export type BreadcrumbLinkProps = ComponentProps<'a'> & {
  /** Render the single child (for example a router `Link`) instead of an `<a>`. */
  asChild?: boolean | undefined;
};

/** A link to an earlier step. Use `asChild` with your router's link component. */
export function BreadcrumbLink({
  asChild = false,
  className,
  ...props
}: BreadcrumbLinkProps): JSX.Element {
  const Comp = asChild ? Slot.Root : 'a';
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn('transition-colors hover:text-foreground', className)}
      {...props}
    />
  );
}

/** Props for {@link BreadcrumbPage}. */
export type BreadcrumbPageProps = ComponentProps<'span'>;

/** The current page: the last step, not a link. */
export function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps): JSX.Element {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn('font-normal text-foreground', className)}
      {...props}
    />
  );
}

/** Props for {@link BreadcrumbSeparator}. */
export type BreadcrumbSeparatorProps = ComponentProps<'li'>;

/** The divider between steps. Shows a chevron unless you pass children. */
export function BreadcrumbSeparator({
  children,
  className,
  ...props
}: BreadcrumbSeparatorProps): JSX.Element {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  );
}

/** Props for {@link BreadcrumbEllipsis}. */
export type BreadcrumbEllipsisProps = ComponentProps<'span'>;

/** Stands for collapsed steps, for example as the trigger of a dropdown menu. */
export function BreadcrumbEllipsis({ className, ...props }: BreadcrumbEllipsisProps): JSX.Element {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <EllipsisIcon className="size-4" aria-hidden="true" />
      <span className="sr-only">More</span>
    </span>
  );
}
