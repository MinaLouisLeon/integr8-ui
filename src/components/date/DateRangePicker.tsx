'use client';

import { format as formatDate, startOfDay } from 'date-fns';
import { type JSX, type Ref, useRef, useState } from 'react';
import { Button } from '../basics/Button';
import { Calendar, type DateRange } from './Calendar';
import {
  assignRef,
  type CalendarOptions,
  DateTextInput,
  type InvalidInputHandler,
  PickerFrame,
  useControlledValue,
} from './dateInputShared';
import type { RangePreset } from './rangePresets';

/** Props for {@link DateRangePicker}: the options below plus all Calendar options. */
export interface DateRangePickerProps extends CalendarOptions {
  /** The range. `null` is empty; leave it out for an uncontrolled picker. */
  value?: DateRange | null | undefined;
  /** Called with the new range, or `undefined` when both ends are cleared. */
  onChange?: ((value: DateRange | undefined) => void) | undefined;
  /** Hint in the empty inputs. Default: the format, such as `MM/DD/YYYY`. */
  placeholder?: string | undefined;
  /** Display pattern (date-fns). Default `P`. */
  format?: string | undefined;
  /** Patterns tried after `format` when parsing typed text. Default: ISO date and date-time. */
  parseFormats?: readonly string[] | undefined;
  /** Type the dates in two inputs. Default `true`; `false` shows a button instead. */
  allowTyping?: boolean | undefined;
  /** Called when typed text is not accepted. The value does not change. */
  onInvalidInput?: InvalidInputHandler | undefined;
  /** Show a button that clears the range. */
  clearable?: boolean | undefined;
  /** Turns the whole picker off. */
  disabled?: boolean | undefined;
  /** Shortcuts shown next to the calendar. The built-in list is `rangePresets`. */
  presets?: readonly RangePreset[] | undefined;
  /** Where the popover sits against the picker. Default `start`. */
  align?: 'start' | 'center' | 'end' | undefined;
  className?: string | undefined;
  id?: string | undefined;
  'aria-invalid'?: boolean | 'true' | 'false' | undefined;
  'aria-describedby'?: string | undefined;
  onBlur?: (() => void) | undefined;
  /** Ref of the "from" input (the button when `allowTyping` is `false`). */
  ref?: Ref<HTMLInputElement> | undefined;
}

/**
 * Two date inputs (from, to) and a calendar button that opens a popover with two months and
 * optional presets. Typed text is checked like in {@link DatePicker}; a "to" earlier than the
 * "from" is invalid (`'out-of-range'`). The popover closes when the second day is picked.
 *
 * @example
 * ```tsx
 * <DateRangePicker value={range} onChange={setRange} presets={rangePresets} />
 * ```
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder,
  format = 'P',
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
  ...calendarOptions
}: DateRangePickerProps): JSX.Element {
  const [range, setRange] = useControlledValue<DateRange>(value, onChange);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => range?.from ?? new Date());
  const fromRef = useRef<HTMLInputElement | null>(null);
  // Days clicked in the calendar since the popover opened (0 or 1).
  const clicks = useRef(0);
  const { locale, fromDate, toDate } = calendarOptions;
  const options = locale ? { locale } : {};

  function change(next: DateRange | undefined): void {
    setRange(next && (next.from || next.to) ? next : undefined);
    if (next?.from) setMonth(next.from);
  }

  function selectRange(next: DateRange | undefined): void {
    if (!next?.from) {
      change(undefined);
      return;
    }
    const picked: DateRange = {
      from: startOfDay(next.from),
      to: next.to ? startOfDay(next.to) : undefined,
    };
    change(picked);
    // The second day picked since the popover opened finishes the pick.
    if (clicks.current === 0) {
      clicks.current = 1;
    } else {
      clicks.current = 0;
      if (picked.to) setOpen(false);
    }
  }

  const shown = (date: Date | undefined): string =>
    date ? formatDate(date, format, options) : '…';
  const hasValue = Boolean(range?.from || range?.to);
  const buttonText = hasValue
    ? `${shown(range?.from)} – ${shown(range?.to)}`
    : (placeholder ?? 'Pick a range');
  const shared = {
    onOpenRequest: () => setOpen(true),
    format,
    parseFormats,
    locale,
    fromDate,
    toDate,
    disabledDays,
    normalize: (parsed: Date) => startOfDay(parsed),
    onInvalidInput,
    onNavigate: setMonth,
    placeholder,
    disabled,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
  };

  return (
    <PickerFrame
      open={open}
      onOpenChange={(next) => {
        if (next && range?.from) setMonth(range.from);
        clicks.current = 0;
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
              aria-label="Start date"
              ref={(element) => {
                fromRef.current = element;
                assignRef(ref, element);
              }}
              value={range?.from}
              onValueChange={(date) => change({ from: date, to: range?.to })}
              validate={(date) =>
                range?.to && date.getTime() > range.to.getTime() ? 'out-of-range' : null
              }
              onBlur={onBlur}
            />
            <span aria-hidden="true" className="text-muted-foreground">
              –
            </span>
            <DateTextInput
              {...shared}
              aria-label="End date"
              value={range?.to}
              onValueChange={(date) => change({ from: range?.from, to: date })}
              validate={(date) =>
                range?.from && date.getTime() < range.from.getTime() ? 'out-of-range' : null
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
                    from: startOfDay(preview.from),
                    to: preview.to ? startOfDay(preview.to) : undefined,
                  });
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        ) : null}
        <Calendar
          {...calendarOptions}
          mode="range"
          numberOfMonths={numberOfMonths}
          selected={range}
          onSelect={selectRange}
          month={month}
          onMonthChange={setMonth}
          disabled={disabledDays}
        />
      </div>
    </PickerFrame>
  );
}
