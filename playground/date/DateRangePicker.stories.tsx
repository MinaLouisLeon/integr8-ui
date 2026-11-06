import type { Story } from '@ladle/react';
import { useState } from 'react';
import { type DateRange, DateRangePicker, rangePresets } from '../../src';

/** Two typed inputs and a two-month popover. A "to" before the "from" is flagged. */
export const Default: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <div className="grid max-w-md gap-2">
      <DateRangePicker value={range ?? null} onChange={setRange} clearable />
      <p className="text-sm text-muted-foreground">
        {range
          ? `${range.from?.toDateString() ?? '…'} – ${range.to?.toDateString() ?? '…'}`
          : 'No range'}
      </p>
    </div>
  );
};

/** The built-in presets: today, last 7 days, last 30 days, this month, last month. */
export const WithPresets: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <div className="max-w-md">
      <DateRangePicker value={range ?? null} onChange={setRange} presets={rangePresets} clearable />
    </div>
  );
};

/** Your own presets. */
export const CustomPresets: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <div className="max-w-md">
      <DateRangePicker
        value={range ?? null}
        onChange={setRange}
        presets={[
          {
            label: 'Next 14 days',
            range: () => {
              const from = new Date();
              const to = new Date();
              to.setDate(to.getDate() + 13);
              return { from, to };
            },
          },
        ]}
      />
    </div>
  );
};

/** `allowTyping={false}`: one button that opens the calendar. */
export const ButtonOnly: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <div className="max-w-md">
      <DateRangePicker allowTyping={false} value={range ?? null} onChange={setRange} />
    </div>
  );
};

/** One month, week numbers, weekends disabled. */
export const OneMonthWithWeekNumbers: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <div className="max-w-md">
      <DateRangePicker
        value={range ?? null}
        onChange={setRange}
        numberOfMonths={1}
        showWeekNumber
        disabledDays={{ dayOfWeek: [0, 6] }}
      />
    </div>
  );
};

/** Disabled. */
export const Disabled: Story = () => (
  <div className="max-w-md">
    <DateRangePicker disabled value={{ from: new Date(), to: new Date() }} />
  </div>
);
