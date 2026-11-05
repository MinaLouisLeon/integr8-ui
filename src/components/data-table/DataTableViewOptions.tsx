'use client';

import type { Column, Table } from '@tanstack/react-table';
import { Settings2Icon } from 'lucide-react';
import type { JSX } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../basics/Button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../basics/DropdownMenu';
import { useDataTableLabels } from './dataTableLabels';

/** Props for {@link DataTableViewOptions}. */
export type DataTableViewOptionsProps<TData> = {
  /** The table instance. */
  table: Table<TData>;
  /** Classes for the trigger button. */
  className?: string | undefined;
};

/**
 * The column's display name: its `header` when that is a string, otherwise its `id`.
 *
 * @internal
 */
export function columnLabel<TData>(column: Column<TData, unknown>): string {
  const { header } = column.columnDef;
  return typeof header === 'string' ? header : column.id;
}

/**
 * A "View" button that opens a menu of checkboxes to show or hide columns. Lists every data
 * column (one with an accessor) that can be hidden.
 *
 * @example
 * ```tsx
 * <DataTable columns={columns} data={data} toolbar={(table) => <DataTableViewOptions table={table} />} />
 * ```
 */
export function DataTableViewOptions<TData>({
  table,
  className,
}: DataTableViewOptionsProps<TData>): JSX.Element {
  const labels = useDataTableLabels();
  const columns = table
    .getAllColumns()
    .filter((column) => column.accessorFn !== undefined && column.getCanHide());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-slot="data-table-view-options"
          className={cn('ml-auto h-8', className)}
        >
          <Settings2Icon aria-hidden="true" />
          {labels.view}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{labels.toggleColumns}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(value === true)}
            // Keep the menu open so several columns can be toggled in a row.
            onSelect={(event) => event.preventDefault()}
          >
            {columnLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
