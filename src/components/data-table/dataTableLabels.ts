import { type Context, createContext, useContext } from 'react';

export type { DataTableColumnDef, DataTableInstance } from './dataTableFeatures';

/**
 * Every text the data table shows. Pass a partial object to `DataTable`'s `labels` prop to
 * translate or reword them; the parts inside the table read them from context.
 */
export interface DataTableLabels {
  /** Shown in the body when there are no rows. Default `'No results.'`. */
  noResults: string;
  /** Placeholder of the search input. Default `'Search…'`. */
  searchPlaceholder: string;
  /** Accessible name of the search input. Default `'Search rows'`. */
  searchLabel: string;
  /** Button that clears the search and every column filter. Default `'Reset'`. */
  reset: string;
  /** Button that opens the column visibility menu. Default `'View'`. */
  view: string;
  /** Heading of the column visibility menu. Default `'Toggle columns'`. */
  toggleColumns: string;
  /** Column header menu item. Default `'Asc'`. */
  sortAscending: string;
  /** Column header menu item. Default `'Desc'`. */
  sortDescending: string;
  /** Column header menu item. Default `'Hide'`. */
  hideColumn: string;
  /** Label of the page size select. Default `'Rows per page'`. */
  rowsPerPage: string;
  /** Page position text. Default `'Page 1 of 10'`. */
  page: (page: number, pageCount: number) => string;
  /** Selection summary. Default `'2 of 40 row(s) selected.'`. */
  selectedRows: (selected: number, total: number) => string;
  /** Pagination button. Default `'Go to first page'`. */
  firstPage: string;
  /** Pagination button. Default `'Go to previous page'`. */
  previousPage: string;
  /** Pagination button. Default `'Go to next page'`. */
  nextPage: string;
  /** Pagination button. Default `'Go to last page'`. */
  lastPage: string;
  /** Header checkbox of the selection column. Default `'Select all'`. */
  selectAll: string;
  /** Row checkbox of the selection column. Default `'Select row'`. */
  selectRow: string;
  /** Shown in a faceted filter's list when the search matches no option. Default `'No results.'`. */
  facetNoResults: string;
  /** Faceted filter item that clears the column's filter. Default `'Clear filters'`. */
  clearFilter: string;
  /** Badge text when more options are selected than fit. Default `'3 selected'`. */
  facetSelected: (count: number) => string;
}

/** The English texts used when no `labels` are given. */
export const defaultDataTableLabels: DataTableLabels = {
  noResults: 'No results.',
  searchPlaceholder: 'Search…',
  searchLabel: 'Search rows',
  reset: 'Reset',
  view: 'View',
  toggleColumns: 'Toggle columns',
  sortAscending: 'Asc',
  sortDescending: 'Desc',
  hideColumn: 'Hide',
  rowsPerPage: 'Rows per page',
  page: (page, pageCount) => `Page ${page} of ${pageCount}`,
  selectedRows: (selected, total) => `${selected} of ${total} row(s) selected.`,
  firstPage: 'Go to first page',
  previousPage: 'Go to previous page',
  nextPage: 'Go to next page',
  lastPage: 'Go to last page',
  selectAll: 'Select all',
  selectRow: 'Select row',
  facetNoResults: 'No results.',
  clearFilter: 'Clear filters',
  facetSelected: (count) => `${count} selected`,
};

/** @internal Labels of the surrounding DataTable. */
export const DataTableLabelsContext: Context<DataTableLabels> =
  createContext<DataTableLabels>(defaultDataTableLabels);

/** @internal The labels of the surrounding DataTable, or the defaults outside one. */
export function useDataTableLabels(): DataTableLabels {
  return useContext(DataTableLabelsContext);
}
