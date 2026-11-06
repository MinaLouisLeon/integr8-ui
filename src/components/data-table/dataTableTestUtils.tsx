import { screen, within } from '@testing-library/react';
import { DataTableColumnHeader } from './DataTableColumnHeader';
import type { DataTableColumnDef } from './dataTableLabels';

export interface Person {
  id: string;
  name: string;
  age: number;
  role: string;
}

const NAMES = ['Ada', 'Grace', 'Linus', 'Margaret', 'Dennis', 'Barbara', 'Ken', 'Frances'];
const ROLES = ['admin', 'editor', 'viewer'];

/** `count` people with predictable names (Ada 1, Grace 2, …), ages and roles. */
export function makePeople(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `${NAMES[i % NAMES.length]} ${i + 1}`,
    age: 20 + ((i * 7) % 40),
    role: ROLES[i % ROLES.length] ?? 'viewer',
  }));
}

export const personColumns: DataTableColumnDef<Person>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: 'age',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Age" />,
  },
  { accessorKey: 'role', header: 'Role', enableSorting: false },
];

/** The text of the first cell of every body row (skipping the empty-state row). */
export function firstColumnTexts(column = 0): string[] {
  const body = screen.getAllByRole('rowgroup')[1];
  if (!body) return [];
  return within(body)
    .getAllByRole('row')
    .filter((row) => row.dataset.slot === 'data-table-row')
    .map((row) => within(row).getAllByRole('cell')[column]?.textContent ?? '');
}
