import type { Story } from '@ladle/react';
import { Kbd } from '../../src';

/** Single keys and a key combination. */
export const Keys: Story = () => (
  <div className="grid gap-3 text-sm">
    <p>
      Press <Kbd>Esc</Kbd> to close.
    </p>
    <p>
      Open the palette with <Kbd>⌘</Kbd> <Kbd>K</Kbd> or <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>.
    </p>
  </div>
);
