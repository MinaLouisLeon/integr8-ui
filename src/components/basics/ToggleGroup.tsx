'use client';

import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { type ComponentProps, createContext, type JSX, useContext } from 'react';
import { cn } from '../../lib/cn';
import { type ToggleSize, type ToggleVariant, toggleStyles } from './Toggle';

interface ToggleGroupStyle {
  variant?: ToggleVariant | undefined;
  size?: ToggleSize | undefined;
}

const ToggleGroupContext = createContext<ToggleGroupStyle>({});

/** Props for {@link ToggleGroup}. Set `type="single"` or `type="multiple"`. */
export type ToggleGroupProps = ComponentProps<typeof ToggleGroupPrimitive.Root> & {
  /** Style of every item. Default `'default'`. */
  variant?: ToggleVariant | undefined;
  /** Size of every item. Default `'default'`. */
  size?: ToggleSize | undefined;
};

/**
 * A row of toggles joined together, where one (`type="single"`) or several
 * (`type="multiple"`) can be on. Arrow keys move between items.
 *
 * @example
 * ```tsx
 * <ToggleGroup type="single" variant="outline" defaultValue="left" aria-label="Alignment">
 *   <ToggleGroupItem value="left" aria-label="Left"><AlignLeftIcon /></ToggleGroupItem>
 *   <ToggleGroupItem value="center" aria-label="Center"><AlignCenterIcon /></ToggleGroupItem>
 * </ToggleGroup>
 * ```
 */
export function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: ToggleGroupProps): JSX.Element {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant ?? 'default'}
      data-size={size ?? 'default'}
      className={cn(
        'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
        className,
      )}
      {...props}
    >
      <ToggleGroupContext value={{ variant, size }}>{children}</ToggleGroupContext>
    </ToggleGroupPrimitive.Root>
  );
}

/** Props for {@link ToggleGroupItem}. */
export type ToggleGroupItemProps = ComponentProps<typeof ToggleGroupPrimitive.Item> & {
  /** Overrides the group's style for this item. */
  variant?: ToggleVariant | undefined;
  /** Overrides the group's size for this item. */
  size?: ToggleSize | undefined;
};

/** One toggle of a {@link ToggleGroup}. */
export function ToggleGroupItem({
  className,
  variant,
  size,
  ...props
}: ToggleGroupItemProps): JSX.Element {
  const group = useContext(ToggleGroupContext);
  const itemVariant = variant ?? group.variant;
  const itemSize = size ?? group.size;
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={itemVariant ?? 'default'}
      data-size={itemSize ?? 'default'}
      className={cn(
        toggleStyles({ variant: itemVariant, size: itemSize }),
        'min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10',
        'data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
        className,
      )}
      {...props}
    />
  );
}
