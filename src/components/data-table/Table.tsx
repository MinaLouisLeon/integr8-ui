import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Table}. */
export type TableProps = ComponentProps<'table'> & {
  /** Classes for the scrolling box around the `<table>`. */
  containerClassName?: string | undefined;
};

/**
 * A styled HTML table for simple, static data: the same look as {@link DataTable} without
 * TanStack Table. Wrapped in a box that scrolls sideways on narrow screens. Use `DataTable`
 * when you need sorting, filtering, pagination or selection.
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableCaption>Recent invoices.</TableCaption>
 *   <TableHeader>
 *     <TableRow><TableHead>Invoice</TableHead><TableHead className="text-right">Amount</TableHead></TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow><TableCell>INV001</TableCell><TableCell className="text-right">$250.00</TableCell></TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */
export function Table({ className, containerClassName, ...props }: TableProps): JSX.Element {
  return (
    <div
      data-slot="table-container"
      className={cn('relative w-full overflow-x-auto', containerClassName)}
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}

/** Props for {@link TableHeader}. */
export type TableHeaderProps = ComponentProps<'thead'>;

/** The header rows of a {@link Table}. Renders a `<thead>`. */
export function TableHeader({ className, ...props }: TableHeaderProps): JSX.Element {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />;
}

/** Props for {@link TableBody}. */
export type TableBodyProps = ComponentProps<'tbody'>;

/** The body rows of a {@link Table}. Renders a `<tbody>`. */
export function TableBody({ className, ...props }: TableBodyProps): JSX.Element {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

/** Props for {@link TableFooter}. */
export type TableFooterProps = ComponentProps<'tfoot'>;

/** Totals or summary rows of a {@link Table}, on a muted background. Renders a `<tfoot>`. */
export function TableFooter({ className, ...props }: TableFooterProps): JSX.Element {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

/** Props for {@link TableRow}. */
export type TableRowProps = ComponentProps<'tr'>;

/**
 * A row. Highlights on hover; set `data-state="selected"` to mark it as selected.
 */
export function TableRow({ className, ...props }: TableRowProps): JSX.Element {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link TableHead}. */
export type TableHeadProps = ComponentProps<'th'>;

/** A header cell. Renders a `<th>`; pass `scope="col"` (or `"row"`) for screen readers. */
export function TableHead({ className, ...props }: TableHeadProps): JSX.Element {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground',
        '[&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link TableCell}. */
export type TableCellProps = ComponentProps<'td'>;

/** A body cell. Renders a `<td>`. */
export function TableCell({ className, ...props }: TableCellProps): JSX.Element {
  return (
    <td
      data-slot="table-cell"
      className={cn('p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  );
}

/** Props for {@link TableCaption}. */
export type TableCaptionProps = ComponentProps<'caption'>;

/** A caption under the {@link Table}, in muted text. Renders a `<caption>`. */
export function TableCaption({ className, ...props }: TableCaptionProps): JSX.Element {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}
