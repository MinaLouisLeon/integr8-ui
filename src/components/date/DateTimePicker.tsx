'use client';

import { format as formatDate, isSameDay } from 'date-fns';
import { type JSX, useRef, useState } from 'react';
import { Button } from '../basics/Button';
import { Calendar } from './Calendar';
import type { DatePickerProps } from './DatePicker';
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
import { TimePicker } from './TimePicker';
import { type Time, toTime, withTime } from './time';

/**
 * Props for {@link DateTimePicker}: the {@link DatePicker} props (the default `format` is `Pp`,
 * or a fixed pattern when `hourCycle` is set) plus the time options below.
 */
export interface DateTimePickerProps extends DatePickerProps {
  /** 12-hour (with AM/PM) or 24-hour. Default: the locale's. */
  hourCycle?: 12 | 24 | undefined;
  /** Show and edit seconds. Default `false`. */
  showSeconds?: boolean | undefined;
  /** Minutes jump by this step with the arrow keys in the time input. Default `1`. */
  minuteStep?: number | undefined;
  /** Time used when only a date is picked or typed. Default 00:00. */
  defaultTime?: Time | undefined;
  /** Earliest date and time. */
  min?: Date | undefined;
  /** Latest date and time. */
  max?: Date | undefined;
  /**
   * Use a `TimePicker` for the time in the popover: the time input plus a clock button that
   * opens lists of hours, minutes, seconds and AM/PM. Default `false` (the plain time input).
   */
  timePicker?: boolean | undefined;
}

const MIDNIGHT: Time = { hours: 0, minutes: 0 };

/**
 * A date-time input you can type in, with a popover that holds a calendar and a time input. The
 * text and the popover edit the same value. Picking a day keeps the current time (or uses
 * `defaultTime`); a "Now" button sets the current moment. Typed text is checked like in
 * {@link DatePicker}, and also against `min` and `max`.
 *
 * @example
 * ```tsx
 * <DateTimePicker value={meeting} onChange={setMeeting} minuteStep={15} />
 * ```
 */
export function DateTimePicker({
  value,
  onChange,
  placeholder,
  format,
  parseFormats,
  allowTyping = true,
  onInvalidInput,
  clearable,
  disabled,
  align,
  footer,
  className,
  id,
  name,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  onBlur,
  ref,
  disabledDays,
  hourCycle,
  showSeconds = false,
  minuteStep,
  defaultTime = MIDNIGHT,
  timePicker = false,
  min,
  max,
  fromDate,
  toDate,
  ...calendarOptions
}: DateTimePickerProps): JSX.Element {
  const pattern = format ?? defaultDateTimeFormat(hourCycle, showSeconds);
  const [date, setDate] = useControlledValue<Date>(value, onChange);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => date ?? new Date());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { locale } = calendarOptions;
  const options = locale ? { locale } : {};

  // The calendar and the parser limit days; `validate` and the time input limit the time.
  const firstDay = laterOf(fromDate, min);
  const lastDay = earlierOf(toDate, max);

  // A cleared or half-typed time is shown in the time input without touching the value.
  const dateMs = date?.getTime();
  const [seenMs, setSeenMs] = useState(dateMs);
  const [timeCleared, setTimeCleared] = useState(false);
  const [draftTime, setDraftTime] = useState<Time | null>(null);
  if (seenMs !== dateMs) {
    setSeenMs(dateMs);
    setTimeCleared(false);
  }

  function change(next: Date | undefined): void {
    setDate(next);
    if (next) setMonth(next);
  }

  function withDefaultSeconds(time: Time): Time {
    return showSeconds ? time : { hours: time.hours, minutes: time.minutes };
  }

  function pickDay(day: Date | undefined): void {
    if (!day) return;
    // The time set before any day was picked comes first, then the default time.
    const time = date ? withDefaultSeconds(toTime(date)) : (draftTime ?? defaultTime);
    setDraftTime(null);
    change(clampDate(withTime(day, time), min, max));
  }

  function changeTime(time: Time | null): void {
    if (!time) {
      setTimeCleared(true);
      return;
    }
    setTimeCleared(false);
    // With no day yet the time waits here and is used for the first day picked.
    if (date) change(clampDate(withTime(date, time), min, max));
    else setDraftTime(time);
  }

  function now(): void {
    const current = new Date();
    if (!showSeconds) current.setSeconds(0, 0);
    change(clampDate(current, min, max));
  }

  function validate(parsed: Date): 'out-of-range' | null {
    if (min && parsed.getTime() < min.getTime()) return 'out-of-range';
    if (max && parsed.getTime() > max.getTime()) return 'out-of-range';
    return null;
  }

  const buttonText = date
    ? formatDate(date, pattern, options)
    : (placeholder ?? 'Pick a date and time');
  const timeMin = date && min && isSameDay(date, min) ? toTime(min) : undefined;
  const timeMax = date && max && isSameDay(date, max) ? toTime(max) : undefined;
  // With `timePicker` the time row is a TimePicker: the same input plus a clock button that
  // opens the lists. Without it, the plain TimeInput.
  const timeProps = {
    'aria-label': 'Time',
    value: timeCleared ? null : date ? toTime(date) : draftTime,
    onChange: changeTime,
    hourCycle,
    showSeconds,
    minuteStep,
    min: timeMin,
    max: timeMax,
    disabled,
  };

  return (
    <PickerFrame
      open={open}
      onOpenChange={(next) => {
        if (next && date) setMonth(date);
        setOpen(next);
      }}
      disabled={disabled}
      align={align}
      className={className}
      focusRef={inputRef}
      hasValue={date !== undefined}
      clearable={clearable}
      onClear={() => {
        change(undefined);
        inputRef.current?.focus();
      }}
      buttonId={id}
      buttonAriaInvalid={ariaInvalid === true || ariaInvalid === 'true'}
      buttonHasValue={date !== undefined}
      buttonText={buttonText}
      inputs={
        allowTyping ? (
          <DateTextInput
            id={id}
            name={name}
            ref={(element) => {
              inputRef.current = element;
              assignRef(ref, element);
            }}
            value={date}
            onValueChange={change}
            format={pattern}
            parseFormats={parseFormats}
            locale={locale}
            {...(firstDay ? { fromDate: firstDay } : {})}
            {...(lastDay ? { toDate: lastDay } : {})}
            disabledDays={disabledDays}
            normalize={(parsed, hasTime) => (hasTime ? parsed : withTime(parsed, defaultTime))}
            validate={validate}
            onInvalidInput={onInvalidInput}
            onOpenRequest={() => setOpen(true)}
            onNavigate={setMonth}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            onBlur={onBlur}
          />
        ) : null
      }
    >
      <Calendar
        {...calendarOptions}
        mode="single"
        selected={date}
        onSelect={pickDay}
        month={month}
        onMonthChange={setMonth}
        {...(firstDay ? { fromDate: firstDay } : {})}
        {...(lastDay ? { toDate: lastDay } : {})}
        disabled={disabledDays}
      />
      <div className="flex items-center justify-between gap-2 border-t p-3">
        {timePicker ? <TimePicker {...timeProps} align="start" /> : <TimeInput {...timeProps} />}
        <Button type="button" variant="outline" size="sm" onClick={now}>
          Now
        </Button>
      </div>
      {footer ? <div className="border-t p-3">{footer}</div> : null}
    </PickerFrame>
  );
}
