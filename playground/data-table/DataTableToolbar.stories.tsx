import type { Story } from '@ladle/react';
import { useMemo } from 'react';
import { DataTable, DataTableToolbar, ToggleGroup, ToggleGroupItem } from '../../src';
import { makeTasks, STATUSES, taskColumns } from './tasks';

/** Your own filter after the search input (a status toggle group) and a starting sort. */
export const CustomFilter: Story = () => {
  const data = useMemo(() => makeTasks(48), []);
  return (
    <DataTable
      columns={taskColumns}
      data={data}
      initialState={{ sorting: [{ id: 'estimate', desc: true }] }}
      toolbar={(table) => {
        const status = table.getColumn('status');
        // The status column uses filterFn 'oneOf', so the filter value is an array.
        const picked = status?.getFilterValue();
        const value = Array.isArray(picked) ? String(picked[0] ?? '') : '';
        return (
          <DataTableToolbar table={table}>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              aria-label="Status"
              value={value}
              onValueChange={(next) => status?.setFilterValue(next ? [next] : undefined)}
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

/** Only the column menu: no search input. */
export const WithoutSearch: Story = () => {
  const data = useMemo(() => makeTasks(12), []);
  return (
    <DataTable
      columns={taskColumns}
      data={data}
      toolbar={(table) => <DataTableToolbar table={table} showSearch={false} />}
    />
  );
};

/** Only the search input: no column menu. */
export const WithoutViewOptions: Story = () => {
  const data = useMemo(() => makeTasks(12), []);
  return (
    <DataTable
      columns={taskColumns}
      data={data}
      toolbar={(table) => <DataTableToolbar table={table} showViewOptions={false} />}
    />
  );
};
