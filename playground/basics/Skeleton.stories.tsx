import type { Story } from '@ladle/react';
import { Skeleton } from '../../src';

/** A loading placeholder for a profile row and a card. */
export const Placeholders: Story = () => (
  <div className="grid gap-8">
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="grid gap-2">
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
    <div className="grid gap-3">
      <Skeleton className="h-32 w-64 rounded-xl" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-52" />
    </div>
  </div>
);
