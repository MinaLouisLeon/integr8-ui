import type { Story } from '@ladle/react';
import { Fragment } from 'react';
import { ScrollArea, ScrollBar, Separator } from '../../src';

const TAGS = Array.from({ length: 50 }, (_, index) => `v1.2.0-beta.${50 - index}`);
const ARTWORKS = ['Aurora', 'Lime', 'Violet', 'Cyan', 'Pink', 'Grain', 'Signal', 'Pulse'];

/** A vertical list in a fixed-height box. */
export const Vertical: Story = () => (
  <ScrollArea className="h-72 w-48 rounded-md border">
    <div className="p-4">
      <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
      {TAGS.map((tag) => (
        <Fragment key={tag}>
          <div className="text-sm">{tag}</div>
          <Separator className="my-2" />
        </Fragment>
      ))}
    </div>
  </ScrollArea>
);

/** A horizontal row with its own scrollbar. */
export const Horizontal: Story = () => (
  <ScrollArea className="w-96 rounded-md border whitespace-nowrap">
    <div className="flex w-max gap-4 p-4">
      {ARTWORKS.map((name) => (
        <div
          key={name}
          className="flex h-32 w-40 shrink-0 items-center justify-center rounded-md bg-muted text-sm"
        >
          {name}
        </div>
      ))}
    </div>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
);
