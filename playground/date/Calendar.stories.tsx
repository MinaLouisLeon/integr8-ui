import type { Story } from '@ladle/react';
import { de } from 'date-fns/locale';
import { useState } from 'react';
import { Button, Calendar, type DateRange } from '../../src';

/** No selection: a display-only month with today outlined (what a taskbar clock shows). */
export const DisplayOnly: Story = () => <Calendar className="rounded-md border" />;

/** One day, with a "Today" button in the footer. */
export const Single: Story = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      month={month}
      onMonthChange={setMonth}
      className="rounded-md border"
      footer={
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => {
            const today = new Date();
            setDate(today);
            setMonth(today);
          }}
        >
          Today
        </Button>
      }
    />
  );
};

/** Any number of days. */
export const Multiple: Story = () => {
  const [days, setDays] = useState<Date[] | undefined>([]);
  return (
    <Calendar mode="multiple" selected={days} onSelect={setDays} className="rounded-md border" />
  );
};

/** A range of days: ends in the primary color, the days between on the accent. */
export const Range: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <Calendar mode="range" selected={range} onSelect={setRange} className="rounded-md border" />
  );
};

/** Month and year selects (the ui Select) instead of the plain caption. */
export const DropdownCaption: Story = () => {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      selected={date}
      onSelect={setDate}
      startMonth={new Date(2020, 0)}
      endMonth={new Date(2032, 11)}
      className="rounded-md border"
    />
  );
};

/**
 * No `startMonth` / `endMonth`: the year list starts 50 years before and after today and loads
 * 25 more at either end whenever you scroll near it, so it never runs out.
 */
export const DropdownLongRange: Story = () => {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  );
};

/** Two months side by side, as a range picker shows them. */
export const TwoMonths: Story = () => {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      selected={range}
      onSelect={setRange}
      className="rounded-md border"
    />
  );
};

/** ISO week numbers in the first column. */
export const WeekNumbers: Story = () => {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Calendar
      mode="single"
      showWeekNumber
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  );
};

/** Weekends disabled, and only the next 60 days can be picked (`fromDate` / `toDate`). */
export const DisabledDays: Story = () => {
  const [date, setDate] = useState<Date | undefined>();
  const today = new Date();
  const limit = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60);
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      disabled={{ dayOfWeek: [0, 6] }}
      fromDate={today}
      toDate={limit}
      className="rounded-md border"
    />
  );
};

/** Without the days of the neighbouring months. */
export const NoOutsideDays: Story = () => {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Calendar
      mode="single"
      showOutsideDays={false}
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  );
};

/** Another locale (German): month and day names, week starting on Monday. */
export const OtherLocale: Story = () => {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Calendar
      mode="single"
      locale={de}
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  );
};
