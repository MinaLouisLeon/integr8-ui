'use client';

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Header,
  type InitialTableState,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type TableState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  type ComponentProps,
  type JSX,
  type Key,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { cn } from '../../lib/cn';
import { Checkbox } from '../basics/Checkbox';
import { DataTablePagination } from './DataTablePagination';
import { DataTableToolbar } from './DataTableToolbar';
import {
  type DataTableColumnDef,
  type DataTableInstance,
  type DataTableLabels,
  DataTableLabelsContext,
  defaultDataTableLabels,
  useDataTableLabels,
} from './dataTableLabels';

/** One row the virtualizer wants rendered: matches `VirtualItem` from `@tanstack/react-virtual`. */
export interface DataTableVirtualRow {
  /** Index into the rows passed to the hook. */
  index: number;
  /** Top of the row, in px from the top of the body. */
  start: number;
  /** Bottom of the row, in px from the top of the body. */
  end: number;
  /** A stable React key. */
  key: Key;
}

/** What a {@link DataTableVirtualRowsHook} returns. */
export interface DataTableVirtualRows {
  /** The rows to render now (the visible ones plus overscan). */
  rows: readonly DataTableVirtualRow[];
  /** Height of all rows together, in px. */
  totalSize: number;
}

/**
 * A hook that virtualizes the body rows. DataTable calls it on every render with the rows to
 * show and the scroll container. Return `null` to render every row. Pass the same hook for
 * the whole life of the table (do not switch it on and off), as with any hook.
 *
 * @example
 * ```tsx
 * import { useVirtualizer } from '@tanstack/react-virtual';
 *
 * function useVirtualRows(rows: readonly unknown[], getScrollElement: () => HTMLDivElement | null) {
 *   const virtualizer = useVirtualizer({ count: rows.length, getScrollElement, estimateSize: () => 37 });
 *   return { rows: virtualizer.getVirtualItems(), totalSize: virtualizer.getTotalSize() };
 * }
 * ```
 */
export type DataTableVirtualRowsHook<TData> = (
  rows: readonly Row<TData>[],
  getScrollElement: () => HTMLDivElement | null,
) => DataTableVirtualRows | null;

/** Props for {@link DataTable}. */
export type DataTableProps<TData, TValue = unknown> = Omit<ComponentProps<'div'>, 'children'> & {
  /** Column definitions. Use {@link DataTableColumnHeader} as `header` for sortable columns. */
  columns: DataTableColumnDef<TData, TValue>[];
  /** The rows. Keep the array stable between renders (state or `useMemo`). */
  data: TData[];
  /** A stable id for each row. Default: the row index. Set it when rows can be selected. */
  getRowId?: ((row: TData, index: number, parent?: Row<TData>) => string) | undefined;

  /**
   * Add a checkbox column to select rows. Pass a function to allow selecting only some rows.
   * Default `false`.
   */
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean) | undefined;
  /** Allow sorting. Each column can still turn it off with `enableSorting: false`. Default `true`. */
  enableSorting?: boolean | undefined;
  /** Allow sorting by several columns with Shift+click. Default `true`. */
  enableMultiSort?: boolean | undefined;

  /**
   * The bar above the table. Default: a {@link DataTableToolbar} with search and the column
   * menu. Pass a function to render your own (it gets the table instance), or `false` for none.
   */
  toolbar?: false | ((table: DataTableInstance<TData>) => ReactNode) | undefined;
  /** Split rows into pages and show {@link DataTablePagination}. Default `true`. */
  paginate?: boolean | undefined;
  /** Rows per page at the start. Default `10`. */
  pageSize?: number | undefined;
  /** Choices in the "Rows per page" select. Default `[10, 20, 30, 50, 100]`. */
  pageSizeOptions?: readonly number[] | undefined;

  /** Sorting state, to control it from outside. */
  sorting?: SortingState | undefined;
  /** Called when the sorting changes. */
  onSortingChange?: OnChangeFn<SortingState> | undefined;
  /** Column filter state, to control it from outside. */
  columnFilters?: ColumnFiltersState | undefined;
  /** Called when a column filter changes. */
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState> | undefined;
  /** The search text (global filter), to control it from outside. */
  globalFilter?: string | undefined;
  /** Called when the search text changes. */
  onGlobalFilterChange?: OnChangeFn<string> | undefined;
  /** Page index and size, to control them from outside. */
  pagination?: PaginationState | undefined;
  /** Called when the page or page size changes. */
  onPaginationChange?: OnChangeFn<PaginationState> | undefined;
  /** Which columns are visible (`{ columnId: false }` hides one), to control it from outside. */
  columnVisibility?: VisibilityState | undefined;
  /** Called when a column is shown or hidden. */
  onColumnVisibilityChange?: OnChangeFn<VisibilityState> | undefined;
  /** Selected rows (`{ rowId: true }`), to control them from outside. */
  rowSelection?: RowSelectionState | undefined;
  /** Called when the selection changes. */
  onRowSelectionChange?: OnChangeFn<RowSelectionState> | undefined;
  /** Starting state for anything not controlled (for example a default sort). */
  initialState?: InitialTableState | undefined;

  /** The server sorts: `data` is already sorted. Default `false`. */
  manualSorting?: boolean | undefined;
  /** The server filters: `data` is already filtered. Default `false`. */
  manualFiltering?: boolean | undefined;
  /** The server pages: `data` is one page. Pass `rowCount` too. Default `false`. */
  manualPagination?: boolean | undefined;
  /** Total number of rows on the server, for the page count with `manualPagination`. */
  rowCount?: number | undefined;

  /** Shown in the body when there are no rows, instead of `labels.noResults`. */
  emptyState?: ReactNode;
  /** Texts used by the table and its parts, for translation. */
  labels?: Partial<DataTableLabels> | undefined;
  /** Virtualize the body rows, for example with `@tanstack/react-virtual`. */
  useVirtualRows?: DataTableVirtualRowsHook<TData> | undefined;
  /**
   * Classes for the scrolling box around the `<table>`. Give it a height (for example
   * `max-h-96`) when using `useVirtualRows`.
   */
  tableContainerClassName?: string | undefined;
};

/** The column id of the selection checkbox column added by `enableRowSelection`. */
const SELECT_COLUMN_ID = 'select';

function SelectAllCheckbox<TData>({ table }: { table: DataTableInstance<TData> }): JSX.Element {
  const labels = useDataTableLabels();
  return (
    <Checkbox
      className="translate-y-0.5"
      aria-label={labels.selectAll}
      checked={
        table.getIsAllPageRowsSelected()
          ? true
          : table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : false
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
    />
  );
}

function SelectRowCheckbox<TData>({ row }: { row: Row<TData> }): JSX.Element {
  const labels = useDataTableLabels();
  return (
    <Checkbox
      className="translate-y-0.5"
      aria-label={labels.selectRow}
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onCheckedChange={(value) => row.toggleSelected(value === true)}
    />
  );
}

// Labels come from context, so the column (and the column list) stays stable.
function selectColumn<TData>(): DataTableColumnDef<TData> {
  return {
    id: SELECT_COLUMN_ID,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    header: ({ table }) => <SelectAllCheckbox table={table} />,
    cell: ({ row }) => <SelectRowCheckbox row={row} />,
  };
}

function ariaSort<TData>(
  header: Header<TData, unknown>,
): 'ascending' | 'descending' | 'none' | undefined {
  if (header.isPlaceholder || !header.column.getCanSort()) return undefined;
  const sorted = header.column.getIsSorted();
  if (sorted === 'asc') return 'ascending';
  if (sorted === 'desc') return 'descending';
  return 'none';
}

/** Used when no `useVirtualRows` is given: render every row. */
function useNoVirtualRows(): null {
  return null;
}

const rowClass = 'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted';
const headClass =
  'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:w-8 [&:has([role=checkbox])]:pr-0';
const cellClass = 'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0';

/**
 * A data table on TanStack Table: sorting, search and column filters, pagination, column
 * visibility and row selection, with a hook-in for row virtualization. Works with client-side
 * data out of the box; set the `manual*` props to sort, filter or page on the server. Each
 * piece of state can be left to the table or controlled with its prop and `on*Change`.
 *
 * @example
 * ```tsx
 * type Task = { id: string; title: string; status: string };
 * const columns: DataTableColumnDef<Task>[] = [
 *   { accessorKey: 'title', header: ({ column }) => <DataTableColumnHeader column={column} title="Title" /> },
 *   { accessorKey: 'status', header: 'Status' },
 * ];
 *
 * <DataTable columns={columns} data={tasks} getRowId={(task) => task.id} enableRowSelection />
 * ```
 */
export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  getRowId,
  enableRowSelection = false,
  enableSorting = true,
  enableMultiSort = true,
  toolbar,
  paginate = true,
  pageSize = 10,
  pageSizeOptions,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  pagination,
  onPaginationChange,
  columnVisibility,
  onColumnVisibilityChange,
  rowSelection,
  onRowSelectionChange,
  initialState,
  manualSorting = false,
  manualFiltering = false,
  manualPagination = false,
  rowCount,
  emptyState,
  labels: labelOverrides,
  useVirtualRows,
  tableContainerClassName,
  className,
  ...props
}: DataTableProps<TData, TValue>): JSX.Element {
  const labels = useMemo<DataTableLabels>(
    () => ({ ...defaultDataTableLabels, ...labelOverrides }),
    [labelOverrides],
  );

  const selectable = enableRowSelection !== false;
  const allColumns = useMemo(
    () =>
      selectable
        ? [selectColumn<TData>() as DataTableColumnDef<TData, TValue>, ...columns]
        : columns,
    [columns, selectable],
  );

  // Only pass the pieces of state the caller controls; the table keeps the rest itself.
  const state: Partial<TableState> = {};
  if (sorting !== undefined) state.sorting = sorting;
  if (columnFilters !== undefined) state.columnFilters = columnFilters;
  if (globalFilter !== undefined) state.globalFilter = globalFilter;
  if (pagination !== undefined) state.pagination = pagination;
  if (columnVisibility !== undefined) state.columnVisibility = columnVisibility;
  if (rowSelection !== undefined) state.rowSelection = rowSelection;

  const table = useReactTable<TData>({
    data,
    columns: allColumns,
    state,
    initialState: { pagination: { pageIndex: 0, pageSize }, ...initialState },
    enableRowSelection,
    enableSorting,
    enableMultiSort,
    manualSorting,
    manualFiltering,
    // Without pagination every row is shown: skip the pagination row model.
    manualPagination: manualPagination || !paginate,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(getRowId ? { getRowId } : {}),
    ...(rowCount !== undefined ? { rowCount } : {}),
    ...(onSortingChange ? { onSortingChange } : {}),
    ...(onColumnFiltersChange ? { onColumnFiltersChange } : {}),
    ...(onGlobalFilterChange ? { onGlobalFilterChange } : {}),
    ...(onPaginationChange ? { onPaginationChange } : {}),
    ...(onColumnVisibilityChange ? { onColumnVisibilityChange } : {}),
    ...(onRowSelectionChange ? { onRowSelectionChange } : {}),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const getScrollElement = useCallback(() => scrollRef.current, []);
  const useRows = useVirtualRows ?? useNoVirtualRows;
  const rows = table.getRowModel().rows;
  const virtual = useRows(rows, getScrollElement);
  const columnCount = table.getVisibleLeafColumns().length;

  const renderRow = (row: Row<TData>, key: Key): JSX.Element => (
    <tr
      key={key}
      data-slot="data-table-row"
      data-state={row.getIsSelected() ? 'selected' : undefined}
      className={rowClass}
    >
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} data-slot="data-table-cell" className={cellClass}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );

  let body: ReactNode;
  if (rows.length === 0) {
    body = (
      <tr data-slot="data-table-empty" className={rowClass}>
        <td colSpan={columnCount} className="h-24 p-2 text-center text-muted-foreground">
          {emptyState ?? labels.noResults}
        </td>
      </tr>
    );
  } else if (virtual) {
    const first = virtual.rows[0];
    const last = virtual.rows[virtual.rows.length - 1];
    const paddingTop = first ? first.start : 0;
    const paddingBottom = last ? virtual.totalSize - last.end : 0;
    body = (
      <>
        {paddingTop > 0 ? (
          <tr data-slot="data-table-spacer">
            <td colSpan={columnCount} style={{ height: paddingTop, padding: 0 }} />
          </tr>
        ) : null}
        {virtual.rows.map((item) => {
          const row = rows[item.index];
          return row ? renderRow(row, item.key) : null;
        })}
        {paddingBottom > 0 ? (
          <tr data-slot="data-table-spacer">
            <td colSpan={columnCount} style={{ height: paddingBottom, padding: 0 }} />
          </tr>
        ) : null}
      </>
    );
  } else {
    body = rows.map((row) => renderRow(row, row.id));
  }

  return (
    <DataTableLabelsContext.Provider value={labels}>
      <div data-slot="data-table" className={cn('flex flex-col gap-4', className)} {...props}>
        {toolbar === false ? null : toolbar ? toolbar(table) : <DataTableToolbar table={table} />}
        <div
          ref={scrollRef}
          data-slot="data-table-container"
          data-virtualized={virtual ? '' : undefined}
          className={cn('relative w-full overflow-auto rounded-md border', tableContainerClassName)}
        >
          <table data-slot="data-table-table" className="w-full caption-bottom text-sm">
            <thead
              data-slot="data-table-header"
              className={cn('[&_tr]:border-b', virtual && 'sticky top-0 z-10 bg-background')}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className={rowClass}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      colSpan={header.colSpan}
                      aria-sort={ariaSort(header)}
                      data-slot="data-table-head"
                      className={headClass}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody data-slot="data-table-body" className="[&_tr:last-child]:border-0">
              {body}
            </tbody>
          </table>
        </div>
        {paginate ? <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} /> : null}
      </div>
    </DataTableLabelsContext.Provider>
  );
}
