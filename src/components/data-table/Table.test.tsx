import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './Table';

function Invoices() {
  return (
    <Table className="extra" containerClassName="box">
      <TableCaption>Recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Invoice</TableHead>
          <TableHead scope="col" className="text-right">
            Amount
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow data-state="selected">
          <TableCell>INV001</TableCell>
          <TableCell className="text-right">$250.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>INV002</TableCell>
          <TableCell className="text-right">$150.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="text-right">$400.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

describe('Table', () => {
  it('renders a semantic table with caption, header, body and footer', () => {
    render(<Invoices />);
    const table = screen.getByRole('table', { name: 'Recent invoices.' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((th) => th.textContent),
    ).toEqual(['Invoice', 'Amount']);
    expect(within(table).getAllByRole('row')).toHaveLength(4);
    expect(within(table).getByText('Total').closest('tfoot')?.dataset.slot).toBe('table-footer');
  });

  it('merges classes on the table and its scrolling container', () => {
    render(<Invoices />);
    const table = screen.getByRole('table');

    expect(table.dataset.slot).toBe('table');
    expect(table.className).toContain('extra');
    expect(table.className).toContain('caption-bottom');
    expect(table.parentElement?.dataset.slot).toBe('table-container');
    expect(table.parentElement?.className).toContain('overflow-x-auto');
    expect(table.parentElement?.className).toContain('box');
  });

  it('styles selected rows and keeps cell classes', () => {
    render(<Invoices />);
    const selected = screen.getByText('INV001').closest('tr') as HTMLElement;
    const amount = screen.getByText('$250.00');

    expect(selected.dataset.slot).toBe('table-row');
    expect(selected.className).toContain('data-[state=selected]:bg-muted');
    expect(amount.dataset.slot).toBe('table-cell');
    expect(amount.className).toContain('text-right');
    expect(screen.getByText('Amount').className).toContain('text-right');
  });
});
