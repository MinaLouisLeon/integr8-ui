'use client';

import { ClockIcon } from 'lucide-react';
import { type JSX, type KeyboardEvent, type Ref, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { PickerFrame, useControlledValue } from './dateInputShared';
import { TimeInput, type TimeInputProps } from './TimeInput';
import type { Time } from './time';
import { localeHourCycle, TimeLists } from './timeLists';

/**
 * Props for {@link TimePicker}: the {@link TimeInput} props plus the options below. The time
 * input is the typed field; the popover lists hours, minutes, seconds and AM/PM to click.
 */
export interface TimePickerProps extends Omit<TimeInputProps, 'ref' | 'children' | 'onKeyDown'> {
  /** Where the popover sits against the picker. Default `start`. */
  align?: 'start' | 'center' | 'end' | undefined;
  /** Show a button that clears the time. */
  clearable?: boolean | undefined;
  /** Ref of the group element that holds the segments. */
  ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * A time input with a clock button that opens a popover with lists of hours, minutes, seconds
 * (with `showSeconds`) and AM/PM (in 12-hour mode). The segments work as in {@link TimeInput};
 * Alt+ArrowDown opens the popover. A time outside `min` and `max` is moved to the nearest one.
 *
 * @example
 * ```tsx
 * <TimePicker value={time} onChange={setTime} hourCycle={24} minuteStep={15} />
 * ```
 */
export function TimePicker({
  value,
  onChange,
  hourCycle,
  showSeconds = false,
  minuteStep = 1,
  min,
  max,
  disabled,
  align,
  clearable,
  className,
  ref,
  ...rest
}: TimePickerProps): JSX.Element {
  const cycle = hourCycle ?? localeHourCycle();
  const [time, setTime] = useControlledValue<Time>(value, (next) => onChange?.(next ?? null));
  const [open, setOpen] = useState(false);
  const focusRef = useRef<HTMLInputElement | null>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <PickerFrame
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
      align={align}
      className="w-fit"
      focusRef={focusRef}
      hasValue={time !== undefined}
      clearable={clearable}
      onClear={() => {
        setTime(undefined);
        focusRef.current?.focus();
      }}
      icon={<ClockIcon aria-hidden="true" />}
      triggerLabel="Open time list"
      inputs={
        <TimeInput
          {...rest}
          ref={(element) => {
            focusRef.current = element?.querySelector('input') ?? null;
            if (typeof ref === 'function') ref(element);
            else if (ref) (ref as { current: HTMLDivElement | null }).current = element;
          }}
          value={time ?? null}
          onChange={(next) => setTime(next ?? undefined)}
          onKeyDown={handleKeyDown}
          hourCycle={cycle}
          showSeconds={showSeconds}
          minuteStep={minuteStep}
          min={min}
          max={max}
          disabled={disabled}
          className={cn(
            'h-full border-0 bg-transparent px-0 shadow-none focus-within:border-transparent focus-within:ring-0 dark:bg-transparent',
            className,
          )}
        />
      }
    >
      <TimeLists
        value={time}
        onChange={setTime}
        hourCycle={cycle}
        showSeconds={showSeconds}
        minuteStep={minuteStep}
        min={min}
        max={max}
      />
    </PickerFrame>
  );
}
