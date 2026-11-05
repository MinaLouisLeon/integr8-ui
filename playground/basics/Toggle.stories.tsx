import type { Story } from '@ladle/react';
import { BoldIcon, ItalicIcon, UnderlineIcon } from 'lucide-react';
import { Toggle } from '../../src';

/** Variants, sizes and disabled. */
export const Toggles: Story = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Toggle aria-label="Bold">
      <BoldIcon />
    </Toggle>
    <Toggle variant="outline" aria-label="Italic" defaultPressed>
      <ItalicIcon />
    </Toggle>
    <Toggle size="sm" aria-label="Underline small">
      <UnderlineIcon />
    </Toggle>
    <Toggle size="lg" variant="outline" aria-label="Underline large">
      <UnderlineIcon />
    </Toggle>
    <Toggle variant="outline">
      <ItalicIcon /> Italic
    </Toggle>
    <Toggle disabled aria-label="Disabled">
      <BoldIcon />
    </Toggle>
  </div>
);
