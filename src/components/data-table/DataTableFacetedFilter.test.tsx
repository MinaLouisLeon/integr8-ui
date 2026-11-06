import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DataTable } from './DataTable';
import {
  DataTableFacetedFilter,
  type DataTableFacetedFilterOption,
} from './DataTableFacetedFilter';
import { DataTableToolbar } from './DataTableToolbar';
import type { DataTableColumnDef } from './dataTableFeatures';
import { firstColumnTexts, makePeople, type Person } from './dataTableTestUtils';

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'role', header: 'Role', filterFn: 'oneOf' },
];

const ROLE_OPTIONS: DataTableFacetedFilterOption[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
];

function RoleTable({
  maxBadges,
  labels,
}: {
  maxBadges?: number;
  labels?: { clearFilter?: string; facetSelected?: (count: number) => string };
}) {
  return (
    <DataTable
      columns={columns}
      data={makePeople(9)}
      labels={labels}
      toolbar={(table) => (
        <DataTableToolbar table={table}>
          <DataTableFacetedFilter
            column={table.getColumn('role')}
            title="Role"
            options={ROLE_OPTIONS}
            maxBadges={maxBadges}
          />
        </DataTableToolbar>
      )}
    />
  );
}

async function openFilter() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Role' }));
  return user;
}

describe('DataTableFacetedFilter', () => {
  it('lists every option with its row count', async () => {
    render(<RoleTable />);
    await openFilter();

    const options = screen.getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Admin3', 'Editor3', 'Viewer3']);
    expect(options.every((option) => option.getAttribute('aria-checked') === 'false')).toBe(true);
  });

  it('keeps the rows whose value is one of the picked options', async () => {
    render(<RoleTable />);
    const user = await openFilter();

    await user.click(screen.getByRole('option', { name: /Editor/ }));
    expect(firstColumnTexts(2)).toEqual(['editor', 'editor', 'editor']);
    expect(screen.getByRole('option', { name: /Editor/ }).getAttribute('aria-checked')).toBe(
      'true',
    );

    await user.click(screen.getByRole('option', { name: /Admin/ }));
    expect(firstColumnTexts(2).sort()).toEqual([
      'admin',
      'admin',
      'admin',
      'editor',
      'editor',
      'editor',
    ]);

    await user.click(screen.getByRole('option', { name: /Editor/ }));
    expect(firstColumnTexts(2)).toEqual(['admin', 'admin', 'admin']);
  });

  it('shows badges for the picked options, collapsing past maxBadges', async () => {
    render(<RoleTable maxBadges={1} labels={{ facetSelected: (count) => `${count} picked` }} />);
    const user = await openFilter();
    const trigger = () => screen.getByRole('button', { name: /^Role/ });

    await user.click(screen.getByRole('option', { name: /Admin/ }));
    expect(within(trigger()).getByText('Admin')).toBeTruthy();

    await user.click(screen.getByRole('option', { name: /Viewer/ }));
    expect(within(trigger()).getByText('2 picked')).toBeTruthy();
  });

  it('clears the filter with the clear item and removes it when nothing is picked', async () => {
    render(<RoleTable labels={{ clearFilter: 'Show all' }} />);
    const user = await openFilter();

    expect(screen.queryByRole('option', { name: 'Show all' })).toBeNull();
    await user.click(screen.getByRole('option', { name: /Viewer/ }));
    expect(firstColumnTexts()).toHaveLength(3);

    await user.click(screen.getByRole('option', { name: 'Show all' }));
    expect(firstColumnTexts()).toHaveLength(9);
    expect(screen.queryByRole('option', { name: 'Show all' })).toBeNull();
  });

  it('renders nothing without a column', () => {
    const { container } = render(
      <DataTableFacetedFilter column={undefined} title="Missing" options={ROLE_OPTIONS} />,
    );
    expect(container.innerHTML).toBe('');
  });
});
