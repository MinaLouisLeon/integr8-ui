import type { Story } from '@ladle/react';
import { Separator } from '../../src';

/** Horizontal and vertical separators. */
export const Default: Story = () => (
  <div className="max-w-sm">
    <div className="grid gap-1">
      <h4 className="text-sm leading-none font-medium">@integr8-media/ui</h4>
      <p className="text-sm text-muted-foreground">The Integr8 design system.</p>
    </div>
    <Separator className="my-4" />
    <div className="flex h-5 items-center gap-4 text-sm">
      <span>Docs</span>
      <Separator orientation="vertical" />
      <span>Source</span>
      <Separator orientation="vertical" />
      <span>Themes</span>
    </div>
  </div>
);
