// Shared demo data for the data table stories (not a story file itself).
import {
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleIcon,
  MoreHorizontalIcon,
  TimerIcon,
  XCircleIcon,
} from 'lucide-react';
import {
  Badge,
  Button,
  type DataTableColumnDef,
  DataTableColumnHeader,
  type DataTableFacetedFilterOption,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  toast,
} from '../../src';

export type Status = 'todo' | 'in-progress' | 'done' | 'canceled';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
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
export const STATUSES: Status[] = ['todo', 'in-progress', 'done', 'canceled'];
export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

/** `count` predictable tasks. */
export function makeTasks(count: number): Task[] {
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

/** Options for a faceted filter on the status column. */
export const STATUS_OPTIONS: DataTableFacetedFilterOption[] = [
  { value: 'todo', label: 'Todo', icon: CircleIcon },
  { value: 'in-progress', label: 'In progress', icon: TimerIcon },
  { value: 'done', label: 'Done', icon: CheckCircle2Icon },
  { value: 'canceled', label: 'Canceled', icon: XCircleIcon },
];

/** Options for a faceted filter on the priority column. */
export const PRIORITY_OPTIONS: DataTableFacetedFilterOption[] = [
  { value: 'low', label: 'Low', icon: CircleDashedIcon },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

/** Columns with sortable headers, a badge cell, a right-aligned number and an actions menu. */
export const taskColumns: DataTableColumnDef<Task>[] = [
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
    // Arrays of picked values from DataTableFacetedFilter (or a toggle group).
    filterFn: 'oneOf',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: 'priority',
    filterFn: 'oneOf',
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
