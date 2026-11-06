import type { Story } from '@ladle/react';
import { useMemo } from 'react';
import { DataTable, DataTablePagination } from '../../src';
import { makeTasks, taskColumns } from './tasks';

/** The default bar under the table, with the selected row count. */
export const WithSelection: Story = () => {
  const data = useMemo(() => makeTasks(120), []);
  return <DataTable columns={taskColumns} data={data} enableRowSelection toolbar={false} />;
};

/** Custom page sizes and a starting page size of 25. */
export const CustomPageSizes: Story = () => {
  const data = useMemo(() => makeTasks(300), []);
  return (
    <DataTable
      columns={taskColumns}
      data={data}
      pageSize={25}
      pageSizeOptions={[25, 50, 100]}
      toolbar={false}
    />
  );
};

/** A pagination bar above the table too, rendered from the toolbar slot. */
export const AboveTheTable: Story = () => {
  const data = useMemo(() => makeTasks(80), []);
  return (
    <DataTable
      columns={taskColumns}
      data={data}
      toolbar={(table) => <DataTablePagination table={table} pageSizeOptions={[5, 10]} />}
    />
  );
};
