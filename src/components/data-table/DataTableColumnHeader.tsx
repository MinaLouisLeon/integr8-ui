'use client';

import type { RowData } from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, EyeOffIcon } from 'lucide-react';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../basics/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../basics/DropdownMenu';
import type { DataTableColumn } from './dataTableFeatures';
import { useDataTableLabels } from './dataTableLabels';

/** Props for {@link DataTableColumnHeader}. */
export type DataTableColumnHeaderProps<TData extends RowData, TValue> = ComponentProps<'div'> & {
  /** The column, from the header context: `header: ({ column }) => ...`. */
  column: DataTableColumn<TData, TValue>;
  /** The visible header text. */
  title: string;
};

/**
 * A column header with a menu to sort the column ascending or descending, or hide it. Shows
 * the sort direction as an icon. Columns that cannot sort or hide render the title as plain
 * text. The `<th>` around it carries `aria-sort`.
 *
 * @example
 * ```tsx
 * const columns: DataTableColumnDef<Task>[] = [
 *   {
 *     accessorKey: 'title',
 *     header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
 *   },
 * ];
 * ```
 */
export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>): JSX.Element {
  const labels = useDataTableLabels();
  const canSort = column.getCanSort();
  const canHide = column.getCanHide();

  if (!canSort && !canHide) {
    return (
      <div data-slot="data-table-column-header" className={className} {...props}>
        {title}
      </div>
    );
  }

  const sorted = column.getIsSorted();
  const SortIcon =
    sorted === 'desc' ? ArrowDownIcon : sorted === 'asc' ? ArrowUpIcon : ChevronsUpDownIcon;

  return (
    <div
      data-slot="data-table-column-header"
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          >
            <span>{title}</span>
            {canSort ? <SortIcon aria-hidden="true" /> : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {canSort ? (
            <>
              <DropdownMenuItem onSelect={() => column.toggleSorting(false)}>
                <ArrowUpIcon aria-hidden="true" />
                {labels.sortAscending}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => column.toggleSorting(true)}>
                <ArrowDownIcon aria-hidden="true" />
                {labels.sortDescending}
              </DropdownMenuItem>
            </>
          ) : null}
          {canSort && canHide ? <DropdownMenuSeparator /> : null}
          {canHide ? (
            <DropdownMenuItem onSelect={() => column.toggleVisibility(false)}>
              <EyeOffIcon aria-hidden="true" />
              {labels.hideColumn}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
