import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lastMonth, rangePresets, thisMonth } from './rangePresets';

// Fixed "today": Friday 6 November 2026, midday.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 6, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

/** The preset with this label. */
function range(label: string) {
  const preset = rangePresets.find((item) => item.label === label);
  if (!preset) throw new Error(`no preset "${label}"`);
  return preset.range();
}

describe('rangePresets', () => {
  it('lists the five built-in presets in order', () => {
    expect(rangePresets.map((preset) => preset.label)).toEqual([
      'Today',
      'Last 7 days',
      'Last 30 days',
      'This month',
      'Last month',
    ]);
  });

  it('today is the current day at midnight', () => {
    expect(range('Today')).toEqual({ from: new Date(2026, 10, 6), to: new Date(2026, 10, 6) });
  });

  it('last 7 days ends today and includes it', () => {
    expect(range('Last 7 days')).toEqual({
      from: new Date(2026, 9, 31),
      to: new Date(2026, 10, 6),
    });
  });

  it('last 30 days ends today and includes it', () => {
    expect(range('Last 30 days')).toEqual({
      from: new Date(2026, 9, 8),
      to: new Date(2026, 10, 6),
    });
  });

  it('this month runs from the first to the last day', () => {
    expect(thisMonth.range()).toEqual({ from: new Date(2026, 10, 1), to: new Date(2026, 10, 30) });
  });

  it('last month runs from the first to the last day of the previous month', () => {
    expect(lastMonth.range()).toEqual({ from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) });
  });

  it('last month works across a year boundary', () => {
    vi.setSystemTime(new Date(2027, 0, 15, 12));

    expect(lastMonth.range()).toEqual({ from: new Date(2026, 11, 1), to: new Date(2026, 11, 31) });
  });

  it('reads the clock each time it is called', () => {
    const first = range('Today');
    vi.setSystemTime(new Date(2026, 10, 9, 8));

    expect(range('Today')).not.toEqual(first);
    expect(range('Today').from).toEqual(new Date(2026, 10, 9));
  });
});
