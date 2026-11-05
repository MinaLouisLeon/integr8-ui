import type { Story } from '@ladle/react';
import { useId } from 'react';
import { Label, Switch } from '../../src';

/** Off, on and disabled. */
export const Switches: Story = () => {
  const id = useId();
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Switch id={`${id}-airplane`} />
        <Label htmlFor={`${id}-airplane`}>Airplane mode</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id={`${id}-wifi`} defaultChecked />
        <Label htmlFor={`${id}-wifi`}>Wi-Fi</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id={`${id}-bluetooth`} disabled />
        <Label htmlFor={`${id}-bluetooth`}>Bluetooth (disabled)</Label>
      </div>
    </div>
  );
};
