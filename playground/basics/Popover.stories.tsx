import type { Story } from '@ladle/react';
import { useId } from 'react';
import { Button, Input, Label, Popover, PopoverContent, PopoverTrigger } from '../../src';

/** A small form in a popover. */
export const Dimensions: Story = () => {
  const id = useId();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Dimensions</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="grid gap-1">
            <h4 className="leading-none font-medium">Dimensions</h4>
            <p className="text-sm text-muted-foreground">Set the size of the layer.</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor={`${id}-width`}>Width</Label>
            <Input id={`${id}-width`} defaultValue="100%" className="col-span-2 h-8" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor={`${id}-height`}>Height</Label>
            <Input id={`${id}-height`} defaultValue="25px" className="col-span-2 h-8" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/** Placement on each side. */
export const Sides: Story = () => (
  <div className="flex flex-wrap gap-3 p-16">
    {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
      <Popover key={side}>
        <PopoverTrigger asChild>
          <Button variant="outline">{side}</Button>
        </PopoverTrigger>
        <PopoverContent side={side} className="w-40 text-sm">
          Opens on the {side}.
        </PopoverContent>
      </Popover>
    ))}
  </div>
);
