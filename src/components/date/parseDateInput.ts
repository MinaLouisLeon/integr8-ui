import type { Locale } from 'date-fns';
import { differenceInCalendarDays, format as formatDate, isValid, parse } from 'date-fns';
import type { Matcher } from 'react-day-picker';

// Typed-input parsing shared by the date and date-time pickers (plain functions, no React).

/** Why typed text was not accepted. */
export type InvalidInputReason = 'unparseable' | 'disabled' | 'out-of-range';

/** Patterns tried after the display `format`: ISO date, then ISO date and time. */
export const DEFAULT_PARSE_FORMATS: readonly string[] = ['yyyy-MM-dd', 'yyyy-MM-dd HH:mm'];

/** Options for {@link parseDateInput}. */
export interface ParseDateInputOptions {
  /** The display pattern (date-fns), tried first. Example: `P` or `Pp`. */
  format: string;
  /** Patterns tried after `format`. Default: ISO `yyyy-MM-dd` and `yyyy-MM-dd HH:mm`. */
  parseFormats?: readonly string[] | undefined;
  /** date-fns locale for the patterns (default en-US). */
  locale?: Locale | undefined;
  /** Fills the parts the text leaves out (for example the year). Default: now. */
  referenceDate?: Date | undefined;
  /** Earliest accepted day. Earlier days are `'out-of-range'`. */
  fromDate?: Date | undefined;
  /** Latest accepted day. Later days are `'out-of-range'`. */
  toDate?: Date | undefined;
  /** Days that cannot be picked (the same matchers as the calendar's `disabled`). */
  disabled?: Matcher | Matcher[] | undefined;
}

/** What {@link parseDateInput} returns. */
export type ParseDateInputResult =
  | {
      ok: true;
      /** The parsed date (local time). */
      date: Date;
      /** The pattern that matched. */
      format: string;
      /** True when that pattern includes a time of day. */
      hasTime: boolean;
    }
  | { ok: false; reason: InvalidInputReason };

/** True when a date-fns pattern shows a time of day (hours, minutes, seconds or AM/PM). */
export function patternHasTime(pattern: string): boolean {
  // Text in quotes is literal, not a token.
  return /[hHKkmsabBp]/.test(pattern.replace(/'[^']*'/g, ''));
}

function isDayMatch(date: Date, matcher: Matcher): boolean {
  if (typeof matcher === 'boolean') return matcher;
  if (typeof matcher === 'function') return matcher(date);
  if (matcher instanceof Date) return differenceInCalendarDays(date, matcher) === 0;
  if (Array.isArray(matcher)) return matcher.some((day) => isDayMatch(date, day));
  if ('dayOfWeek' in matcher) {
    const days = matcher.dayOfWeek;
    return Array.isArray(days) ? days.includes(date.getDay()) : days === date.getDay();
  }
  if ('before' in matcher && 'after' in matcher) {
    return (
      differenceInCalendarDays(date, matcher.after) > 0 &&
      differenceInCalendarDays(date, matcher.before) < 0
    );
  }
  if ('before' in matcher) return differenceInCalendarDays(date, matcher.before) < 0;
  if ('after' in matcher) return differenceInCalendarDays(date, matcher.after) > 0;
  if ('from' in matcher || 'to' in matcher) {
    const { from, to } = matcher as { from?: Date | undefined; to?: Date | undefined };
    if (from && to) {
      return differenceInCalendarDays(date, from) >= 0 && differenceInCalendarDays(date, to) <= 0;
    }
    const only = from ?? to;
    return only ? differenceInCalendarDays(date, only) === 0 : false;
  }
  return false;
}

/** True when `date` (its day) is matched by any of the calendar `disabled` matchers. */
export function isDayDisabled(date: Date, disabled?: Matcher | Matcher[]): boolean {
  if (disabled === undefined) return false;
  // A list of days (`Date[]`) and a list of matchers give the same answer when read either way.
  const matchers: Matcher[] = Array.isArray(disabled) ? disabled : [disabled];
  return matchers.some((matcher) => isDayMatch(date, matcher));
}

/**
 * Turns typed text into a date. The text is parsed with `format`, then with each of
 * `parseFormats`; the first pattern that matches wins. Years below 1000 are rejected so a short
 * year such as `11/06/26` is not read as the year 26.
 *
 * Days before `fromDate` or after `toDate` fail with `'out-of-range'`; days matched by
 * `disabled` fail with `'disabled'`; text no pattern matches fails with `'unparseable'`.
 *
 * @example
 * ```ts
 * parseDateInput('11/06/2026', { format: 'P' }); // { ok: true, date: 6 Nov 2026, ... }
 * parseDateInput('2026-11-06', { format: 'P' }); // ISO works as a fallback
 * parseDateInput('soon', { format: 'P' }); // { ok: false, reason: 'unparseable' }
 * ```
 */
export function parseDateInput(text: string, options: ParseDateInputOptions): ParseDateInputResult {
  const trimmed = text.trim();
  if (trimmed === '') return { ok: false, reason: 'unparseable' };

  const reference = options.referenceDate ?? new Date();
  const patterns = [
    ...new Set([options.format, ...(options.parseFormats ?? DEFAULT_PARSE_FORMATS)]),
  ];

  for (const pattern of patterns) {
    let date: Date;
    try {
      date = parse(trimmed, pattern, reference, options.locale ? { locale: options.locale } : {});
    } catch {
      // An invalid pattern from the caller is the same as no match.
      continue;
    }
    if (!isValid(date) || date.getFullYear() < 1000) continue;

    if (options.fromDate && differenceInCalendarDays(date, options.fromDate) < 0) {
      return { ok: false, reason: 'out-of-range' };
    }
    if (options.toDate && differenceInCalendarDays(date, options.toDate) > 0) {
      return { ok: false, reason: 'out-of-range' };
    }
    if (isDayDisabled(date, options.disabled)) return { ok: false, reason: 'disabled' };
    return { ok: true, date, format: pattern, hasTime: patternHasTime(pattern) };
  }
  return { ok: false, reason: 'unparseable' };
}

/**
 * The hint shown in an empty input: the display pattern with digits replaced by letters, for
 * example `MM/DD/YYYY` for `P` in en-US, or `MM/DD/YYYY, hh:mm AM` for `Pp`.
 */
export function formatPlaceholder(pattern: string, locale?: Locale): string {
  // Every part gets its own number, so each can be told apart in the formatted text.
  const sample = new Date(2033, 10, 22, 10, 37, 49);
  const options = locale ? { locale } : {};
  const text = formatDate(sample, pattern, options);
  const meridiem = formatDate(sample, 'a', options);
  const twelveHour = meridiem !== '' && text.includes(meridiem);
  const letters: Record<string, string> = {
    '2033': 'YYYY',
    '11': 'MM',
    '22': 'DD',
    '10': twelveHour ? 'hh' : 'HH',
    '37': 'mm',
    '49': 'ss',
  };
  return text.replace(/\d+/g, (digits) => letters[digits] ?? digits);
}
