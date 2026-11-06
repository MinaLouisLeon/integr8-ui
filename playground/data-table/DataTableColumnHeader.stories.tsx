import type { Story } from '@ladle/react';
import { useMemo } from 'react';
import { DataTable, type DataTableColumnDef, DataTableColumnHeader } from '../../src';
import { makeTasks, type Task } from './tasks';

const columns: DataTableColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sort and hide" />,
  },
  {
    accessorKey: 'status',
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sort only" />,
  },
  {
    accessorKey: 'priority',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Hide only" />,
  },
  {
    accessorKey: 'estimate',
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Plain text" />,
  },
];

/**
 * The header menu adapts to what the column allows: sort and hide, only one of them, or
 * plain text. Shift+click sorts by several columns.
 */
export const Capabilities: Story = () => {
  const data = useMemo(() => makeTasks(20), []);
  return <DataTable columns={columns} data={data} toolbar={false} />;
};

/** A starting sort shows the direction icon right away. */
export const Sorted: Story = () => {
  const data = useMemo(() => makeTasks(20), []);
  return (
    <DataTable
      columns={columns}
      data={data}
      toolbar={false}
      initialState={{ sorting: [{ id: 'title', desc: true }] }}
    />
  );
};
