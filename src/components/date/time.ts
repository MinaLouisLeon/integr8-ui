// Time of day type and helpers shared by TimeInput and the date-time pickers.

/** A time of day. `seconds` is left out when the time has no seconds. */
export interface Time {
  /** 0 to 23. */
  hours: number;
  /** 0 to 59. */
  minutes: number;
  /** 0 to 59. */
  seconds?: number | undefined;
}

/** Error codes thrown by the time helpers. */
export type TimeErrorCode = 'INVALID_DATE' | 'INVALID_TIME';

/** Thrown when a helper gets an invalid `Date` or a time that is out of range. */
export class TimeError extends Error {
  /** A stable code for the error. */
  readonly code: TimeErrorCode;
  constructor(code: TimeErrorCode, message: string) {
    super(message);
    this.name = 'TimeError';
    this.code = code;
  }
}

function isInRange(value: number, max: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= max;
}

/** True when `time` has whole-number hours (0-23), minutes (0-59) and, if set, seconds (0-59). */
export function isValidTime(time: Time): boolean {
  return (
    isInRange(time.hours, 23) &&
    isInRange(time.minutes, 59) &&
    (time.seconds === undefined || isInRange(time.seconds, 59))
  );
}

/**
 * The time of day of a date, in the local time zone. Seconds are always included;
 * milliseconds are dropped.
 *
 * @throws {TimeError} `INVALID_DATE` when `date` is an invalid `Date`.
 *
 * @example
 * ```ts
 * toTime(new Date(2026, 10, 6, 15, 30)); // { hours: 15, minutes: 30, seconds: 0 }
 * ```
 */
export function toTime(date: Date): Time {
  if (Number.isNaN(date.getTime())) {
    throw new TimeError('INVALID_DATE', 'toTime needs a valid Date.');
  }
  return { hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() };
}

/**
 * A copy of `date` (same day, local time zone) with the time of day set to `time`. Missing
 * seconds and the milliseconds become 0. The original date is not changed.
 *
 * @throws {TimeError} `INVALID_DATE` for an invalid `Date`; `INVALID_TIME` when `time` is out
 * of range or not made of whole numbers.
 *
 * @example
 * ```ts
 * withTime(new Date(2026, 10, 6), { hours: 9, minutes: 15 }); // 6 Nov 2026, 09:15:00
 * ```
 */
export function withTime(date: Date, time: Time): Date {
  if (Number.isNaN(date.getTime())) {
    throw new TimeError('INVALID_DATE', 'withTime needs a valid Date.');
  }
  if (!isValidTime(time)) {
    throw new TimeError(
      'INVALID_TIME',
      'withTime needs whole hours 0-23, minutes 0-59 and seconds 0-59.',
    );
  }
  const next = new Date(date.getTime());
  next.setHours(time.hours, time.minutes, time.seconds ?? 0, 0);
  return next;
}

/** Seconds since midnight. A missing `seconds` counts as 0. */
export function timeToSeconds(time: Time): number {
  return time.hours * 3600 + time.minutes * 60 + (time.seconds ?? 0);
}

/**
 * Keeps `time` between `min` and `max` (either can be left out). Returns the same object when
 * it is already in range, otherwise the bound it went past.
 */
export function clampTime(time: Time, min?: Time, max?: Time): Time {
  const seconds = timeToSeconds(time);
  if (min && seconds < timeToSeconds(min)) return min;
  if (max && seconds > timeToSeconds(max)) return max;
  return time;
}
