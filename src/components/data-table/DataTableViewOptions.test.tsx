import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DataTable } from './DataTable';
import { DataTableViewOptions } from './DataTableViewOptions';
import type { DataTableColumnDef } from './dataTableLabels';
import { makePeople, type Person, personColumns } from './dataTableTestUtils';

// The open menu marks the rest of the page aria-hidden (Radix), so include hidden elements.
const headerTexts = () =>
  screen.getAllByRole('columnheader', { hidden: true }).map((th) => th.textContent);

async function openView() {
  const user = userEvent.setup();
  screen.getByRole('button', { name: 'View' }).focus();
  await user.keyboard('{Enter}');
  return user;
}

describe('DataTableViewOptions', () => {
  it('lists hideable data columns by header text or id', async () => {
    const columns: DataTableColumnDef<Person>[] = [
      ...personColumns,
      { accessorKey: 'id', header: 'ID', enableHiding: false },
      { id: 'actions', cell: () => null },
    ];
    render(<DataTable columns={columns} data={makePeople(2)} />);

    await openView();
    const items = await screen.findAllByRole('menuitemcheckbox');
    // Name and Age use DataTableColumnHeader (not a string), so the column id is shown.
    expect(items.map((item) => item.textContent)).toEqual(['name', 'age', 'Role']);
  });

  it('toggles a column and keeps the menu open', async () => {
    render(<DataTable columns={personColumns} data={makePeople(2)} />);

    const user = await openView();
    const role = await screen.findByRole('menuitemcheckbox', { name: 'Role' });
    expect(role.getAttribute('aria-checked')).toBe('true');

    await user.click(role);
    expect(headerTexts()).toEqual(['Name', 'Age']);
    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Role' }).getAttribute('aria-checked'),
    ).toBe('false');

    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Role' }));
    expect(headerTexts()).toEqual(['Name', 'Age', 'Role']);
  });

  it('can be used in a custom toolbar with its own classes', () => {
    render(
      <DataTable
        columns={personColumns}
        data={makePeople(2)}
        toolbar={(table) => <DataTableViewOptions table={table} className="extra" />}
      />,
    );

    expect(screen.getByRole('button', { name: 'View' }).className).toContain('extra');
  });
});
