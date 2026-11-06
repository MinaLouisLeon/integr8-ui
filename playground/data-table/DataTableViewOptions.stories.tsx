import type { Story } from '@ladle/react';
import { useMemo } from 'react';
import { DataTable, DataTableViewOptions } from '../../src';
import { makeTasks, taskColumns } from './tasks';

/** The column menu on its own, with two columns hidden at the start. */
export const Standalone: Story = () => {
  const data = useMemo(() => makeTasks(20), []);
  return (
    <DataTable
      columns={taskColumns}
      data={data}
      initialState={{ columnVisibility: { priority: false, estimate: false } }}
      toolbar={(table) => (
        <div className="flex justify-end">
          <DataTableViewOptions table={table} />
        </div>
      )}
    />
  );
};
