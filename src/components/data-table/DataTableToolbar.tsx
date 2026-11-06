'use client';

import type { RowData } from '@tanstack/react-table';
import { XIcon } from 'lucide-react';
import type { ComponentProps, JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../basics/Button';
import { Input } from '../basics/Input';
import { DataTableViewOptions } from './DataTableViewOptions';
import type { DataTableInstance } from './dataTableFeatures';
import { useDataTableLabels } from './dataTableLabels';

/** Props for {@link DataTableToolbar}. */
export type DataTableToolbarProps<TData extends RowData> = ComponentProps<'div'> & {
  /** The table instance. */
  table: DataTableInstance<TData>;
  /** Show the search input that sets the table's global filter. Default `true`. */
  showSearch?: boolean | undefined;
  /** Show the {@link DataTableViewOptions} button on the right. Default `true`. */
  showViewOptions?: boolean | undefined;
  /** Extra filters or actions, shown after the search input. */
  children?: ReactNode;
};

/**
 * The bar above a {@link DataTable}: a search input (global filter), your own filters, a
 * "Reset" button while any filter is active, and the column visibility menu.
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   data={tasks}
 *   toolbar={(table) => (
 *     <DataTableToolbar table={table}>
 *       <Button size="sm" variant="outline" onClick={() => table.getColumn('status')?.setFilterValue('done')}>
 *         Done only
 *       </Button>
 *     </DataTableToolbar>
 *   )}
 * />
 * ```
 */
export function DataTableToolbar<TData extends RowData>({
  table,
  showSearch = true,
  showViewOptions = true,
  className,
  children,
  ...props
}: DataTableToolbarProps<TData>): JSX.Element {
  const labels = useDataTableLabels();
  const { globalFilter, columnFilters } = table.state;
  const search = typeof globalFilter === 'string' ? globalFilter : '';
  const filtered = search !== '' || columnFilters.length > 0;

  return (
    <div
      data-slot="data-table-toolbar"
      className={cn('flex items-center justify-between gap-2', className)}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {showSearch ? (
          <Input
            type="search"
            value={search}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchLabel}
            className="h-8 w-40 lg:w-64"
          />
        ) : null}
        {children}
        {filtered ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => {
              table.resetGlobalFilter(true);
              table.resetColumnFilters(true);
            }}
          >
            {labels.reset}
            <XIcon aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      {showViewOptions ? <DataTableViewOptions table={table} /> : null}
    </div>
  );
}
