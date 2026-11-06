import type { Story } from '@ladle/react';
import type { RowSelectionState } from '@tanstack/react-table';
import { TableIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  type DataTableVirtualRow,
  type DataTableVirtualRows,
  EmptyState,
  Toaster,
} from '../../src';
import { makeTasks, type Task, taskColumns } from './tasks';

/** Sorting, search, pagination and column visibility with the default toolbar. */
export const Default: Story = () => {
  const data = useMemo(() => makeTasks(64), []);
  return (
    <>
      <DataTable columns={taskColumns} data={data} getRowId={(task) => task.id} />
      <Toaster />
    </>
  );
};

/** Row selection with a checkbox column; canceled tasks cannot be selected. */
export const RowSelection: Story = () => {
  const data = useMemo(() => makeTasks(30), []);
  const [selection, setSelection] = useState<RowSelectionState>({});
  return (
    <div className="grid gap-4">
      <DataTable
        columns={taskColumns}
        data={data}
        getRowId={(task) => task.id}
        enableRowSelection={(row) => row.original.status !== 'canceled'}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
      />
      <pre className="rounded-md bg-muted p-3 text-xs">
        {JSON.stringify(Object.keys(selection))}
      </pre>
    </div>
  );
};

/** Server-side paging: the parent fetches one page at a time (simulated with a delay). */
export const ServerSide: Story = () => {
  const all = useMemo(() => makeTasks(237), []);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [page, setPage] = useState<Task[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const start = pagination.pageIndex * pagination.pageSize;
      setPage(all.slice(start, start + pagination.pageSize));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [all, pagination]);
  return (
    <DataTable
      columns={taskColumns}
      data={page}
      getRowId={(task) => task.id}
      manualPagination
      rowCount={all.length}
      pagination={pagination}
      onPaginationChange={setPagination}
      toolbar={false}
    />
  );
};

/** No toolbar, no pagination, and a custom empty state. */
export const Empty: Story = () => (
  <DataTable
    columns={taskColumns}
    data={[]}
    toolbar={false}
    paginate={false}
    emptyState={
      <EmptyState
        icon={<TableIcon />}
        title="No tasks yet"
        description="Tasks you create show up here."
        headingLevel={4}
      />
    }
  />
);

/** Translated labels, with a second pagination bar above the table. */
export const TranslatedLabels: Story = () => {
  const data = useMemo(() => makeTasks(40), []);
  return (
    <DataTable
      columns={taskColumns}
      data={data}
      enableRowSelection
      labels={{
        searchPlaceholder: 'Suchen…',
        searchLabel: 'Zeilen suchen',
        reset: 'Zurücksetzen',
        view: 'Ansicht',
        toggleColumns: 'Spalten',
        sortAscending: 'Aufsteigend',
        sortDescending: 'Absteigend',
        hideColumn: 'Ausblenden',
        rowsPerPage: 'Zeilen pro Seite',
        page: (current, total) => `Seite ${current} von ${total}`,
        selectedRows: (selected, total) => `${selected} von ${total} Zeile(n) ausgewählt.`,
        noResults: 'Keine Ergebnisse.',
      }}
      toolbar={(table) => (
        <div className="grid gap-2">
          <DataTableToolbar table={table} />
          <DataTablePagination table={table} />
        </div>
      )}
    />
  );
};

const ROW_HEIGHT = 41;

/**
 * A tiny fixed-height virtualizer, enough for the story. Real apps can use
 * `@tanstack/react-virtual` in the same hook shape.
 */
function useFixedVirtualRows(
  rows: readonly unknown[],
  getScrollElement: () => HTMLDivElement | null,
): DataTableVirtualRows {
  const [scroll, setScroll] = useState({ top: 0, height: 400 });
  useEffect(() => {
    const element = getScrollElement();
    if (!element) return;
    const update = (): void => setScroll({ top: element.scrollTop, height: element.clientHeight });
    update();
    element.addEventListener('scroll', update, { passive: true });
    return () => element.removeEventListener('scroll', update);
  }, [getScrollElement]);
  const overscan = 8;
  const first = Math.max(0, Math.floor(scroll.top / ROW_HEIGHT) - overscan);
  const last = Math.min(
    rows.length,
    Math.ceil((scroll.top + scroll.height) / ROW_HEIGHT) + overscan,
  );
  const items: DataTableVirtualRow[] = [];
  for (let index = first; index < last; index += 1) {
    items.push({ index, key: index, start: index * ROW_HEIGHT, end: (index + 1) * ROW_HEIGHT });
  }
  return { rows: items, totalSize: rows.length * ROW_HEIGHT };
}

/** 10,000 rows with only the visible ones rendered, through the useVirtualRows hook-in. */
export const Virtualized: Story = () => {
  const data = useMemo(() => makeTasks(10_000), []);
  return (
    <DataTable
      columns={taskColumns}
      data={data}
      getRowId={(task) => task.id}
      paginate={false}
      useVirtualRows={useFixedVirtualRows}
      tableContainerClassName="h-[28rem]"
    />
  );
};
