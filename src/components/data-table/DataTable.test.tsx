import type { RowSelectionState } from '@tanstack/react-table';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableVirtualRowsHook } from './DataTable';
import { firstColumnTexts, makePeople, type Person, personColumns } from './dataTableTestUtils';

function ControlledSelection({ seen }: { seen: RowSelectionState[] }) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  seen.push(rowSelection);
  return (
    <DataTable<Person>
      columns={personColumns}
      data={makePeople(3)}
      getRowId={(person) => person.id}
      enableRowSelection
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  );
}

const virtualCalls: { rowCount: number; getScrollElement: () => HTMLDivElement | null }[] = [];

/** Pretends rows 10 and 11 (40px each) are the visible ones. */
const useTwoVirtualRows: DataTableVirtualRowsHook<Person> = (rows, getScrollElement) => {
  virtualCalls.push({ rowCount: rows.length, getScrollElement });
  return {
    rows: [
      { index: 10, start: 400, end: 440, key: 'v10' },
      { index: 11, start: 440, end: 480, key: 'v11' },
    ],
    totalSize: 4000,
  };
};

const useNullVirtualRows: DataTableVirtualRowsHook<Person> = () => null;

describe('DataTable', () => {
  it('renders headers, the first page of rows, the toolbar and the pagination', () => {
    const { container } = render(<DataTable columns={personColumns} data={makePeople(25)} />);

    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Name',
      'Age',
      'Role',
    ]);
    expect(firstColumnTexts()).toHaveLength(10);
    expect(firstColumnTexts()[0]).toBe('Ada 1');
    expect(container.querySelector('[data-slot="data-table-toolbar"]')).not.toBeNull();
    expect(screen.getByText('Page 1 of 3')).toBeTruthy();
  });

  it('merges className on the root and tableContainerClassName on the scroll box', () => {
    const { container } = render(
      <DataTable
        columns={personColumns}
        data={makePeople(2)}
        className="extra"
        tableContainerClassName="max-h-96"
      />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset.slot).toBe('data-table');
    expect(root.className).toContain('extra');
    expect(container.querySelector('[data-slot="data-table-container"]')?.className).toContain(
      'max-h-96',
    );
  });

  it('shows the empty message, or a custom empty state, spanning every column', () => {
    const { container, rerender } = render(<DataTable columns={personColumns} data={[]} />);

    const cell = container.querySelector('[data-slot="data-table-empty"] td');
    expect(cell?.textContent).toBe('No results.');
    expect(cell?.getAttribute('colspan')).toBe('3');

    rerender(<DataTable columns={personColumns} data={[]} emptyState={<span>Nothing yet</span>} />);
    expect(screen.getByText('Nothing yet')).toBeTruthy();
  });

  describe('sorting', () => {
    it('sorts from the column header menu and sets aria-sort', async () => {
      const user = userEvent.setup();
      render(<DataTable columns={personColumns} data={makePeople(5)} paginate={false} />);
      const ageHeader = screen.getAllByRole('columnheader')[1] as HTMLElement;
      expect(ageHeader.getAttribute('aria-sort')).toBe('none');

      within(ageHeader).getByRole('button', { name: 'Age' }).focus();
      await user.keyboard('{Enter}');
      await user.click(await screen.findByRole('menuitem', { name: 'Desc' }));

      expect(ageHeader.getAttribute('aria-sort')).toBe('descending');
      const ages = firstColumnTexts(1).map(Number);
      expect(ages).toEqual([...ages].sort((a, b) => b - a));
    });

    it('leaves aria-sort off columns that cannot sort', () => {
      render(<DataTable columns={personColumns} data={makePeople(2)} />);

      expect(screen.getAllByRole('columnheader')[2]?.hasAttribute('aria-sort')).toBe(false);
    });

    it('applies a sort from initialState', () => {
      render(
        <DataTable
          columns={personColumns}
          data={makePeople(5)}
          initialState={{ sorting: [{ id: 'name', desc: true }] }}
        />,
      );

      expect(firstColumnTexts()[0]).toBe('Margaret 4');
    });

    it('calls onSortingChange and follows the controlled sorting', async () => {
      const user = userEvent.setup();
      const onSortingChange = vi.fn();
      render(
        <DataTable
          columns={personColumns}
          data={makePeople(5)}
          sorting={[{ id: 'name', desc: false }]}
          onSortingChange={onSortingChange}
        />,
      );
      expect(firstColumnTexts()[0]).toBe('Ada 1');

      screen.getByRole('button', { name: 'Name' }).focus();
      await user.keyboard('{Enter}');
      await user.click(await screen.findByRole('menuitem', { name: 'Desc' }));

      expect(onSortingChange).toHaveBeenCalled();
      // Controlled: nothing changes until the parent passes new sorting.
      expect(firstColumnTexts()[0]).toBe('Ada 1');
    });
  });

  describe('filtering', () => {
    it('filters rows with the search input and resets', async () => {
      const user = userEvent.setup();
      render(<DataTable columns={personColumns} data={makePeople(16)} />);

      await user.type(screen.getByRole('searchbox', { name: 'Search rows' }), 'grace');
      expect(firstColumnTexts()).toEqual(['Grace 2', 'Grace 10']);
      expect(screen.getByText('Page 1 of 1')).toBeTruthy();

      await user.click(screen.getByRole('button', { name: 'Reset' }));
      expect(firstColumnTexts()).toHaveLength(10);
      expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull();
    });

    it('applies controlled column filters', () => {
      render(
        <DataTable
          columns={personColumns}
          data={makePeople(9)}
          columnFilters={[{ id: 'role', value: 'admin' }]}
        />,
      );

      expect(firstColumnTexts(2)).toEqual(['admin', 'admin', 'admin']);
    });

    it('shows the empty message when nothing matches', async () => {
      const user = userEvent.setup();
      render(<DataTable columns={personColumns} data={makePeople(3)} />);

      await user.type(screen.getByRole('searchbox'), 'zzz');
      expect(screen.getByText('No results.')).toBeTruthy();
    });
  });

  describe('pagination', () => {
    it('moves between pages with the buttons', async () => {
      const user = userEvent.setup();
      render(<DataTable columns={personColumns} data={makePeople(25)} />);
      const previous = screen.getByRole('button', { name: 'Go to previous page' });
      const next = screen.getByRole('button', { name: 'Go to next page' });
      expect((previous as HTMLButtonElement).disabled).toBe(true);

      await user.click(next);
      expect(screen.getByText('Page 2 of 3')).toBeTruthy();
      expect(firstColumnTexts()[0]).toBe('Linus 11');

      await user.click(screen.getByRole('button', { name: 'Go to last page' }));
      expect(screen.getByText('Page 3 of 3')).toBeTruthy();
      expect(firstColumnTexts()).toHaveLength(5);
      expect((next as HTMLButtonElement).disabled).toBe(true);

      await user.click(screen.getByRole('button', { name: 'Go to first page' }));
      expect(screen.getByText('Page 1 of 3')).toBeTruthy();
    });

    it('uses the pageSize prop', () => {
      render(<DataTable columns={personColumns} data={makePeople(25)} pageSize={5} />);

      expect(firstColumnTexts()).toHaveLength(5);
      expect(screen.getByText('Page 1 of 5')).toBeTruthy();
    });

    it('shows every row and no pagination bar when paginate is false', () => {
      const { container } = render(
        <DataTable columns={personColumns} data={makePeople(25)} paginate={false} />,
      );

      expect(firstColumnTexts()).toHaveLength(25);
      expect(container.querySelector('[data-slot="data-table-pagination"]')).toBeNull();
    });

    it('counts pages from rowCount with manualPagination', async () => {
      const user = userEvent.setup();
      const onPaginationChange = vi.fn();
      render(
        <DataTable
          columns={personColumns}
          data={makePeople(10)}
          manualPagination
          rowCount={95}
          pagination={{ pageIndex: 0, pageSize: 10 }}
          onPaginationChange={onPaginationChange}
        />,
      );

      expect(screen.getByText('Page 1 of 10')).toBeTruthy();
      await user.click(screen.getByRole('button', { name: 'Go to next page' }));
      const updater = onPaginationChange.mock.calls[0]?.[0];
      const next =
        typeof updater === 'function' ? updater({ pageIndex: 0, pageSize: 10 }) : updater;
      expect(next).toEqual({ pageIndex: 1, pageSize: 10 });
    });
  });

  describe('row selection', () => {
    it('adds a checkbox column and selects rows', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DataTable
          columns={personColumns}
          data={makePeople(3)}
          getRowId={(person) => person.id}
          enableRowSelection
        />,
      );

      const rowBoxes = screen.getAllByRole('checkbox', { name: 'Select row' });
      expect(rowBoxes).toHaveLength(3);
      expect(screen.getByText('0 of 3 row(s) selected.')).toBeTruthy();

      await user.click(rowBoxes[0] as HTMLElement);
      expect(screen.getByText('1 of 3 row(s) selected.')).toBeTruthy();
      expect(container.querySelector('[data-state="selected"]')).not.toBeNull();
      expect(screen.getByRole('checkbox', { name: 'Select all' }).getAttribute('data-state')).toBe(
        'indeterminate',
      );

      await user.click(screen.getByRole('checkbox', { name: 'Select all' }));
      expect(screen.getByText('3 of 3 row(s) selected.')).toBeTruthy();
    });

    it('disables rows the selection function rejects', () => {
      render(
        <DataTable
          columns={personColumns}
          data={makePeople(3)}
          enableRowSelection={(row) => row.original.role !== 'admin'}
        />,
      );

      const boxes = screen.getAllByRole('checkbox', { name: 'Select row' }) as HTMLButtonElement[];
      expect(boxes.map((box) => box.disabled)).toEqual([true, false, false]);
    });

    it('reports selection by row id when controlled', async () => {
      const user = userEvent.setup();
      const seen: RowSelectionState[] = [];
      render(<ControlledSelection seen={seen} />);

      await user.click(screen.getAllByRole('checkbox', { name: 'Select row' })[1] as HTMLElement);
      expect(seen.at(-1)).toEqual({ p2: true });
    });
  });

  it('hides columns from controlled columnVisibility', () => {
    render(
      <DataTable columns={personColumns} data={makePeople(2)} columnVisibility={{ age: false }} />,
    );

    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Name',
      'Role',
    ]);
  });

  it('renders a custom toolbar with the table, or none', () => {
    const { container, rerender } = render(
      <DataTable
        columns={personColumns}
        data={makePeople(4)}
        toolbar={(table) => <p>{table.getRowCount()} people</p>}
      />,
    );
    expect(screen.getByText('4 people')).toBeTruthy();

    rerender(<DataTable columns={personColumns} data={makePeople(4)} toolbar={false} />);
    expect(container.querySelector('[data-slot="data-table-toolbar"]')).toBeNull();
  });

  it('uses the given labels', () => {
    render(
      <DataTable
        columns={personColumns}
        data={makePeople(25)}
        enableRowSelection
        labels={{
          page: (page, count) => `Seite ${page} von ${count}`,
          nextPage: 'Nächste Seite',
          selectRow: 'Zeile auswählen',
        }}
      />,
    );

    expect(screen.getByText('Seite 1 von 3')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nächste Seite' })).toBeTruthy();
    expect(screen.getAllByRole('checkbox', { name: 'Zeile auswählen' })).toHaveLength(10);
  });

  it('renders only the rows the virtualization hook returns, with spacers', () => {
    virtualCalls.length = 0;
    const { container } = render(
      <DataTable
        columns={personColumns}
        data={makePeople(100)}
        paginate={false}
        useVirtualRows={useTwoVirtualRows}
      />,
    );

    expect(firstColumnTexts()).toEqual(['Linus 11', 'Margaret 12']);
    const spacers = container.querySelectorAll<HTMLElement>('[data-slot="data-table-spacer"] td');
    expect([...spacers].map((td) => td.style.height)).toEqual(['400px', '3520px']);
    const scrollBox = container.querySelector('[data-slot="data-table-container"]');
    expect(scrollBox?.hasAttribute('data-virtualized')).toBe(true);
    const lastCall = virtualCalls.at(-1);
    expect(lastCall?.rowCount).toBe(100);
    expect(lastCall?.getScrollElement()).toBe(scrollBox);
  });

  it('renders every row when the virtualization hook returns null', () => {
    render(
      <DataTable
        columns={personColumns}
        data={makePeople(12)}
        paginate={false}
        useVirtualRows={useNullVirtualRows}
      />,
    );

    expect(firstColumnTexts()).toHaveLength(12);
  });
});
