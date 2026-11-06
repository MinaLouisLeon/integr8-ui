import type { Story } from '@ladle/react';
import { useMemo } from 'react';
import { DataTable, DataTableFacetedFilter, DataTableToolbar } from '../../src';
import { makeTasks, PRIORITY_OPTIONS, STATUS_OPTIONS, taskColumns } from './tasks';

/**
 * Status and priority filters with counts, as in shadcn's tasks example. The columns use
 * `filterFn: 'oneOf'`. Counts follow the other active filters.
 */
export const StatusAndPriority: Story = () => {
  const data = useMemo(() => makeTasks(100), []);
  return (
    <DataTable
      columns={taskColumns}
      data={data}
      getRowId={(task) => task.id}
      toolbar={(table) => (
        <DataTableToolbar table={table}>
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={STATUS_OPTIONS}
          />
          <DataTableFacetedFilter
            column={table.getColumn('priority')}
            title="Priority"
            options={PRIORITY_OPTIONS}
          />
        </DataTableToolbar>
      )}
    />
  );
};

/** A starting filter, and badges that collapse to "n selected" after one. */
export const Preselected: Story = () => {
  const data = useMemo(() => makeTasks(100), []);
  return (
    <DataTable
      columns={taskColumns}
      data={data}
      initialState={{ columnFilters: [{ id: 'status', value: ['todo', 'in-progress'] }] }}
      toolbar={(table) => (
        <DataTableToolbar table={table}>
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={STATUS_OPTIONS}
            maxBadges={1}
          />
        </DataTableToolbar>
      )}
    />
  );
};
