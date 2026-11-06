'use client';

// The lists of hours, minutes, seconds and AM/PM shared by TimePicker and DateTimePicker.
// Internal: not exported from the package.
import type { JSX } from 'react';
import { Button } from '../basics/Button';
import { clampTime, type Time } from './time';

/** The hour cycle of the browser's locale. */
export function localeHourCycle(): 12 | 24 {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hour12
      ? 12
      : 24;
  } catch {
    return 24;
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function range(count: number, step: number, from = 0): number[] {
  const values: number[] = [];
  for (let value = from; value < from + count; value += step) values.push(value);
  return values;
}

/** One scrolling list of values. */
function Column({
  label,
  values,
  selected,
  disabled,
  onPick,
}: {
  label: string;
  values: number[];
  selected: number | undefined;
  disabled: boolean | undefined;
  onPick: (value: number) => void;
}): JSX.Element {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a <fieldset> brings a border, padding and a legend; this is a styled scrolling list.
    <div
      role="group"
      aria-label={label}
      className="flex max-h-56 w-14 flex-col gap-0.5 overflow-y-auto p-1"
    >
      {values.map((value) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant={value === selected ? 'default' : 'ghost'}
          aria-pressed={value === selected}
          disabled={disabled}
          className="font-mono tabular-nums"
          onClick={() => onPick(value)}
        >
          {pad(value)}
        </Button>
      ))}
    </div>
  );
}

/** Props for {@link TimeLists}. */
export interface TimeListsProps {
  /** The time, or `undefined` when empty. */
  value: Time | undefined;
  /** Called with the complete time after a pick. */
  onChange: (time: Time) => void;
  hourCycle: 12 | 24;
  showSeconds?: boolean | undefined;
  /** Minutes listed in steps of this many. Default `1`. */
  minuteStep?: number | undefined;
  /** A picked time before it is moved to it. */
  min?: Time | undefined;
  /** A picked time after it is moved to it. */
  max?: Time | undefined;
  disabled?: boolean | undefined;
}

/**
 * Lists of hours, minutes, seconds (with `showSeconds`) and AM/PM (in 12-hour mode). Picking a
 * value changes that part of the time; an empty time starts at 00:00 (12:00 AM).
 */
export function TimeLists({
  value,
  onChange,
  hourCycle,
  showSeconds = false,
  minuteStep = 1,
  min,
  max,
  disabled,
}: TimeListsProps): JSX.Element {
  const step = Number.isFinite(minuteStep) ? Math.max(1, Math.floor(minuteStep)) : 1;
  const hours24 = value?.hours;
  const period = hours24 === undefined ? undefined : hours24 >= 12 ? 'PM' : 'AM';

  function pick(parts: Partial<Time>): void {
    const base: Time = value ?? { hours: 0, minutes: 0 };
    const next: Time = showSeconds
      ? { hours: base.hours, minutes: base.minutes, seconds: base.seconds ?? 0, ...parts }
      : { hours: base.hours, minutes: base.minutes, ...parts };
    const clamped = clampTime(next, min, max);
    onChange(
      showSeconds
        ? { hours: clamped.hours, minutes: clamped.minutes, seconds: clamped.seconds ?? 0 }
        : { hours: clamped.hours, minutes: clamped.minutes },
    );
  }

  function pickHour(hour: number): void {
    pick({ hours: hourCycle === 24 ? hour : (hour % 12) + (period === 'PM' ? 12 : 0) });
  }

  function pickPeriod(next: 'AM' | 'PM'): void {
    pick({ hours: ((hours24 ?? 0) % 12) + (next === 'PM' ? 12 : 0) });
  }

  const hourValues = hourCycle === 24 ? range(24, 1) : [12, ...range(11, 1, 1)];
  const shownHour =
    hours24 === undefined ? undefined : hourCycle === 24 ? hours24 : hours24 % 12 || 12;

  return (
    <div className="flex divide-x">
      <Column
        label="Select hours"
        values={hourValues}
        selected={shownHour}
        disabled={disabled}
        onPick={pickHour}
      />
      <Column
        label="Select minutes"
        values={range(60, step)}
        selected={value?.minutes}
        disabled={disabled}
        onPick={(minutes) => pick({ minutes })}
      />
      {showSeconds ? (
        <Column
          label="Select seconds"
          values={range(60, 1)}
          selected={value?.seconds ?? (value ? 0 : undefined)}
          disabled={disabled}
          onPick={(seconds) => pick({ seconds })}
        />
      ) : null}
      {hourCycle === 12 ? (
        // biome-ignore lint/a11y/useSemanticElements: a <fieldset> brings a border, padding and a legend; this is a styled list.
        <div role="group" aria-label="Select AM or PM" className="flex flex-col gap-0.5 p-1">
          {(['AM', 'PM'] as const).map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={item === period ? 'default' : 'ghost'}
              aria-pressed={item === period}
              disabled={disabled}
              onClick={() => pickPeriod(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
