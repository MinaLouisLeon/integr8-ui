'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import type { ComponentProps, JSX } from 'react';
import { cn } from '../../lib/cn';

/** Props for {@link Tabs}. */
export type TabsProps = ComponentProps<typeof TabsPrimitive.Root>;

/**
 * Switches between panels of content. Arrow keys move between tabs. Pill-shaped in the
 * Integr8 theme.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="account">
 *   <TabsList>
 *     <TabsTrigger value="account">Account</TabsTrigger>
 *     <TabsTrigger value="password">Password</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="account">...</TabsContent>
 *   <TabsContent value="password">...</TabsContent>
 * </Tabs>
 * ```
 */
export function Tabs({ className, ...props }: TabsProps): JSX.Element {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

/** Props for {@link TabsList}. */
export type TabsListProps = ComponentProps<typeof TabsPrimitive.List>;

/** The row of {@link TabsTrigger}s. */
export function TabsList({ className, ...props }: TabsListProps): JSX.Element {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground in-data-[theme=integr8]:rounded-full',
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link TabsTrigger}. */
export type TabsTriggerProps = ComponentProps<typeof TabsPrimitive.Trigger>;

/** One tab. Its `value` matches a {@link TabsContent}. */
export function TabsTrigger({ className, ...props }: TabsTriggerProps): JSX.Element {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] in-data-[theme=integr8]:rounded-full in-data-[theme=integr8]:px-3',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-background data-[state=active]:shadow-sm',
        'dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link TabsContent}. */
export type TabsContentProps = ComponentProps<typeof TabsPrimitive.Content>;

/** The panel shown when its tab is active. */
export function TabsContent({ className, ...props }: TabsContentProps): JSX.Element {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}
