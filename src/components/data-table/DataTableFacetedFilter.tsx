'use client';

import type { RowData } from '@tanstack/react-table';
import { CheckIcon, PlusCircleIcon } from 'lucide-react';
import type { ComponentType, JSX } from 'react';
import { cn } from '../../lib/cn';
import { Badge } from '../basics/Badge';
import { Button } from '../basics/Button';
import { Popover, PopoverContent, PopoverTrigger } from '../basics/Popover';
import { Separator } from '../basics/Separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../command/Command';
import type { DataTableColumn } from './dataTableFeatures';
import { useDataTableLabels } from './dataTableLabels';

/** One choice of a {@link DataTableFacetedFilter}. */
export interface DataTableFacetedFilterOption {
  /** The visible name. */
  label: string;
  /** The cell value it matches. */
  value: string;
  /** An icon shown before the label, such as a lucide icon. */
  icon?: ComponentType<{ className?: string }> | undefined;
}

/** Props for {@link DataTableFacetedFilter}. */
export type DataTableFacetedFilterProps<TData extends RowData, TValue> = {
  /** The column to filter, usually `table.getColumn('status')`. Renders nothing when missing. */
  column: DataTableColumn<TData, TValue> | undefined;
  /** The button text and the search placeholder, for example `'Status'`. */
  title: string;
  /** The values to choose from. */
  options: readonly DataTableFacetedFilterOption[];
  /** Badges shown in the button before they collapse to "n selected". Default `2`. */
  maxBadges?: number | undefined;
  /** Classes for the trigger button. */
  className?: string | undefined;
};

/**
 * A toolbar filter for one column: a dashed button that opens a searchable list of values with
 * checkboxes and row counts. Picking values keeps the rows whose value is one of them. Put it
 * inside a {@link DataTableToolbar} and give the column `filterFn: 'oneOf'`.
 *
 * Counts come from the rows that pass the other filters (TanStack faceting).
 *
 * @example
 * ```tsx
 * const columns: DataTableColumnDef<Task>[] = [
 *   { accessorKey: 'status', header: 'Status', filterFn: 'oneOf' },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={tasks}
 *   toolbar={(table) => (
 *     <DataTableToolbar table={table}>
 *       <DataTableFacetedFilter
 *         column={table.getColumn('status')}
 *         title="Status"
 *         options={[{ value: 'todo', label: 'Todo' }, { value: 'done', label: 'Done' }]}
 *       />
 *     </DataTableToolbar>
 *   )}
 * />
 * ```
 */
export function DataTableFacetedFilter<TData extends RowData, TValue>({
  column,
  title,
  options,
  maxBadges = 2,
  className,
}: DataTableFacetedFilterProps<TData, TValue>): JSX.Element | null {
  const labels = useDataTableLabels();
  if (!column) return null;

  const facets = column.getFacetedUniqueValues();
  const filterValue = column.getFilterValue();
  const selected = new Set<string>(
    Array.isArray(filterValue) ? filterValue.map((value) => String(value)) : [],
  );

  const toggle = (value: string): void => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    column.setFilterValue(next.size > 0 ? [...next] : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-slot="data-table-faceted-filter"
          className={cn('h-8 border-dashed', className)}
        >
          <PlusCircleIcon aria-hidden="true" />
          {title}
          {selected.size > 0 ? (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              {selected.size > maxBadges ? (
                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                  {labels.facetSelected(selected.size)}
                </Badge>
              ) : (
                options
                  .filter((option) => selected.has(option.value))
                  .map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {option.label}
                    </Badge>
                  ))
              )}
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} aria-label={title} />
          <CommandList>
            <CommandEmpty>{labels.facetNoResults}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.has(option.value);
                const count = facets.get(option.value);
                const Icon = option.icon;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    aria-checked={isSelected}
                    data-checked={isSelected ? '' : undefined}
                    onSelect={() => toggle(option.value)}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-4 items-center justify-center rounded-[4px] border border-input',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : '[&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className="size-3.5 text-current" />
                    </span>
                    {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
                    <span>{option.label}</span>
                    {count !== undefined ? (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs tabular-nums">
                        {count}
                      </span>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected.size > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value={labels.clearFilter}
                    onSelect={() => column.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    {labels.clearFilter}
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
