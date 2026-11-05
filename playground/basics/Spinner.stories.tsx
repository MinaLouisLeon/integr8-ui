import type { Story } from '@ladle/react';
import { Badge, Button, Spinner } from '../../src';

/** Sizes, colors and the spinner inside other components. */
export const Spinners: Story = () => (
  <div className="flex flex-wrap items-center gap-6">
    <Spinner />
    <Spinner className="size-6" />
    <Spinner className="size-8 text-primary" />
    <Button disabled>
      <Spinner /> Loading
    </Button>
    <Badge variant="secondary">
      <Spinner aria-label="Syncing" /> Syncing
    </Badge>
  </div>
);
