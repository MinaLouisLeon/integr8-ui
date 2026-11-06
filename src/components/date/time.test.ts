import { describe, expect, it } from 'vitest';
import { clampTime, isValidTime, TimeError, timeToSeconds, toTime, withTime } from './time';

describe('toTime', () => {
  it('reads the local time of day, with seconds', () => {
    expect(toTime(new Date(2026, 10, 6, 15, 30, 45, 500))).toEqual({
      hours: 15,
      minutes: 30,
      seconds: 45,
    });
  });

  it('reads midnight', () => {
    expect(toTime(new Date(2026, 0, 1))).toEqual({ hours: 0, minutes: 0, seconds: 0 });
  });

  it('throws INVALID_DATE for an invalid date', () => {
    expect(() => toTime(new Date('nope'))).toThrow(TimeError);
    try {
      toTime(new Date('nope'));
    } catch (error) {
      expect((error as TimeError).code).toBe('INVALID_DATE');
    }
  });
});

describe('withTime', () => {
  it('sets the time and keeps the day', () => {
    const result = withTime(new Date(2026, 10, 6, 1, 2, 3, 4), { hours: 9, minutes: 15 });

    expect(result).toEqual(new Date(2026, 10, 6, 9, 15, 0, 0));
  });

  it('uses the seconds when given', () => {
    const result = withTime(new Date(2026, 10, 6), { hours: 23, minutes: 59, seconds: 59 });

    expect(result).toEqual(new Date(2026, 10, 6, 23, 59, 59, 0));
  });

  it('does not change the original date', () => {
    const original = new Date(2026, 10, 6, 1, 2, 3);
    withTime(original, { hours: 9, minutes: 15 });

    expect(original).toEqual(new Date(2026, 10, 6, 1, 2, 3));
  });

  it('throws INVALID_TIME for out-of-range or fractional values', () => {
    const day = new Date(2026, 10, 6);
    for (const time of [
      { hours: 24, minutes: 0 },
      { hours: -1, minutes: 0 },
      { hours: 1, minutes: 60 },
      { hours: 1, minutes: 1.5 },
      { hours: 1, minutes: 1, seconds: 60 },
    ]) {
      expect(() => withTime(day, time)).toThrow(TimeError);
    }
    try {
      withTime(day, { hours: 24, minutes: 0 });
    } catch (error) {
      expect((error as TimeError).code).toBe('INVALID_TIME');
    }
  });

  it('throws INVALID_DATE for an invalid date', () => {
    try {
      withTime(new Date('nope'), { hours: 1, minutes: 1 });
      expect.unreachable();
    } catch (error) {
      expect((error as TimeError).code).toBe('INVALID_DATE');
    }
  });

  it('round-trips with toTime', () => {
    const time = { hours: 7, minutes: 8, seconds: 9 };

    expect(toTime(withTime(new Date(2026, 5, 1), time))).toEqual(time);
  });
});

describe('isValidTime', () => {
  it('accepts the edges and rejects values outside them', () => {
    expect(isValidTime({ hours: 0, minutes: 0 })).toBe(true);
    expect(isValidTime({ hours: 23, minutes: 59, seconds: 59 })).toBe(true);
    expect(isValidTime({ hours: 24, minutes: 0 })).toBe(false);
    expect(isValidTime({ hours: 0, minutes: 0, seconds: -1 })).toBe(false);
    expect(isValidTime({ hours: Number.NaN, minutes: 0 })).toBe(false);
  });
});

describe('timeToSeconds and clampTime', () => {
  it('counts seconds since midnight', () => {
    expect(timeToSeconds({ hours: 1, minutes: 1 })).toBe(3660);
    expect(timeToSeconds({ hours: 0, minutes: 0, seconds: 5 })).toBe(5);
  });

  it('keeps a time in range as the same object', () => {
    const time = { hours: 10, minutes: 0 };

    expect(clampTime(time, { hours: 9, minutes: 0 }, { hours: 17, minutes: 0 })).toBe(time);
    expect(clampTime(time)).toBe(time);
  });

  it('moves a time to the bound it went past', () => {
    const min = { hours: 9, minutes: 0 };
    const max = { hours: 17, minutes: 30 };

    expect(clampTime({ hours: 8, minutes: 59, seconds: 59 }, min, max)).toBe(min);
    expect(clampTime({ hours: 17, minutes: 30, seconds: 1 }, min, max)).toBe(max);
  });
});
