'use client';

import type { Locale } from 'date-fns';
// Parts shared by the date and date-time pickers: the typed text input, the frame with the
// calendar button and popover, and small helpers. Internal: not exported from the package.
import { addDays, addMonths, format as formatDate } from 'date-fns';
import { CalendarIcon, XIcon } from 'lucide-react';
import {
  type ComponentProps,
  type JSX,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  useId,
  useRef,
  useState,
} from 'react';
import type { Matcher } from 'react-day-picker';
import {
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
  useFormContext,
} from 'react-hook-form';
import { cn } from '../../lib/cn';
import { Button } from '../basics/Button';
import { Input } from '../basics/Input';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../basics/Popover';
import type { CalendarProps, DateRange } from './Calendar';
import {
  formatPlaceholder,
  type InvalidInputReason,
  type ParseDateInputOptions,
  parseDateInput,
} from './parseDateInput';

/** The Calendar options every picker passes through to its calendar. */
export type CalendarOptions = Pick<
  CalendarProps,
  | 'numberOfMonths'
  | 'captionLayout'
  | 'fromDate'
  | 'toDate'
  | 'startMonth'
  | 'endMonth'
  | 'weekStartsOn'
  | 'showWeekNumber'
  | 'showOutsideDays'
  | 'timeZone'
> & {
  /** A date-fns locale (for example `de` from `date-fns/locale`). Default en-US. */
  locale?: Locale | undefined;
  /**
   * Days that cannot be picked or typed: dates, ranges, weekdays or functions (the calendar's
   * own `disabled` matchers). `disabled` itself turns the whole picker off.
   */
  disabledDays?: Matcher | Matcher[] | undefined;
};

/** Called when typed text is not accepted. The value did not change. */
export type InvalidInputHandler = (text: string, reason: InvalidInputReason) => void;

/** Sets a forwarded ref, whether it is a callback ref or a ref object. */
export function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/**
 * A value that is controlled when `value` is not `undefined` (`null` means empty) and kept
 * inside the component otherwise.
 */
export function useControlledValue<T>(
  value: T | null | undefined,
  onChange?: ((value: T | undefined) => void) | undefined,
): [T | undefined, (next: T | undefined) => void] {
  const [inner, setInner] = useState<T | undefined>(undefined);
  const controlled = value !== undefined;
  const current = controlled ? (value ?? undefined) : inner;
  return [
    current,
    (next) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
  ];
}

/** The message a form field shows for typed text that was not accepted. */
export function invalidInputMessage(reason: InvalidInputReason, withTime: boolean): string {
  if (reason === 'disabled') return 'That date is not available.';
  if (reason === 'out-of-range') return 'That date is out of range.';
  return withTime ? 'Enter a valid date and time.' : 'Enter a valid date.';
}

/** The stored value as a valid `Date`, or `null` when it is empty or not a date. */
export function asDate(value: unknown): Date | null {
  return value instanceof Date && !Number.isNaN(value.getTime()) ? value : null;
}

/** The stored value as a `DateRange`, or `null` when neither end is a valid date. */
export function asRange(value: unknown): DateRange | null {
  if (typeof value !== 'object' || value === null) return null;
  const { from, to } = value as { from?: unknown; to?: unknown };
  const start = asDate(from) ?? undefined;
  const end = asDate(to) ?? undefined;
  return start || end ? { from: start, to: end } : null;
}

/**
 * For the form fields: reports typed text that was not accepted as the field's error, and
 * clears that error again when the value changes. Outside a `<Form>` it only calls `extra`.
 */
export function useInvalidInputReporter<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  name: TName,
  withTime: boolean,
  extra?: InvalidInputHandler,
): { report: InvalidInputHandler; clear: () => void } {
  const form = useFormContext<TFieldValues>() as UseFormReturn<TFieldValues> | null;
  return {
    report: (text, reason) => {
      form?.setError(name, {
        type: 'invalidInput',
        message: invalidInputMessage(reason, withTime),
      });
      extra?.(text, reason);
    },
    clear: () => form?.clearErrors(name),
  };
}

/**
 * The default display pattern of the date-time pickers: `Pp` (locale short date and time, for
 * example `11/06/2026, 3:30 PM`), or a fixed 12 or 24-hour pattern when `hourCycle` is set.
 * `showSeconds` adds the seconds.
 */
export function defaultDateTimeFormat(hourCycle?: 12 | 24, showSeconds?: boolean): string {
  if (hourCycle === 24) return showSeconds ? 'P, HH:mm:ss' : 'P, HH:mm';
  if (hourCycle === 12) return showSeconds ? 'P, hh:mm:ss a' : 'P, hh:mm a';
  return showSeconds ? 'Ppp' : 'Pp';
}

/** The later of two optional dates. */
export function laterOf(a?: Date, b?: Date): Date | undefined {
  if (!a || !b) return a ?? b;
  return a.getTime() >= b.getTime() ? a : b;
}

/** The earlier of two optional dates. */
export function earlierOf(a?: Date, b?: Date): Date | undefined {
  if (!a || !b) return a ?? b;
  return a.getTime() <= b.getTime() ? a : b;
}

/** Keeps `date` between `min` and `max` (either can be left out). */
export function clampDate(date: Date, min?: Date, max?: Date): Date {
  if (min && date.getTime() < min.getTime()) return min;
  if (max && date.getTime() > max.getTime()) return max;
  return date;
}

/** Props for {@link DateTextInput}. Other props go to the `<input>`. */
export interface DateTextInputProps
  extends Omit<
    ComponentProps<'input'>,
    'value' | 'defaultValue' | 'onChange' | 'type' | 'onInvalid' | 'disabled'
  > {
  /** The committed date. */
  value: Date | undefined;
  /** Called with a new valid date, or `undefined` when the text is emptied. */
  onValueChange: (date: Date | undefined) => void;
  /** Display pattern (date-fns). */
  format: string;
  parseFormats?: readonly string[] | undefined;
  locale?: Locale | undefined;
  fromDate?: Date | undefined;
  toDate?: Date | undefined;
  disabledDays?: Matcher | Matcher[] | undefined;
  /** Adjusts a parsed date before it is checked (for example adds a default time). */
  normalize?: ((date: Date, hasTime: boolean) => Date) | undefined;
  /** Extra check after parsing (min and max, order of a range). */
  validate?: ((date: Date) => InvalidInputReason | null) | undefined;
  onInvalidInput?: InvalidInputHandler | undefined;
  /** Alt+ArrowDown was pressed. */
  onOpenRequest?: (() => void) | undefined;
  /** A valid date was typed: show its month in the calendar. */
  onNavigate?: ((date: Date) => void) | undefined;
  disabled?: boolean | undefined;
}

interface TextState {
  key: string;
  text: string;
  invalid: boolean;
}

/**
 * A text input for one date or date-time. It parses on blur or Enter, shows the formatted value,
 * flags invalid text with `aria-invalid` without changing the value, restores the last valid
 * text on Escape and moves the date with ArrowUp and ArrowDown (Shift: one month).
 */
export function DateTextInput({
  value,
  onValueChange,
  format,
  parseFormats,
  locale,
  fromDate,
  toDate,
  disabledDays,
  normalize,
  validate,
  onInvalidInput,
  onOpenRequest,
  onNavigate,
  placeholder,
  className,
  disabled,
  onBlur,
  onKeyDown,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: DateTextInputProps): JSX.Element {
  const hintId = useId();
  const options = locale ? { locale } : {};
  const textOf = (date: Date | undefined): string =>
    date ? formatDate(date, format, options) : '';
  const key = `${value?.getTime() ?? ''}|${format}`;

  const [stored, setStored] = useState<TextState>(() => ({
    key,
    text: textOf(value),
    invalid: false,
  }));
  // A value that did not come from this input replaces the text and clears the flag.
  let state = stored;
  if (stored.key !== key) {
    state = { key, text: textOf(value), invalid: false };
    setStored(state);
  }

  const validText = textOf(value);
  const dirty = state.text !== validText;
  const hint = placeholder ?? formatPlaceholder(format, locale);

  function commit(text: string): void {
    if (text.trim() === '') {
      setStored({ key: state.key, text: '', invalid: false });
      if (value) onValueChange(undefined);
      return;
    }
    const parseOptions: ParseDateInputOptions = {
      format,
      parseFormats,
      locale,
      referenceDate: value ?? new Date(),
      fromDate,
      toDate,
      disabled: disabledDays,
    };
    const result = parseDateInput(text, parseOptions);
    let failure: InvalidInputReason | null = result.ok ? null : result.reason;
    let date: Date | undefined;
    if (result.ok) {
      date = normalize ? normalize(result.date, result.hasTime) : result.date;
      failure = validate?.(date) ?? null;
    }
    if (failure !== null || !date) {
      setStored({ ...state, text, invalid: true });
      onInvalidInput?.(text, failure ?? 'unparseable');
      return;
    }
    setStored({ key: state.key, text: textOf(date), invalid: false });
    if (!value || value.getTime() !== date.getTime()) onValueChange(date);
    onNavigate?.(date);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      onOpenRequest?.();
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === 'Enter') {
      // Enter on untouched text still submits the surrounding form.
      if (dirty) {
        event.preventDefault();
        commit(state.text);
      }
    } else if (event.key === 'Escape') {
      if (dirty || state.invalid) {
        event.preventDefault();
        event.stopPropagation();
        setStored({ key: state.key, text: validText, invalid: false });
      }
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const parsed = dirty
        ? parseDateInput(state.text, { format, parseFormats, locale, referenceDate: value })
        : null;
      const base = parsed?.ok ? parsed.date : value;
      if (!base) return;
      event.preventDefault();
      const step = event.key === 'ArrowUp' ? 1 : -1;
      commit(textOf(event.shiftKey ? addMonths(base, step) : addDays(base, step)));
    }
  }

  return (
    <>
      <Input
        {...rest}
        type="text"
        autoComplete="off"
        spellCheck={false}
        data-slot="date-text-input"
        value={state.text}
        placeholder={hint}
        disabled={disabled}
        aria-invalid={state.invalid ? true : ariaInvalid}
        aria-describedby={[ariaDescribedBy, hintId].filter(Boolean).join(' ')}
        onChange={(event) => setStored({ ...state, text: event.target.value, invalid: false })}
        onBlur={(event) => {
          if (dirty) commit(state.text);
          onBlur?.(event);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          // The frame draws the border and focus ring; the input inside stays flat.
          'h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent',
          className,
        )}
      />
      <span id={hintId} className="sr-only">
        {`Format: ${hint}`}
      </span>
    </>
  );
}

/** Props for {@link PickerFrame}. */
export interface PickerFrameProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean | undefined;
  align?: 'start' | 'center' | 'end' | undefined;
  className?: string | undefined;
  /** The typed inputs. `null` shows a button that opens the popover instead. */
  inputs: ReactNode | null;
  /** Text of the button when there are no inputs. */
  buttonText?: ReactNode;
  /** True when the button shows a value (not the placeholder). */
  buttonHasValue?: boolean | undefined;
  buttonId?: string | undefined;
  buttonAriaInvalid?: boolean | undefined;
  hasValue: boolean;
  clearable?: boolean | undefined;
  onClear: () => void;
  /** The input that gets focus back when the popover closes. */
  focusRef: RefObject<HTMLInputElement | null>;
  /** What the popover shows. */
  children: ReactNode;
  onBlur?: (() => void) | undefined;
  /** Icon of the button that opens the popover. Default: a calendar. */
  icon?: ReactNode;
  /** Accessible name of that button. Default: "Open calendar". */
  triggerLabel?: string | undefined;
}

/**
 * The shared outer shape of the pickers: a bordered row with the inputs, an optional clear
 * button and the calendar button, and the popover anchored to it.
 */
export function PickerFrame({
  open,
  onOpenChange,
  disabled,
  align = 'start',
  className,
  inputs,
  buttonText,
  buttonHasValue,
  buttonId,
  buttonAriaInvalid,
  hasValue,
  clearable,
  onClear,
  focusRef,
  children,
  icon,
  triggerLabel = 'Open calendar',
}: PickerFrameProps): JSX.Element {
  const typing = inputs !== null;
  // Set when the popover closes because the user clicked or tabbed somewhere else. Focus then
  // belongs to that other element (maybe another picker that is opening), so it is not pulled back.
  const closedByOutside = useRef(false);
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) closedByOutside.current = false;
        onOpenChange(next);
      }}
    >
      <PopoverAnchor asChild>
        <div
          data-slot="date-picker"
          className={cn(
            'flex h-9 w-full items-center gap-1 rounded-md border border-input bg-transparent pr-1 pl-3 text-base shadow-xs transition-[color,box-shadow] md:text-sm dark:bg-input/30',
            'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
            'has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-destructive/20 dark:has-[input[aria-invalid=true]]:ring-destructive/40',
            'has-[button[aria-invalid=true]]:border-destructive',
            'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
            !typing && 'pl-1',
            className,
          )}
        >
          {typing ? (
            inputs
          ) : (
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                id={buttonId}
                disabled={disabled}
                aria-invalid={buttonAriaInvalid}
                className={cn(
                  'h-full min-w-0 flex-1 justify-start px-2 font-normal focus-visible:ring-1',
                  !buttonHasValue && 'text-muted-foreground',
                )}
              >
                <CalendarIcon aria-hidden="true" />
                <span className="truncate">{buttonText}</span>
              </Button>
            </PopoverTrigger>
          )}
          {clearable && hasValue && !disabled ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Clear"
              className="size-7 shrink-0"
              onClick={onClear}
            >
              <XIcon aria-hidden="true" />
            </Button>
          ) : null}
          {typing ? (
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={triggerLabel}
                disabled={disabled}
                className="size-7 shrink-0"
              >
                {icon ?? <CalendarIcon aria-hidden="true" />}
              </Button>
            </PopoverTrigger>
          ) : null}
        </div>
      </PopoverAnchor>
      <PopoverContent
        align={align}
        className="w-auto p-0"
        onInteractOutside={() => {
          closedByOutside.current = true;
        }}
        onCloseAutoFocus={(event) => {
          if (closedByOutside.current) {
            event.preventDefault();
            return;
          }
          // Focus goes back to the input, not to the small calendar button.
          if (typing && focusRef.current) {
            event.preventDefault();
            focusRef.current.focus();
          }
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
