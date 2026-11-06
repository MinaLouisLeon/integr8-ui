import { describe, expect, it } from 'vitest';
import {
  asDate,
  asRange,
  clampDate,
  defaultDateTimeFormat,
  earlierOf,
  invalidInputMessage,
  laterOf,
} from './dateInputShared';

describe('asDate and asRange', () => {
  it('accepts a valid Date and nothing else', () => {
    const date = new Date(2026, 10, 6);

    expect(asDate(date)).toBe(date);
    expect(asDate(new Date('nope'))).toBeNull();
    expect(asDate('2026-11-06')).toBeNull();
    expect(asDate(undefined)).toBeNull();
    expect(asDate(null)).toBeNull();
  });

  it('reads a range with one or both ends', () => {
    const from = new Date(2026, 10, 2);
    const to = new Date(2026, 10, 9);

    expect(asRange({ from, to })).toEqual({ from, to });
    expect(asRange({ from })).toEqual({ from, to: undefined });
    expect(asRange({ to })).toEqual({ from: undefined, to });
  });

  it('treats anything else as empty', () => {
    expect(asRange(undefined)).toBeNull();
    expect(asRange(null)).toBeNull();
    expect(asRange('x')).toBeNull();
    expect(asRange({})).toBeNull();
    expect(asRange({ from: 'x', to: new Date('nope') })).toBeNull();
  });
});

describe('date limits', () => {
  const early = new Date(2026, 10, 1);
  const late = new Date(2026, 10, 20);

  it('picks the later and the earlier of two optional dates', () => {
    expect(laterOf(early, late)).toBe(late);
    expect(laterOf(late, early)).toBe(late);
    expect(laterOf(early, undefined)).toBe(early);
    expect(laterOf(undefined, undefined)).toBeUndefined();
    expect(earlierOf(early, late)).toBe(early);
    expect(earlierOf(late, early)).toBe(early);
    expect(earlierOf(undefined, late)).toBe(late);
  });

  it('keeps a date between min and max', () => {
    const middle = new Date(2026, 10, 10);

    expect(clampDate(middle, early, late)).toBe(middle);
    expect(clampDate(new Date(2026, 9, 1), early, late)).toBe(early);
    expect(clampDate(new Date(2026, 11, 1), early, late)).toBe(late);
    expect(clampDate(middle)).toBe(middle);
  });
});

describe('defaultDateTimeFormat', () => {
  it('uses the locale time pattern unless an hour cycle is set', () => {
    expect(defaultDateTimeFormat()).toBe('Pp');
    expect(defaultDateTimeFormat(undefined, true)).toBe('Ppp');
    expect(defaultDateTimeFormat(24)).toBe('P, HH:mm');
    expect(defaultDateTimeFormat(24, true)).toBe('P, HH:mm:ss');
    expect(defaultDateTimeFormat(12)).toBe('P, hh:mm a');
    expect(defaultDateTimeFormat(12, true)).toBe('P, hh:mm:ss a');
  });
});

describe('invalidInputMessage', () => {
  it('words each reason', () => {
    expect(invalidInputMessage('unparseable', false)).toBe('Enter a valid date.');
    expect(invalidInputMessage('unparseable', true)).toBe('Enter a valid date and time.');
    expect(invalidInputMessage('disabled', false)).toBe('That date is not available.');
    expect(invalidInputMessage('out-of-range', true)).toBe('That date is out of range.');
  });
});
