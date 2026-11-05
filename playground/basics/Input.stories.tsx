import type { Story } from '@ladle/react';
import { useId } from 'react';
import { Input, Label } from '../../src';

/** Text, email, password, file, disabled and invalid inputs. */
export const Inputs: Story = () => {
  const id = useId();
  return (
    <div className="grid max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`${id}-name`}>Name</Label>
        <Input id={`${id}-name`} placeholder="Mina" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-email`}>Email</Label>
        <Input id={`${id}-email`} type="email" placeholder="you@example.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-password`}>Password</Label>
        <Input id={`${id}-password`} type="password" defaultValue="secret" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-file`}>Picture</Label>
        <Input id={`${id}-file`} type="file" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-disabled`}>Disabled</Label>
        <Input id={`${id}-disabled`} disabled placeholder="Not editable" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-invalid`}>Invalid</Label>
        <Input id={`${id}-invalid`} aria-invalid defaultValue="not-an-email" />
      </div>
    </div>
  );
};
