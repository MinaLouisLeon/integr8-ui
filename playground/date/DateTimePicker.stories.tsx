import type { Story } from '@ladle/react';
import { useState } from 'react';
import { DateTimePicker } from '../../src';

/** Type `11/06/2026, 3:30 PM` or `2026-11-06 15:30`, or pick a day and set the time. */
export const Default: Story = () => {
  const [value, setValue] = useState<Date | undefined>();
  return (
    <div className="grid max-w-sm gap-2">
      <DateTimePicker value={value ?? null} onChange={setValue} clearable />
      <p className="text-sm text-muted-foreground">{value ? value.toString() : 'No value'}</p>
    </div>
  );
};

/** 24-hour clock, seconds, and 15-minute steps. */
export const TwentyFourHourWithSeconds: Story = () => {
  const [value, setValue] = useState<Date | undefined>(new Date());
  return (
    <div className="max-w-sm">
      <DateTimePicker
        value={value ?? null}
        onChange={setValue}
        hourCycle={24}
        showSeconds
        minuteStep={15}
      />
    </div>
  );
};

/**
 * `timePicker`: the time row in the popover is a time input with a clock button that opens the
 * lists of hours, minutes and AM/PM.
 */
export const WithTimePicker: Story = () => {
  const [value, setValue] = useState<Date | undefined>(new Date());
  return (
    <div className="max-w-sm">
      <DateTimePicker
        value={value ?? null}
        onChange={setValue}
        hourCycle={12}
        minuteStep={5}
        timePicker
      />
    </div>
  );
};

/** Picking or typing only a date gives 09:00. */
export const DefaultTime: Story = () => {
  const [value, setValue] = useState<Date | undefined>();
  return (
    <div className="max-w-sm">
      <DateTimePicker
        value={value ?? null}
        onChange={setValue}
        defaultTime={{ hours: 9, minutes: 0 }}
      />
    </div>
  );
};

/** Only business hours of this week: before `min` or after `max` is flagged. */
export const MinAndMax: Story = () => {
  const [value, setValue] = useState<Date | undefined>();
  const min = new Date();
  min.setHours(9, 0, 0, 0);
  const max = new Date();
  max.setDate(max.getDate() + 6);
  max.setHours(17, 0, 0, 0);
  return (
    <div className="max-w-sm">
      <DateTimePicker value={value ?? null} onChange={setValue} min={min} max={max} />
    </div>
  );
};

/** `allowTyping={false}`: a button that shows the value. */
export const ButtonOnly: Story = () => {
  const [value, setValue] = useState<Date | undefined>(new Date());
  return (
    <div className="max-w-sm">
      <DateTimePicker allowTyping={false} value={value ?? null} onChange={setValue} />
    </div>
  );
};

/** Disabled. */
export const Disabled: Story = () => (
  <div className="max-w-sm">
    <DateTimePicker disabled value={new Date()} />
  </div>
);
