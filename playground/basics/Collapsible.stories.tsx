import type { Story } from '@ladle/react';
import { ChevronsUpDownIcon } from 'lucide-react';
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../src';

/** A list that shows the first item and hides the rest. */
export const Default: Story = () => (
  <Collapsible className="grid w-80 gap-2">
    <div className="flex items-center justify-between gap-4">
      <h4 className="text-sm font-semibold">3 starred repositories</h4>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Toggle">
          <ChevronsUpDownIcon />
        </Button>
      </CollapsibleTrigger>
    </div>
    <div className="rounded-md border px-4 py-2 font-mono text-sm">integr8-ui</div>
    <CollapsibleContent className="grid gap-2">
      <div className="rounded-md border px-4 py-2 font-mono text-sm">integr8-config</div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm">integr8-workbench</div>
    </CollapsibleContent>
  </Collapsible>
);
