import type { Story } from '@ladle/react';
import { useState } from 'react';
import { type DateRange, DateTimeRangePicker, rangePresets } from '../../src';

/** Two typed date-times and a popover with two months and a time input for each end. */
export const Default: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <div className="grid max-w-2xl gap-2">
      <DateTimeRangePicker value={range ?? null} onChange={setRange} minuteStep={15} clearable />
      <p className="text-sm text-muted-foreground">
        {range ? `${range.from?.toString() ?? '…'} → ${range.to?.toString() ?? '…'}` : 'No range'}
      </p>
    </div>
  );
};

/** Presets set whole days: from 00:00 to 23:59 (the default times). */
export const WithPresets: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <div className="max-w-2xl">
      <DateTimeRangePicker value={range ?? null} onChange={setRange} presets={rangePresets} />
    </div>
  );
};

/** Office hours as the default times, 24-hour clock. */
export const DefaultTimes: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <div className="max-w-2xl">
      <DateTimeRangePicker
        value={range ?? null}
        onChange={setRange}
        hourCycle={24}
        defaultFromTime={{ hours: 9, minutes: 0 }}
        defaultToTime={{ hours: 17, minutes: 30 }}
      />
    </div>
  );
};

/** Seconds are shown, and the default end time becomes 23:59:59. */
export const WithSeconds: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <div className="max-w-3xl">
      <DateTimeRangePicker value={range ?? null} onChange={setRange} showSeconds hourCycle={24} />
    </div>
  );
};

/** Only the next 30 days can be used, to the minute. */
export const MinAndMax: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  const min = new Date();
  const max = new Date();
  max.setDate(max.getDate() + 30);
  return (
    <div className="max-w-2xl">
      <DateTimeRangePicker value={range ?? null} onChange={setRange} min={min} max={max} />
    </div>
  );
};

/** `allowTyping={false}`: one button that opens the popover. */
export const ButtonOnly: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <div className="max-w-2xl">
      <DateTimeRangePicker allowTyping={false} value={range ?? null} onChange={setRange} />
    </div>
  );
};

/** Disabled. */
export const Disabled: Story = () => (
  <div className="max-w-2xl">
    <DateTimeRangePicker disabled value={{ from: new Date(), to: new Date() }} />
  </div>
);
