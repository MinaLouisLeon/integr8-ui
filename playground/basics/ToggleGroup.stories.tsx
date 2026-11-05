import type { Story } from '@ladle/react';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../../src';

/** One alignment at a time, outlined. */
export const Single: Story = () => (
  <ToggleGroup type="single" variant="outline" defaultValue="left" aria-label="Text alignment">
    <ToggleGroupItem value="left" aria-label="Align left">
      <AlignLeftIcon />
    </ToggleGroupItem>
    <ToggleGroupItem value="center" aria-label="Align center">
      <AlignCenterIcon />
    </ToggleGroupItem>
    <ToggleGroupItem value="right" aria-label="Align right">
      <AlignRightIcon />
    </ToggleGroupItem>
  </ToggleGroup>
);

/** Several formats at once, in each size. */
export const Multiple: Story = () => (
  <div className="grid gap-4">
    {(['sm', 'default', 'lg'] as const).map((size) => (
      <ToggleGroup key={size} type="multiple" size={size} aria-label={`Formatting ${size}`}>
        <ToggleGroupItem value="bold" aria-label="Bold">
          <BoldIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <ItalicIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline" disabled>
          <UnderlineIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    ))}
  </div>
);
