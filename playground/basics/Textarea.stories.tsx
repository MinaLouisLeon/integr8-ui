import type { Story } from '@ladle/react';
import { useId } from 'react';
import { Label, Textarea } from '../../src';

/** A textarea that grows with its content, plus disabled and invalid states. */
export const Textareas: Story = () => {
  const id = useId();
  return (
    <div className="grid max-w-md gap-4">
      <div className="grid gap-2">
        <Label htmlFor={id}>Message</Label>
        <Textarea id={id} placeholder="Type your message here." />
      </div>
      <Textarea aria-label="Disabled" disabled placeholder="Disabled" />
      <Textarea aria-label="Invalid" aria-invalid defaultValue="Too short" />
    </div>
  );
};
