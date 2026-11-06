import type { Story } from '@ladle/react';
import { useState } from 'react';
import { type Time, TimeInput } from '../../src';

function show(time: Time | null): string {
  return time ? JSON.stringify(time) : 'empty';
}

/** 12-hour clock with AM/PM. Type digits, use the arrows, or press `a` / `p`. */
export const Hour12: Story = () => {
  const [time, setTime] = useState<Time | null>({ hours: 15, minutes: 30 });
  return (
    <div className="grid gap-2">
      <TimeInput value={time} onChange={setTime} hourCycle={12} />
      <p className="font-mono text-xs text-muted-foreground">{show(time)}</p>
    </div>
  );
};

/** 24-hour clock. */
export const Hour24: Story = () => {
  const [time, setTime] = useState<Time | null>(null);
  return (
    <div className="grid gap-2">
      <TimeInput value={time} onChange={setTime} hourCycle={24} />
      <p className="font-mono text-xs text-muted-foreground">{show(time)}</p>
    </div>
  );
};

/** With a seconds segment. */
export const WithSeconds: Story = () => {
  const [time, setTime] = useState<Time | null>({ hours: 9, minutes: 5, seconds: 30 });
  return (
    <div className="grid gap-2">
      <TimeInput value={time} onChange={setTime} hourCycle={24} showSeconds />
      <p className="font-mono text-xs text-muted-foreground">{show(time)}</p>
    </div>
  );
};

/** The arrow keys move minutes by 15. */
export const MinuteStep: Story = () => {
  const [time, setTime] = useState<Time | null>({ hours: 9, minutes: 0 });
  return <TimeInput value={time} onChange={setTime} hourCycle={24} minuteStep={15} />;
};

/** A time outside 09:00-17:30 is moved to the nearest end. */
export const MinAndMax: Story = () => {
  const [time, setTime] = useState<Time | null>({ hours: 10, minutes: 0 });
  return (
    <TimeInput
      value={time}
      onChange={setTime}
      hourCycle={24}
      min={{ hours: 9, minutes: 0 }}
      max={{ hours: 17, minutes: 30 }}
    />
  );
};

/** The error style, set with `aria-invalid`. */
export const Invalid: Story = () => <TimeInput hourCycle={12} aria-invalid />;

/** Disabled. */
export const Disabled: Story = () => (
  <TimeInput value={{ hours: 8, minutes: 0 }} hourCycle={12} disabled />
);
