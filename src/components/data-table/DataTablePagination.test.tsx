import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DataTable } from './DataTable';
import { DataTablePagination } from './DataTablePagination';
import { firstColumnTexts, makePeople, personColumns } from './dataTableTestUtils';

describe('DataTablePagination', () => {
  it('changes the page size from the select', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={personColumns} data={makePeople(45)} />);

    const trigger = screen.getByRole('combobox', { name: 'Rows per page' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.click(await screen.findByRole('option', { name: '20' }));

    expect(firstColumnTexts()).toHaveLength(20);
    expect(screen.getByText('Page 1 of 3')).toBeTruthy();
  });

  it('offers the given sizes plus the current one', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={personColumns}
        data={makePeople(5)}
        pageSize={15}
        pageSizeOptions={[25, 5]}
      />,
    );

    screen.getByRole('combobox', { name: 'Rows per page' }).focus();
    await user.keyboard('{Enter}');
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['5', '15', '25']);
  });

  it('shows page 1 of 1 for an empty table, with the buttons disabled', () => {
    render(<DataTable columns={personColumns} data={[]} />);

    expect(screen.getByText('Page 1 of 1')).toBeTruthy();
    for (const name of ['Go to first page', 'Go to previous page', 'Go to next page']) {
      expect((screen.getByRole('button', { name }) as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it('leaves out the selection count without row selection', () => {
    render(<DataTable columns={personColumns} data={makePeople(3)} />);

    expect(screen.queryByText(/row\(s\) selected/)).toBeNull();
  });

  it('can be placed in a custom layout with its own classes', () => {
    const { container } = render(
      <DataTable
        columns={personColumns}
        data={makePeople(3)}
        paginate={false}
        toolbar={(table) => <DataTablePagination table={table} className="extra" />}
      />,
    );

    const bars = container.querySelectorAll('[data-slot="data-table-pagination"]');
    expect(bars).toHaveLength(1);
    expect(bars[0]?.className).toContain('extra');
  });
});
