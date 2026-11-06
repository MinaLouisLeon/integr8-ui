'use client';

import { format as formatDate, startOfDay } from 'date-fns';
import { type JSX, type ReactNode, type Ref, useRef, useState } from 'react';
import { Calendar } from './Calendar';
import {
  assignRef,
  type CalendarOptions,
  DateTextInput,
  type InvalidInputHandler,
  PickerFrame,
  useControlledValue,
} from './dateInputShared';

/** Props for {@link DatePicker}: the options below plus all Calendar options. */
export interface DatePickerProps extends CalendarOptions {
  /** The date. `null` is empty; leave it out for an uncontrolled picker. */
  value?: Date | null | undefined;
  /** Called with a new date, or `undefined` when the date is cleared. */
  onChange?: ((value: Date | undefined) => void) | undefined;
  /** Hint in the empty input. Default: the format, such as `MM/DD/YYYY`. */
  placeholder?: string | undefined;
  /** Display pattern (date-fns). Default `P`: the locale's numeric short date. */
  format?: string | undefined;
  /** Patterns tried after `format` when parsing typed text. Default: ISO date and date-time. */
  parseFormats?: readonly string[] | undefined;
  /** Type the date in an input. Default `true`; `false` shows a button that opens the calendar. */
  allowTyping?: boolean | undefined;
  /** Called when typed text is not accepted. The value does not change. */
  onInvalidInput?: InvalidInputHandler | undefined;
  /** Show a button that clears the date. */
  clearable?: boolean | undefined;
  /** Turns the whole picker off. */
  disabled?: boolean | undefined;
  /** Where the popover sits against the picker. Default `start`. */
  align?: 'start' | 'center' | 'end' | undefined;
  /** Shown at the bottom of the popover, under the calendar. */
  footer?: ReactNode;
  className?: string | undefined;
  id?: string | undefined;
  name?: string | undefined;
  'aria-invalid'?: boolean | 'true' | 'false' | undefined;
  'aria-describedby'?: string | undefined;
  onBlur?: (() => void) | undefined;
  /** Ref of the text input (the button when `allowTyping` is `false`). */
  ref?: Ref<HTMLInputElement> | undefined;
}

/**
 * A date input you can type in, with a calendar button that opens a popover. Typed text is
 * parsed on blur or Enter; text that is not a date, or a day that is disabled or out of range,
 * is flagged with `aria-invalid` and never changes the value. Escape restores the last valid
 * text, Alt+ArrowDown opens the calendar, ArrowUp and ArrowDown move the date by a day (Shift: a
 * month).
 *
 * @example
 * ```tsx
 * <DatePicker value={due} onChange={setDue} clearable />
 * ```
 */
export function DatePicker({
  value,
  onChange,
  placeholder,
  format = 'P',
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
  ...calendarOptions
}: DatePickerProps): JSX.Element {
  const [date, setDate] = useControlledValue<Date>(value, onChange);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => date ?? new Date());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { locale, fromDate, toDate } = calendarOptions;
  const options = locale ? { locale } : {};

  function change(next: Date | undefined): void {
    setDate(next);
    if (next) setMonth(next);
  }

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
      buttonText={date ? formatDate(date, format, options) : (placeholder ?? 'Pick a date')}
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
            format={format}
            parseFormats={parseFormats}
            locale={locale}
            fromDate={fromDate}
            toDate={toDate}
            disabledDays={disabledDays}
            normalize={(parsed) => startOfDay(parsed)}
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
        onSelect={(next) => {
          // Clicking the chosen day again keeps it; use `clearable` to empty the picker.
          if (next) change(startOfDay(next));
          setOpen(false);
        }}
        month={month}
        onMonthChange={setMonth}
        disabled={disabledDays}
        footer={footer}
      />
    </PickerFrame>
  );
}
