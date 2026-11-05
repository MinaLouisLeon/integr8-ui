import type { Story } from '@ladle/react';
import { type JSX, useId, useState } from 'react';
import { Checkbox, Label } from '../../src';

/** Unchecked, checked, disabled and invalid. */
export const States: Story = () => {
  const id = useId();
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Checkbox id={`${id}-terms`} />
        <Label htmlFor={`${id}-terms`}>Accept terms and conditions</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id={`${id}-news`} defaultChecked />
        <Label htmlFor={`${id}-news`}>Send me the newsletter</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id={`${id}-disabled`} disabled />
        <Label htmlFor={`${id}-disabled`}>Disabled</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id={`${id}-invalid`} aria-invalid />
        <Label htmlFor={`${id}-invalid`}>Required</Label>
      </div>
    </div>
  );
};

const FILES = ['README.md', 'package.json', 'index.ts'];

function SelectAll(): JSX.Element {
  const id = useId();
  const [picked, setPicked] = useState<string[]>(['README.md']);
  const all = picked.length === FILES.length;
  const some = picked.length > 0 && !all;
  let allState: boolean | 'indeterminate' = all;
  if (some) allState = 'indeterminate';
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`${id}-all`}
          checked={allState}
          onCheckedChange={(checked) => setPicked(checked === true ? FILES : [])}
        />
        <Label htmlFor={`${id}-all`}>All files</Label>
      </div>
      {FILES.map((file) => (
        <div key={file} className="ml-6 flex items-center gap-2">
          <Checkbox
            id={`${id}-${file}`}
            checked={picked.includes(file)}
            onCheckedChange={(checked) =>
              setPicked((current) =>
                checked === true ? [...current, file] : current.filter((item) => item !== file),
              )
            }
          />
          <Label htmlFor={`${id}-${file}`}>{file}</Label>
        </div>
      ))}
    </div>
  );
}

/** "All" shows the indeterminate state when only some items are checked. */
export const Indeterminate: Story = () => <SelectAll />;
