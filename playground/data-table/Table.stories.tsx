import type { Story } from '@ladle/react';
import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../src';

const INVOICES = [
  { id: 'INV001', status: 'Paid', method: 'Credit card', amount: 250 },
  { id: 'INV002', status: 'Pending', method: 'PayPal', amount: 150 },
  { id: 'INV003', status: 'Unpaid', method: 'Bank transfer', amount: 350 },
  { id: 'INV004', status: 'Paid', method: 'Credit card', amount: 450 },
  { id: 'INV005', status: 'Paid', method: 'PayPal', amount: 550 },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** A static table with a caption and a totals footer; no TanStack Table needed. */
export const Invoices: Story = () => (
  <Table>
    <TableCaption>A list of your recent invoices.</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead scope="col" className="w-28">
          Invoice
        </TableHead>
        <TableHead scope="col">Status</TableHead>
        <TableHead scope="col">Method</TableHead>
        <TableHead scope="col" className="text-right">
          Amount
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {INVOICES.map((invoice) => (
        <TableRow key={invoice.id}>
          <TableCell className="font-medium">{invoice.id}</TableCell>
          <TableCell>
            <Badge variant={invoice.status === 'Paid' ? 'default' : 'outline'}>
              {invoice.status}
            </Badge>
          </TableCell>
          <TableCell>{invoice.method}</TableCell>
          <TableCell className="text-right tabular-nums">{money.format(invoice.amount)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell colSpan={3}>Total</TableCell>
        <TableCell className="text-right tabular-nums">
          {money.format(INVOICES.reduce((sum, invoice) => sum + invoice.amount, 0))}
        </TableCell>
      </TableRow>
    </TableFooter>
  </Table>
);

/** A selected row (`data-state="selected"`) inside a bordered box. */
export const SelectedRow: Story = () => (
  <Table containerClassName="rounded-md border">
    <TableHeader>
      <TableRow>
        <TableHead scope="col">Name</TableHead>
        <TableHead scope="col">Role</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Ada</TableCell>
        <TableCell>Admin</TableCell>
      </TableRow>
      <TableRow data-state="selected">
        <TableCell>Grace</TableCell>
        <TableCell>Editor</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Linus</TableCell>
        <TableCell>Viewer</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
