import type { Story } from '@ladle/react';
import { type JSX, useId, useState } from 'react';
import { Label, Slider } from '../../src';

/** A single value, a range, steps, disabled and vertical. */
export const Sliders: Story = () => (
  <div className="grid max-w-sm gap-8">
    <Slider defaultValue={[50]} aria-label="Volume" />
    <Slider defaultValue={[20, 80]} aria-label="Price range" />
    <Slider defaultValue={[2]} min={0} max={10} step={2} aria-label="Steps" />
    <Slider defaultValue={[30]} disabled aria-label="Disabled" />
    <div className="flex h-40 gap-8">
      <Slider defaultValue={[40]} orientation="vertical" aria-label="Bass" />
      <Slider defaultValue={[70]} orientation="vertical" aria-label="Treble" />
    </div>
  </div>
);

function Controlled(): JSX.Element {
  const id = useId();
  const [value, setValue] = useState([0.3]);
  return (
    <div className="grid max-w-sm gap-3">
      <Label id={id}>Opacity: {Math.round((value[0] ?? 0) * 100)}%</Label>
      <Slider
        value={value}
        onValueChange={setValue}
        min={0}
        max={1}
        step={0.01}
        aria-labelledby={id}
      />
    </div>
  );
}

/** A controlled slider with a live label. */
export const ControlledValue: Story = () => <Controlled />;
