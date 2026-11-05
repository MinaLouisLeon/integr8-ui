import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DataTable } from './DataTable';
import { DataTableColumnHeader } from './DataTableColumnHeader';
import type { DataTableColumnDef } from './dataTableLabels';
import { firstColumnTexts, makePeople, type Person } from './dataTableTestUtils';

const columns: DataTableColumnDef<Person>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" className="extra" />
    ),
  },
  {
    accessorKey: 'role',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
  },
  {
    accessorKey: 'age',
    enableSorting: false,
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Age" />,
  },
];

async function openHeaderMenu(name: string) {
  const user = userEvent.setup();
  screen.getByRole('button', { name }).focus();
  await user.keyboard('{Enter}');
  return user;
}

describe('DataTableColumnHeader', () => {
  it('sorts ascending and descending from its menu', async () => {
    render(<DataTable columns={columns} data={makePeople(5)} paginate={false} />);

    let user = await openHeaderMenu('Name');
    await user.click(await screen.findByRole('menuitem', { name: 'Desc' }));
    expect(firstColumnTexts()[0]).toBe('Margaret 4');

    user = await openHeaderMenu('Name');
    await user.click(await screen.findByRole('menuitem', { name: 'Asc' }));
    expect(firstColumnTexts()[0]).toBe('Ada 1');
  });

  it('hides the column from its menu', async () => {
    render(<DataTable columns={columns} data={makePeople(2)} />);

    const user = await openHeaderMenu('Name');
    await user.click(await screen.findByRole('menuitem', { name: 'Hide' }));

    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Role',
      'Age',
    ]);
  });

  it('offers only Hide when the column cannot sort', async () => {
    render(<DataTable columns={columns} data={makePeople(2)} />);

    await openHeaderMenu('Role');
    expect(await screen.findByRole('menuitem', { name: 'Hide' })).toBeTruthy();
    expect(screen.queryByRole('menuitem', { name: 'Asc' })).toBeNull();
  });

  it('renders plain text when the column can neither sort nor hide', () => {
    render(<DataTable columns={columns} data={makePeople(2)} />);

    const ageHeader = screen.getAllByRole('columnheader')[2] as HTMLElement;
    expect(within(ageHeader).queryByRole('button')).toBeNull();
    expect(ageHeader.textContent).toBe('Age');
  });

  it('merges className', () => {
    const { container } = render(<DataTable columns={columns} data={makePeople(2)} />);

    const header = container.querySelector('[data-slot="data-table-column-header"]');
    expect(header?.className).toContain('extra');
  });
});
