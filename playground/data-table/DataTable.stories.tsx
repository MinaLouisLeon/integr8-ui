import type { Story } from '@ladle/react';
import { MoreHorizontalIcon, TableIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  DataTable,
  type DataTableColumnDef,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
  type DataTableVirtualRow,
  type DataTableVirtualRows,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Toaster,
  ToggleGroup,
  ToggleGroupItem,
  toast,
} from '../../src';

type Status = 'todo' | 'in-progress' | 'done' | 'canceled';

interface Task {
  id: string;
  title: string;
  status: Status;
  priority: 'low' | 'medium' | 'high';
  estimate: number;
}

const TITLES = [
  'Wire the theme switcher',
  'Write the registry generator',
  'Fix focus ring in Select',
  'Add Sidebar icon-only mode',
  'Measure styles.css size',
  'Document the form kit',
  'Smoke test every story',
  'Review DataTable labels',
];
const STATUSES: Status[] = ['todo', 'in-progress', 'done', 'canceled'];
const PRIORITIES: Task['priority'][] = ['low', 'medium', 'high'];

function makeTasks(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `TASK-${1000 + i}`,
    title: `${TITLES[i % TITLES.length]}`,
    status: STATUSES[(i * 3) % STATUSES.length] ?? 'todo',
    priority: PRIORITIES[(i * 5) % PRIORITIES.length] ?? 'low',
    estimate: 1 + ((i * 7) % 13),
  }));
}

const statusVariant = {
  todo: 'outline',
  'in-progress': 'secondary',
  done: 'default',
  canceled: 'destructive',
} as const;

const columns: DataTableColumnDef<Task>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Task" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
  },
  {
    accessorKey: 'estimate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estimate (h)" />,
    cell: ({ row }) => <div className="text-right tabular-nums">{row.original.estimate}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.id}`}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{row.original.id}</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => toast(`Copied ${row.original.id}`)}>
            Copy id
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

/** Sorting, search, pagination and column visibility with the default toolbar. */
export const Default: Story = () => {
  const data = useMemo(() => makeTasks(64), []);
  return (
    <>
      <DataTable columns={columns} data={data} getRowId={(task) => task.id} />
      <Toaster />
    </>
  );
};

/** Row selection with a checkbox column; canceled tasks cannot be selected. */
export const RowSelection: Story = () => {
  const data = useMemo(() => makeTasks(30), []);
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  return (
    <div className="grid gap-4">
      <DataTable
        columns={columns}
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

/** A custom toolbar with a status filter and a starting sort. */
export const CustomToolbar: Story = () => {
  const data = useMemo(() => makeTasks(48), []);
  return (
    <DataTable
      columns={columns}
      data={data}
      initialState={{ sorting: [{ id: 'estimate', desc: true }] }}
      toolbar={(table) => {
        const status = table.getColumn('status');
        const value = (status?.getFilterValue() as string | undefined) ?? '';
        return (
          <DataTableToolbar table={table}>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              aria-label="Status"
              value={value}
              onValueChange={(next) => status?.setFilterValue(next || undefined)}
            >
              {STATUSES.map((s) => (
                <ToggleGroupItem key={s} value={s}>
                  {s}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </DataTableToolbar>
        );
      }}
    />
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
      columns={columns}
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
    columns={columns}
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
      columns={columns}
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
      columns={columns}
      data={data}
      getRowId={(task) => task.id}
      paginate={false}
      useVirtualRows={useFixedVirtualRows}
      tableContainerClassName="h-[28rem]"
    />
  );
};
