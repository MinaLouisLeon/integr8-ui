'use client';

import { format as formatDate, isSameDay, startOfDay } from 'date-fns';
import { type JSX, useRef, useState } from 'react';
import { Button } from '../basics/Button';
import { Calendar, type DateRange } from './Calendar';
import type { DateRangePickerProps } from './DateRangePicker';
import {
  assignRef,
  clampDate,
  DateTextInput,
  defaultDateTimeFormat,
  earlierOf,
  laterOf,
  PickerFrame,
  useControlledValue,
} from './dateInputShared';
import { TimeInput } from './TimeInput';
import { type Time, timeToSeconds, toTime, withTime } from './time';

/**
 * Props for {@link DateTimeRangePicker}: the {@link DateRangePicker} props for a range whose
 * `from` and `to` carry times (the default `format` is `Pp`, or a fixed pattern when
 * `hourCycle` is set), plus the time options below.
 */
export interface DateTimeRangePickerProps extends DateRangePickerProps {
  /** 12-hour (with AM/PM) or 24-hour. Default: the locale's. */
  hourCycle?: 12 | 24 | undefined;
  /** Show and edit seconds. Default `false`. */
  showSeconds?: boolean | undefined;
  /** Minutes jump by this step with the arrow keys in the time inputs. Default `1`. */
  minuteStep?: number | undefined;
  /** Time of "from" when only a date is picked or typed. Default 00:00. */
  defaultFromTime?: Time | undefined;
  /** Time of "to" when only a date is picked or typed. Default 23:59 (23:59:59 with seconds). */
  defaultToTime?: Time | undefined;
  /** Earliest date and time. */
  min?: Date | undefined;
  /** Latest date and time. */
  max?: Date | undefined;
}

const MIDNIGHT: Time = { hours: 0, minutes: 0 };

/**
 * The time limit that applies on `day`: the latest `min` or the earliest `max` among the
 * `limits` that fall on the same day.
 */
function timeBound(
  day: Date | undefined,
  limits: (Date | undefined)[],
  pick: 'min' | 'max',
): Time | undefined {
  if (!day) return undefined;
  const times = limits
    .filter((limit): limit is Date => limit !== undefined && isSameDay(limit, day))
    .map(toTime);
  if (times.length === 0) return undefined;
  return times.reduce((a, b) =>
    timeToSeconds(a) >= timeToSeconds(b) === (pick === 'min') ? a : b,
  );
}

/**
 * Two date-time inputs (from, to) and a popover with two months, a time input for each end and
 * optional presets. A "to" earlier than the "from", comparing date and time, is invalid
 * (`'out-of-range'`). Picking days only sets the dates: each end keeps its time, or uses
 * `defaultFromTime` / `defaultToTime`.
 *
 * @example
 * ```tsx
 * <DateTimeRangePicker value={shift} onChange={setShift} minuteStep={15} />
 * ```
 */
export function DateTimeRangePicker({
  value,
  onChange,
  placeholder,
  format,
  parseFormats,
  allowTyping = true,
  onInvalidInput,
  clearable,
  disabled,
  presets,
  align,
  className,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  onBlur,
  ref,
  disabledDays,
  numberOfMonths = 2,
  hourCycle,
  showSeconds = false,
  minuteStep,
  defaultFromTime = MIDNIGHT,
  defaultToTime,
  min,
  max,
  fromDate,
  toDate,
  ...calendarOptions
}: DateTimeRangePickerProps): JSX.Element {
  const pattern = format ?? defaultDateTimeFormat(hourCycle, showSeconds);
  const lastMinute: Time = showSeconds
    ? { hours: 23, minutes: 59, seconds: 59 }
    : { hours: 23, minutes: 59 };
  const endTime = defaultToTime ?? lastMinute;
  const [range, setRange] = useControlledValue<DateRange>(value, onChange);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => range?.from ?? new Date());
  const fromRef = useRef<HTMLInputElement | null>(null);
  const { locale } = calendarOptions;
  const options = locale ? { locale } : {};

  const firstDay = laterOf(fromDate, min);
  const lastDay = earlierOf(toDate, max);

  // A cleared or half-typed time is shown in its time input without touching the value.
  const fromMs = range?.from?.getTime();
  const toMs = range?.to?.getTime();
  const [seen, setSeen] = useState({ fromMs, toMs });
  const [cleared, setCleared] = useState({ from: false, to: false });
  if (seen.fromMs !== fromMs || seen.toMs !== toMs) {
    setSeen({ fromMs, toMs });
    setCleared({ from: false, to: false });
  }

  function change(next: DateRange | undefined): void {
    setRange(next && (next.from || next.to) ? next : undefined);
    if (next?.from) setMonth(next.from);
  }

  function clamped(date: Date): Date {
    return clampDate(date, min, max);
  }

  function seconds(time: Time): Time {
    return showSeconds ? time : { hours: time.hours, minutes: time.minutes };
  }

  function selectRange(next: DateRange | undefined): void {
    if (!next?.from) {
      change(undefined);
      return;
    }
    const fromTime = range?.from ? seconds(toTime(range.from)) : defaultFromTime;
    const toTimeOfDay = range?.to ? seconds(toTime(range.to)) : endTime;
    const from = clamped(withTime(next.from, fromTime));
    let to = next.to ? clamped(withTime(next.to, toTimeOfDay)) : undefined;
    // Two days that are the same can leave the old times in the wrong order.
    if (to && to.getTime() < from.getTime()) to = from;
    change({ from, to });
  }

  function changeTime(end: 'from' | 'to', time: Time | null): void {
    if (!time) {
      setCleared((current) => ({ ...current, [end]: true }));
      return;
    }
    setCleared((current) => ({ ...current, [end]: false }));
    const day = range?.[end];
    if (!day) return;
    const next = clamped(withTime(day, time));
    change(end === 'from' ? { from: next, to: range?.to } : { from: range?.from, to: next });
  }

  const shown = (date: Date | undefined): string =>
    date ? formatDate(date, pattern, options) : '…';
  const hasValue = Boolean(range?.from || range?.to);
  const buttonText = hasValue
    ? `${shown(range?.from)} – ${shown(range?.to)}`
    : (placeholder ?? 'Pick a date and time range');

  const shared = {
    format: pattern,
    parseFormats,
    locale,
    fromDate: firstDay,
    toDate: lastDay,
    disabledDays,
    onInvalidInput,
    onOpenRequest: () => setOpen(true),
    onNavigate: setMonth,
    placeholder,
    disabled,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
  };
  const startNormalize = (parsed: Date, hasTime: boolean): Date =>
    hasTime ? parsed : withTime(parsed, defaultFromTime);
  const endNormalize = (parsed: Date, hasTime: boolean): Date =>
    hasTime ? parsed : withTime(parsed, endTime);
  const limits = (date: Date): 'out-of-range' | null =>
    (min && date.getTime() < min.getTime()) || (max && date.getTime() > max.getTime())
      ? 'out-of-range'
      : null;

  return (
    <PickerFrame
      open={open}
      onOpenChange={(next) => {
        if (next && range?.from) setMonth(range.from);
        setOpen(next);
      }}
      disabled={disabled}
      align={align}
      className={className}
      focusRef={fromRef}
      hasValue={hasValue}
      clearable={clearable}
      onClear={() => {
        change(undefined);
        fromRef.current?.focus();
      }}
      buttonId={id}
      buttonAriaInvalid={ariaInvalid === true || ariaInvalid === 'true'}
      buttonHasValue={hasValue}
      buttonText={buttonText}
      inputs={
        allowTyping ? (
          <>
            <DateTextInput
              {...shared}
              id={id}
              aria-label="Start date and time"
              ref={(element) => {
                fromRef.current = element;
                assignRef(ref, element);
              }}
              value={range?.from}
              onValueChange={(date) => change({ from: date, to: range?.to })}
              normalize={startNormalize}
              validate={(date) =>
                limits(date) ??
                (range?.to && date.getTime() > range.to.getTime() ? 'out-of-range' : null)
              }
              onBlur={onBlur}
            />
            <span aria-hidden="true" className="text-muted-foreground">
              –
            </span>
            <DateTextInput
              {...shared}
              aria-label="End date and time"
              value={range?.to}
              onValueChange={(date) => change({ from: range?.from, to: date })}
              normalize={endNormalize}
              validate={(date) =>
                limits(date) ??
                (range?.from && date.getTime() < range.from.getTime() ? 'out-of-range' : null)
              }
              onBlur={onBlur}
            />
          </>
        ) : null
      }
    >
      <div className="flex">
        {presets && presets.length > 0 ? (
          <div className="flex flex-col gap-1 border-r p-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  const preview = preset.range();
                  if (!preview.from) return;
                  change({
                    from: clamped(withTime(startOfDay(preview.from), defaultFromTime)),
                    to: preview.to ? clamped(withTime(startOfDay(preview.to), endTime)) : undefined,
                  });
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        ) : null}
        <div>
          <Calendar
            {...calendarOptions}
            mode="range"
            numberOfMonths={numberOfMonths}
            selected={range}
            onSelect={selectRange}
            month={month}
            onMonthChange={setMonth}
            {...(firstDay ? { fromDate: firstDay } : {})}
            {...(lastDay ? { toDate: lastDay } : {})}
            disabled={disabledDays}
          />
          <div className="grid grid-cols-2 gap-3 border-t p-3">
            <div className="grid gap-1.5">
              <span className="text-xs text-muted-foreground">From</span>
              <TimeInput
                aria-label="From time"
                value={cleared.from ? null : range?.from ? toTime(range.from) : null}
                onChange={(time) => changeTime('from', time)}
                hourCycle={hourCycle}
                showSeconds={showSeconds}
                minuteStep={minuteStep}
                min={timeBound(range?.from, [min], 'min')}
                max={timeBound(range?.from, [range?.to, max], 'max')}
                disabled={!range?.from}
              />
            </div>
            <div className="grid gap-1.5">
              <span className="text-xs text-muted-foreground">To</span>
              <TimeInput
                aria-label="To time"
                value={cleared.to ? null : range?.to ? toTime(range.to) : null}
                onChange={(time) => changeTime('to', time)}
                hourCycle={hourCycle}
                showSeconds={showSeconds}
                minuteStep={minuteStep}
                min={timeBound(range?.to, [range?.from, min], 'min')}
                max={timeBound(range?.to, [max], 'max')}
                disabled={!range?.to}
              />
            </div>
          </div>
        </div>
      </div>
    </PickerFrame>
  );
}
