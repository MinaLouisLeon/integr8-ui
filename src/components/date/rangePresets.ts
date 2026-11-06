// Built-in presets for the range pickers (plain functions, no React).
import { endOfMonth, startOfDay, startOfMonth, subDays, subMonths } from 'date-fns';
import type { DateRange } from 'react-day-picker';

/** A shortcut shown next to the calendar of a range picker. */
export interface RangePreset {
  /** The button text. */
  label: string;
  /** The range to select. Called when the preset is clicked, so "today" is always current. */
  range: () => DateRange;
}

/** Today only. */
export const today: RangePreset = {
  label: 'Today',
  range: () => {
    const day = startOfDay(new Date());
    return { from: day, to: day };
  },
};

/** The last 7 days, today included. */
export const last7Days: RangePreset = {
  label: 'Last 7 days',
  range: () => {
    const day = startOfDay(new Date());
    return { from: subDays(day, 6), to: day };
  },
};

/** The last 30 days, today included. */
export const last30Days: RangePreset = {
  label: 'Last 30 days',
  range: () => {
    const day = startOfDay(new Date());
    return { from: subDays(day, 29), to: day };
  },
};

/** From the first to the last day of the current month. */
export const thisMonth: RangePreset = {
  label: 'This month',
  range: () => {
    const day = startOfDay(new Date());
    return { from: startOfMonth(day), to: startOfDay(endOfMonth(day)) };
  },
};

/** From the first to the last day of the previous month. */
export const lastMonth: RangePreset = {
  label: 'Last month',
  range: () => {
    const previous = subMonths(startOfDay(new Date()), 1);
    return { from: startOfMonth(previous), to: startOfDay(endOfMonth(previous)) };
  },
};

/**
 * The built-in presets: today, last 7 days, last 30 days, this month and last month. Every
 * range holds whole days (midnight); the date-time range picker adds its default times.
 *
 * @example
 * ```tsx
 * <DateRangePicker value={range} onChange={setRange} presets={rangePresets} />
 * ```
 */
export const rangePresets: readonly RangePreset[] = [
  today,
  last7Days,
  last30Days,
  thisMonth,
  lastMonth,
];
