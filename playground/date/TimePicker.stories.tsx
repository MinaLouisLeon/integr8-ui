import type { Story } from '@ladle/react';
import { useState } from 'react';
import { type Time, TimePicker } from '../../src';

/** Type in the segments, or open the clock to click an hour and a minute. */
export const Default: Story = () => {
  const [time, setTime] = useState<Time | null>(null);
  return (
    <div className="grid gap-2">
      <TimePicker value={time} onChange={setTime} hourCycle={24} clearable />
      <p className="text-sm text-muted-foreground">{time ? JSON.stringify(time) : 'No time'}</p>
    </div>
  );
};

/** 12-hour clock with an AM/PM list and 15-minute steps. */
export const TwelveHour: Story = () => {
  const [time, setTime] = useState<Time | null>({ hours: 15, minutes: 30 });
  return <TimePicker value={time} onChange={setTime} hourCycle={12} minuteStep={15} />;
};

/** 12-hour clock with seconds: hours, minutes, seconds and AM/PM lists. */
export const TwelveHourWithSeconds: Story = () => {
  const [time, setTime] = useState<Time | null>({ hours: 15, minutes: 30, seconds: 45 });
  return <TimePicker value={time} onChange={setTime} hourCycle={12} showSeconds clearable />;
};

/** 24-hour clock with a seconds list. */
export const WithSeconds: Story = () => {
  const [time, setTime] = useState<Time | null>(null);
  return <TimePicker value={time} onChange={setTime} hourCycle={24} showSeconds />;
};

/** Business hours only: a time outside 09:00 to 17:00 moves to the nearest limit. */
export const MinAndMax: Story = () => {
  const [time, setTime] = useState<Time | null>(null);
  return (
    <TimePicker
      value={time}
      onChange={setTime}
      hourCycle={24}
      min={{ hours: 9, minutes: 0 }}
      max={{ hours: 17, minutes: 0 }}
    />
  );
};

/** Disabled. */
export const Disabled: Story = () => (
  <TimePicker disabled value={{ hours: 9, minutes: 0 }} hourCycle={24} />
);
