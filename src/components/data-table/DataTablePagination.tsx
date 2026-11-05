'use client';

import type { Table } from '@tanstack/react-table';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';
import { type ComponentProps, type JSX, useId } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../basics/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../basics/Select';
import { useDataTableLabels } from './dataTableLabels';

/** Page sizes offered by {@link DataTablePagination} when none are given. */
const DEFAULT_PAGE_SIZE_OPTIONS: readonly number[] = [10, 20, 30, 50, 100];

/** Props for {@link DataTablePagination}. */
export type DataTablePaginationProps<TData> = ComponentProps<'div'> & {
  /** The table instance. */
  table: Table<TData>;
  /** Choices in the "Rows per page" select. Default `[10, 20, 30, 50, 100]`. */
  pageSizeOptions?: readonly number[] | undefined;
};

/**
 * The bar under a {@link DataTable}: the selected row count (when row selection is on), a
 * page size select, the page position and first / previous / next / last buttons.
 *
 * @example
 * ```tsx
 * <DataTablePagination table={table} pageSizeOptions={[25, 50, 100]} />
 * ```
 */
export function DataTablePagination<TData>({
  table,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
  ...props
}: DataTablePaginationProps<TData>): JSX.Element {
  const labels = useDataTableLabels();
  const labelId = useId();
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = Math.max(1, table.getPageCount());
  // Keep the current size selectable even when it is not one of the options.
  const sizes = [...new Set([...pageSizeOptions, pageSize])].sort((a, b) => a - b);
  const selectionEnabled = Boolean(table.options.enableRowSelection);

  return (
    <div
      data-slot="data-table-pagination"
      className={cn('flex flex-wrap items-center justify-between gap-4 px-2', className)}
      {...props}
    >
      <div className="flex-1 text-sm text-muted-foreground" aria-live="polite">
        {selectionEnabled
          ? labels.selectedRows(
              table.getFilteredSelectedRowModel().rows.length,
              table.getFilteredRowModel().rows.length,
            )
          : null}
      </div>
      <div className="flex flex-wrap items-center gap-4 lg:gap-8">
        <div className="flex items-center gap-2">
          <p id={labelId} className="text-sm font-medium">
            {labels.rowsPerPage}
          </p>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="w-20" aria-labelledby={labelId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {sizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm font-medium" aria-live="polite">
          {labels.page(pageIndex + 1, pageCount)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden lg:inline-flex"
            aria-label={labels.firstPage}
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.firstPage()}
          >
            <ChevronsLeftIcon aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={labels.previousPage}
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={labels.nextPage}
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRightIcon aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden lg:inline-flex"
            aria-label={labels.lastPage}
            disabled={!table.getCanNextPage()}
            onClick={() => table.lastPage()}
          >
            <ChevronsRightIcon aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
