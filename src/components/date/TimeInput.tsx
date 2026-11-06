'use client';

import {
  type ChangeEvent,
  type ComponentProps,
  type JSX,
  type KeyboardEvent,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/cn';
import { clampTime, type Time } from './time';

/** Props for {@link TimeInput}. Other props go to the outer `group` element. */
export interface TimeInputProps
  extends Omit<ComponentProps<'div'>, 'onChange' | 'children' | 'defaultValue' | 'role' | 'id'> {
  /** The time, or `null` for empty. Leave it out for an uncontrolled input. */
  value?: Time | null | undefined;
  /**
   * Called when the time changes: with a complete time, or with `null` when a segment is
   * cleared or not filled yet. `seconds` is only set when `showSeconds` is true.
   */
  onChange?: ((value: Time | null) => void) | undefined;
  /** 12-hour (with AM/PM) or 24-hour. Default: the browser locale's. */
  hourCycle?: 12 | 24 | undefined;
  /** Show a seconds segment. Default `false`. */
  showSeconds?: boolean | undefined;
  /** Minutes jump by this step with the arrow keys. Default `1`. */
  minuteStep?: number | undefined;
  /** Earliest time. A complete time before it is moved to it. */
  min?: Time | undefined;
  /** Latest time. A complete time after it is moved to it. */
  max?: Time | undefined;
  /** Disables every segment. */
  disabled?: boolean | undefined;
  /** Id of the first segment, so a `<label htmlFor>` points at the field. */
  id?: string | undefined;
}

type Period = 'AM' | 'PM';
type NumericKey = 'hour' | 'minute' | 'second';
type SegmentKey = NumericKey | 'period';

interface Draft {
  hour: number | null;
  minute: number | null;
  second: number | null;
  period: Period | null;
}

const EMPTY_DRAFT: Draft = { hour: null, minute: null, second: null, period: null };

const LABELS: Record<SegmentKey, string> = {
  hour: 'Hours',
  minute: 'Minutes',
  second: 'Seconds',
  period: 'AM/PM',
};

/** The hour cycle of the browser's locale. */
function localeHourCycle(): 12 | 24 {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hour12
      ? 12
      : 24;
  } catch {
    return 24;
  }
}

function rangeOf(key: NumericKey, cycle: 12 | 24): { min: number; max: number } {
  if (key === 'hour') return cycle === 12 ? { min: 1, max: 12 } : { min: 0, max: 23 };
  return { min: 0, max: 59 };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function fromTime(time: Time | null | undefined, cycle: 12 | 24): Draft {
  if (!time) return EMPTY_DRAFT;
  const base = { minute: time.minutes, second: time.seconds ?? 0 };
  if (cycle === 24) return { ...base, hour: time.hours, period: null };
  return {
    ...base,
    hour: time.hours % 12 === 0 ? 12 : time.hours % 12,
    period: time.hours >= 12 ? 'PM' : 'AM',
  };
}

/** The complete time of a draft, or `null` while a needed segment is empty. */
function toTimeValue(draft: Draft, cycle: 12 | 24, showSeconds: boolean): Time | null {
  if (draft.hour === null || draft.minute === null) return null;
  if (showSeconds && draft.second === null) return null;
  let hours = draft.hour;
  if (cycle === 12) {
    if (draft.period === null) return null;
    hours = (draft.hour % 12) + (draft.period === 'PM' ? 12 : 0);
  }
  return showSeconds
    ? { hours, minutes: draft.minute, seconds: draft.second ?? 0 }
    : { hours, minutes: draft.minute };
}

/** A copy of `draft` with one segment set (`null` clears it). */
function withSegment(draft: Draft, key: SegmentKey, value: number | null): Draft {
  if (key === 'period') return { ...draft, period: value === null ? null : draft.period };
  const copy: Draft = { ...draft };
  copy[key] = value;
  return copy;
}

function normalize(time: Time, showSeconds: boolean): Time {
  return showSeconds
    ? { hours: time.hours, minutes: time.minutes, seconds: time.seconds ?? 0 }
    : { hours: time.hours, minutes: time.minutes };
}

function timeKey(time: Time | null | undefined, showSeconds: boolean): string {
  if (!time) return '';
  return `${time.hours}:${time.minutes}:${showSeconds ? (time.seconds ?? 0) : 0}`;
}

/**
 * A time field made of segments: hours, minutes, optional seconds and AM/PM in 12-hour mode.
 * Type digits (focus moves on when a segment is full), use ArrowUp/ArrowDown to change a
 * segment (minutes jump by `minuteStep`), Backspace to clear it, ArrowLeft/ArrowRight to move
 * between segments, and `a` / `p` for AM/PM.
 *
 * @example
 * ```tsx
 * const [time, setTime] = useState<Time | null>(null);
 * <TimeInput value={time} onChange={setTime} hourCycle={24} />
 * ```
 */
export function TimeInput({
  value,
  onChange,
  hourCycle,
  showSeconds = false,
  minuteStep = 1,
  min,
  max,
  disabled,
  className,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  onBlur,
  ref,
  ...rest
}: TimeInputProps): JSX.Element {
  const cycle = hourCycle ?? localeHourCycle();
  const step = Number.isFinite(minuteStep) ? Math.max(1, Math.floor(minuteStep)) : 1;
  const controlled = value !== undefined;
  const valueKey = `${cycle}|${timeKey(value, showSeconds)}`;

  const [storedDraft, setDraft] = useState<Draft>(() => fromTime(value, cycle));
  const [synced, setSynced] = useState(valueKey);
  const [typing, setTyping] = useState<{ key: SegmentKey; text: string } | null>(null);
  const segmentRefs = useRef<(HTMLInputElement | null)[]>([]);

  // A value that did not come from this input replaces what is being edited.
  let draft = storedDraft;
  if (controlled && valueKey !== synced) {
    draft = fromTime(value, cycle);
    setDraft(draft);
    setSynced(valueKey);
  }

  const segments: SegmentKey[] = ['hour', 'minute'];
  if (showSeconds) segments.push('second');
  if (cycle === 12) segments.push('period');

  function commit(next: Draft, final: boolean): void {
    let nextDraft = next;
    let time = toTimeValue(next, cycle, showSeconds);
    if (time) {
      const clamped = clampTime(time, min, max);
      if (clamped !== time) {
        time = normalize(clamped, showSeconds);
        // While a digit is pending the typed text stays; the value sent out is already clamped.
        if (final) nextDraft = fromTime(time, cycle);
      }
    }
    setDraft(nextDraft);
    const key = `${cycle}|${timeKey(time, showSeconds)}`;
    if (key !== synced) {
      setSynced(key);
      onChange?.(time);
    }
  }

  function focusSegment(index: number): void {
    segmentRefs.current[index]?.focus();
  }

  function typeDigit(key: NumericKey, digit: number): void {
    const { min: lo, max: hi } = rangeOf(key, cycle);
    const previous = typing?.key === key ? typing.text : '';
    let text = previous + String(digit);
    let number = Number(text);
    if (previous !== '' && (number > hi || number < lo)) {
      // Two digits do not make a valid value: start again with this digit.
      text = String(digit);
      number = digit;
    }
    const done = text.length >= 2 || number * 10 > hi;
    const next = number >= lo && number <= hi ? withSegment(draft, key, number) : draft;
    if (done) {
      setTyping(null);
      commit(next, true);
      focusSegment(segments.indexOf(key) + 1);
    } else {
      setTyping({ key, text });
      commit(next, false);
    }
  }

  function stepSegment(key: SegmentKey, direction: 1 | -1): void {
    setTyping(null);
    if (key === 'period') {
      const next: Period = draft.period === 'AM' ? 'PM' : 'AM';
      commit({ ...draft, period: draft.period === null && direction < 0 ? 'PM' : next }, true);
      return;
    }
    const { min: lo, max: hi } = rangeOf(key, cycle);
    const size = key === 'minute' ? step : 1;
    const lastStep = Math.floor(hi / size) * size;
    const current = draft[key];
    let next: number;
    if (current === null) {
      next = direction > 0 ? lo : lastStep;
    } else if (direction > 0) {
      next = Math.floor(current / size) * size + size;
      if (next > hi) next = lo;
    } else {
      next = Math.ceil(current / size) * size - size;
      if (next < lo) next = lastStep;
    }
    commit(withSegment(draft, key, next), true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, key: SegmentKey, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        stepSegment(key, 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        stepSegment(key, -1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        focusSegment(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        focusSegment(index + 1);
        break;
      case 'Backspace':
      case 'Delete':
        event.preventDefault();
        setTyping(null);
        commit(withSegment(draft, key, null), true);
        break;
    }
  }

  // Typed characters arrive here (also from on-screen keyboards): only the last one counts.
  function handleChange(event: ChangeEvent<HTMLInputElement>, key: SegmentKey): void {
    const typed = event.target.value.slice(-1).toLowerCase();
    if (key === 'period') {
      if (typed === 'a' || typed === 'p') {
        setTyping(null);
        commit({ ...draft, period: typed === 'a' ? 'AM' : 'PM' }, true);
      }
      return;
    }
    if (typed >= '0' && typed <= '9') typeDigit(key, Number(typed));
  }

  function textOf(key: SegmentKey): string {
    if (typing?.key === key) return pad(Number(typing.text));
    if (key === 'period') return draft.period ?? '';
    const current = draft[key];
    return current === null ? '' : pad(current);
  }

  function ariaValues(key: SegmentKey): {
    min: number;
    max: number;
    now: number | undefined;
    text: string;
  } {
    if (key === 'period') {
      const now = draft.period === null ? undefined : draft.period === 'AM' ? 0 : 1;
      return { min: 0, max: 1, now: now, text: draft.period ?? 'Empty' };
    }
    const { min: lo, max: hi } = rangeOf(key, cycle);
    const current = draft[key];
    return {
      min: lo,
      max: hi,
      now: current ?? undefined,
      text: current === null ? 'Empty' : pad(current),
    };
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: a <fieldset> brings border, padding and min-width resets and a legend; this is a styled inline control.
    <div
      ref={ref}
      role="group"
      data-slot="time-input"
      onBlur={(event) => {
        // Only report a blur when focus leaves the whole input, not between segments.
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.(event);
      }}
      className={cn(
        'inline-flex h-9 w-fit items-center gap-0.5 rounded-md border border-input bg-transparent px-3 text-base shadow-xs transition-[color,box-shadow] md:text-sm dark:bg-input/30',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        'has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-destructive/20 dark:has-[input[aria-invalid=true]]:ring-destructive/40',
        'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
        className,
      )}
      {...rest}
    >
      {segments.map((key, index) => {
        const values = ariaValues(key);
        return (
          <span key={key} className="inline-flex items-center gap-0.5">
            {key === 'second' ? <span aria-hidden="true">:</span> : null}
            {key === 'minute' ? <span aria-hidden="true">:</span> : null}
            {key === 'period' ? <span aria-hidden="true">&nbsp;</span> : null}
            <input
              ref={(element) => {
                segmentRefs.current[index] = element;
              }}
              id={index === 0 ? id : undefined}
              type="text"
              role="spinbutton"
              inputMode={key === 'period' ? 'text' : 'numeric'}
              autoComplete="off"
              spellCheck={false}
              placeholder="––"
              aria-label={LABELS[key]}
              aria-valuemin={values.min}
              aria-valuemax={values.max}
              aria-valuenow={values.now}
              aria-valuetext={values.text}
              aria-invalid={ariaInvalid}
              aria-describedby={ariaDescribedBy}
              disabled={disabled}
              value={textOf(key)}
              onChange={(event) => handleChange(event, key)}
              onKeyDown={(event) => handleKeyDown(event, key, index)}
              onFocus={(event) => event.currentTarget.select()}
              onBlur={() => setTyping((current) => (current?.key === key ? null : current))}
              data-slot="time-input-segment"
              className={cn(
                'h-7 rounded-sm bg-transparent px-0.5 text-center font-mono tabular-nums caret-transparent outline-none',
                'placeholder:text-muted-foreground selection:bg-transparent',
                'focus:bg-accent focus:text-accent-foreground',
                'disabled:cursor-not-allowed',
                key === 'period' ? 'w-[3.2ch]' : 'w-[2.6ch]',
              )}
            />
          </span>
        );
      })}
    </div>
  );
}
