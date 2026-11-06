import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from './DataTable';
import { DataTableToolbar } from './DataTableToolbar';
import { firstColumnTexts, makePeople, personColumns } from './dataTableTestUtils';

describe('DataTableToolbar', () => {
  it('renders custom filters and resets column filters too', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={personColumns}
        data={makePeople(6)}
        toolbar={(table) => (
          <DataTableToolbar table={table} className="extra">
            <button type="button" onClick={() => table.getColumn('role')?.setFilterValue('editor')}>
              Editors
            </button>
          </DataTableToolbar>
        )}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Editors' }));
    expect(firstColumnTexts(2)).toEqual(['editor', 'editor']);

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(firstColumnTexts()).toHaveLength(6);
  });

  it('can leave out the search and the view menu', () => {
    const { container } = render(
      <DataTable
        columns={personColumns}
        data={makePeople(2)}
        toolbar={(table) => (
          <DataTableToolbar table={table} showSearch={false} showViewOptions={false} />
        )}
      />,
    );

    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'View' })).toBeNull();
    expect(container.querySelector('[data-slot="data-table-toolbar"]')).not.toBeNull();
  });

  it('reflects and reports a controlled search text', async () => {
    const user = userEvent.setup();
    const onGlobalFilterChange = vi.fn();
    render(
      <DataTable
        columns={personColumns}
        data={makePeople(10)}
        globalFilter="ada"
        onGlobalFilterChange={onGlobalFilterChange}
      />,
    );

    const search = screen.getByRole('searchbox') as HTMLInputElement;
    expect(search.value).toBe('ada');
    expect(firstColumnTexts()).toEqual(['Ada 1', 'Ada 9']);

    await user.type(search, 'x');
    expect(onGlobalFilterChange).toHaveBeenCalledWith('adax');
  });

  it('uses the search labels', () => {
    render(
      <DataTable
        columns={personColumns}
        data={makePeople(2)}
        labels={{ searchLabel: 'Filter people', searchPlaceholder: 'Filter…' }}
      />,
    );

    expect(
      screen.getByRole('searchbox', { name: 'Filter people' }).getAttribute('placeholder'),
    ).toBe('Filter…');
  });
});
