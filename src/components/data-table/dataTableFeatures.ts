import {
  type Column,
  type ColumnDef,
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  type FilterFn,
  filterFns,
  globalFilteringFeature,
  type ReactTable,
  type Row,
  type RowData,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  type TableFeatures,
  type TableState,
  tableFeatures,
} from '@tanstack/react-table';

/**
 * The TanStack Table v9 features every {@link DataTable} uses: sorting, column and global
 * filtering, faceting (for {@link DataTableFacetedFilter}), pagination, column visibility and
 * row selection, with their row models and the built-in sort and filter functions (so string
 * names such as `filterFn: 'equals'` and `sortFn: 'alphanumeric'` work in column definitions).
 *
 * Use it to type your own TanStack helpers, for example
 * `createColumnHelper<DataTableFeatures, Task>()`.
 *
 * It lists only the features in use and does not extend `TableFeatures`: that interface has
 * every feature as an optional key, and TanStack's types would then treat them all as on.
 */
export interface DataTableFeatures {
  rowSortingFeature: typeof rowSortingFeature;
  columnFilteringFeature: typeof columnFilteringFeature;
  globalFilteringFeature: typeof globalFilteringFeature;
  columnFacetingFeature: typeof columnFacetingFeature;
  rowPaginationFeature: typeof rowPaginationFeature;
  columnVisibilityFeature: typeof columnVisibilityFeature;
  rowSelectionFeature: typeof rowSelectionFeature;
  filteredRowModel: NonNullable<TableFeatures['filteredRowModel']>;
  sortedRowModel: NonNullable<TableFeatures['sortedRowModel']>;
  paginatedRowModel: NonNullable<TableFeatures['paginatedRowModel']>;
  facetedRowModel: NonNullable<TableFeatures['facetedRowModel']>;
  facetedUniqueValues: NonNullable<TableFeatures['facetedUniqueValues']>;
  /** The built-in filter functions plus `oneOf` (see {@link DataTableFacetedFilter}). */
  filterFns: typeof filterFns & { oneOf: FilterFn<DataTableFeatures, RowData> };
  sortFns: typeof sortFns;
}

/**
 * Keeps a row when its value is one of the picked values (an array). An empty or missing
 * array keeps every row, and the filter removes itself. Registered as `filterFn: 'oneOf'`;
 * {@link DataTableFacetedFilter} sets arrays like this.
 */
const oneOfFilterFn: FilterFn<DataTableFeatures, RowData> = Object.assign(
  (row: Row<DataTableFeatures, RowData>, columnId: string, filterValue: unknown): boolean =>
    !Array.isArray(filterValue) ||
    filterValue.length === 0 ||
    filterValue.includes(row.getValue(columnId)),
  {
    autoRemove: (filterValue: unknown): boolean =>
      !Array.isArray(filterValue) || filterValue.length === 0,
  },
);

/**
 * The feature set passed to `useTable`. Row models come after their feature, as
 * `tableFeatures` requires.
 *
 * @internal
 */
export const dataTableFeatures: DataTableFeatures = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  // The full registries keep v8's behavior: every built-in name works, and 'auto' resolves.
  filterFns: { ...filterFns, oneOf: oneOfFilterFn },
  sortFns,
});

/**
 * A column of a {@link DataTable}: a TanStack Table v9 `ColumnDef` for the data table's
 * features. Use `accessorKey` or `accessorFn` for data columns and `id` for display columns
 * (such as an actions menu).
 */
export type DataTableColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
  DataTableFeatures,
  TData,
  TValue
>;

/**
 * The TanStack Table v9 instance behind a {@link DataTable}, as passed to the toolbar parts.
 * Read the current state with `table.state` (for example `table.state.pagination`).
 */
export type DataTableInstance<TData extends RowData> = ReactTable<
  DataTableFeatures,
  TData,
  TableState<DataTableFeatures>
>;

/** A column of a {@link DataTable}, as found in header contexts and `table.getColumn(id)`. */
export type DataTableColumn<TData extends RowData, TValue = unknown> = Column<
  DataTableFeatures,
  TData,
  TValue
>;

/** A row of a {@link DataTable}. */
export type DataTableRow<TData extends RowData> = Row<DataTableFeatures, TData>;

/** The full state of a {@link DataTable}: sorting, filters, pagination, visibility, selection. */
export type DataTableState = TableState<DataTableFeatures>;
