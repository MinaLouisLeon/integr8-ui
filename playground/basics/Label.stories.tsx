import type { Story } from '@ladle/react';
import { useId } from 'react';
import { Checkbox, Input, Label } from '../../src';

/** Labels for an input and a checkbox; the second dims with its disabled peer. */
export const Labels: Story = () => {
  const id = useId();
  return (
    <div className="grid max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`${id}-email`}>Email</Label>
        <Input id={`${id}-email`} type="email" />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id={`${id}-disabled`} disabled />
        <Label htmlFor={`${id}-disabled`}>Disabled option</Label>
      </div>
    </div>
  );
};
