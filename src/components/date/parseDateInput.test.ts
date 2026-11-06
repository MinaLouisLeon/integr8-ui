import { de } from 'date-fns/locale';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PARSE_FORMATS,
  formatPlaceholder,
  isDayDisabled,
  parseDateInput,
  patternHasTime,
} from './parseDateInput';

const reference = new Date(2026, 10, 6, 12);

/** The parsed date of a successful result. */
function parsed(text: string, options: Parameters<typeof parseDateInput>[1]): Date {
  const result = parseDateInput(text, options);
  if (!result.ok) throw new Error(`expected "${text}" to parse, got ${result.reason}`);
  return result.date;
}

describe('parseDateInput', () => {
  it('parses the display format', () => {
    const result = parseDateInput('11/06/2026', { format: 'P', referenceDate: reference });

    expect(result).toMatchObject({ ok: true, format: 'P', hasTime: false });
    expect(parsed('11/06/2026', { format: 'P' })).toEqual(new Date(2026, 10, 6));
  });

  it('accepts surrounding spaces and a day or month without a leading zero', () => {
    expect(parsed('  1/5/2026  ', { format: 'P' })).toEqual(new Date(2026, 0, 5));
  });

  it('falls back to the ISO date and the ISO date-time', () => {
    expect(parsed('2026-11-06', { format: 'P' })).toEqual(new Date(2026, 10, 6));
    expect(parsed('2026-11-06 15:30', { format: 'P' })).toEqual(new Date(2026, 10, 6, 15, 30));
    expect(DEFAULT_PARSE_FORMATS).toEqual(['yyyy-MM-dd', 'yyyy-MM-dd HH:mm']);
  });

  it('reports which pattern matched and whether it has a time', () => {
    expect(parseDateInput('2026-11-06 15:30', { format: 'Pp' })).toMatchObject({
      ok: true,
      format: 'yyyy-MM-dd HH:mm',
      hasTime: true,
    });
    expect(parseDateInput('2026-11-06', { format: 'Pp' })).toMatchObject({
      ok: true,
      format: 'yyyy-MM-dd',
      hasTime: false,
    });
  });

  it('parses a date-time in the display format', () => {
    expect(parsed('11/06/2026, 3:30 PM', { format: 'Pp' })).toEqual(new Date(2026, 10, 6, 15, 30));
  });

  it('uses only the given fallback patterns', () => {
    const options = { format: 'P', parseFormats: ['dd.MM.yyyy'] };

    expect(parsed('06.11.2026', options)).toEqual(new Date(2026, 10, 6));
    expect(parseDateInput('2026-11-06', options)).toEqual({ ok: false, reason: 'unparseable' });
  });

  it('follows the locale', () => {
    expect(parsed('06.11.2026', { format: 'P', locale: de })).toEqual(new Date(2026, 10, 6));
    expect(parseDateInput('11/06/2026', { format: 'P', locale: de })).toEqual({
      ok: false,
      reason: 'unparseable',
    });
  });

  it('fills missing parts from the reference date', () => {
    const date = parsed('11/06', { format: 'MM/dd', referenceDate: new Date(2030, 0, 1) });

    expect(date).toEqual(new Date(2030, 10, 6));
  });

  it.each([
    ['empty text', ''],
    ['spaces only', '   '],
    ['words', 'soon'],
    ['a day that does not exist', '11/31/2026'],
    ['a month that does not exist', '13/01/2026'],
    ['a short year', '11/06/26'],
    ['extra text', '11/06/2026 and more'],
  ])('rejects %s as unparseable', (_name, text) => {
    expect(parseDateInput(text, { format: 'P', referenceDate: reference })).toEqual({
      ok: false,
      reason: 'unparseable',
    });
  });

  it('ignores an invalid pattern from the caller', () => {
    const result = parseDateInput('2026-11-06', {
      format: 'P',
      parseFormats: ['qqqqqqq!', 'yyyy-MM-dd'],
    });

    expect(result.ok).toBe(true);
  });

  it('rejects days before fromDate and after toDate as out-of-range', () => {
    const limits = {
      format: 'P',
      fromDate: new Date(2026, 10, 10),
      toDate: new Date(2026, 10, 20),
    };

    expect(parseDateInput('11/09/2026', limits)).toEqual({ ok: false, reason: 'out-of-range' });
    expect(parseDateInput('11/21/2026', limits)).toEqual({ ok: false, reason: 'out-of-range' });
    expect(parseDateInput('11/10/2026', limits).ok).toBe(true);
    expect(parseDateInput('11/20/2026', limits).ok).toBe(true);
  });

  it('compares days, not times, with the limits', () => {
    const result = parseDateInput('11/10/2026, 8:00 AM', {
      format: 'Pp',
      fromDate: new Date(2026, 10, 10, 18),
    });

    expect(result.ok).toBe(true);
  });

  it('rejects disabled days', () => {
    const weekend = { dayOfWeek: [0, 6] };

    expect(parseDateInput('11/07/2026', { format: 'P', disabled: weekend })).toEqual({
      ok: false,
      reason: 'disabled',
    });
    expect(parseDateInput('11/06/2026', { format: 'P', disabled: weekend }).ok).toBe(true);
    expect(
      parseDateInput('11/06/2026', { format: 'P', disabled: [new Date(2026, 10, 6)] }),
    ).toEqual({ ok: false, reason: 'disabled' });
  });

  it('reports out-of-range before disabled', () => {
    const result = parseDateInput('11/07/2026', {
      format: 'P',
      fromDate: new Date(2026, 10, 10),
      disabled: { dayOfWeek: [6] },
    });

    expect(result).toEqual({ ok: false, reason: 'out-of-range' });
  });
});

describe('isDayDisabled', () => {
  const day = new Date(2026, 10, 6);

  it('is false without matchers', () => {
    expect(isDayDisabled(day)).toBe(false);
  });

  it('reads every kind of matcher', () => {
    expect(isDayDisabled(day, true)).toBe(true);
    expect(isDayDisabled(day, false)).toBe(false);
    expect(isDayDisabled(day, (date) => date.getDate() === 6)).toBe(true);
    expect(isDayDisabled(day, new Date(2026, 10, 6, 23))).toBe(true);
    expect(isDayDisabled(day, [new Date(2026, 10, 5), new Date(2026, 10, 6)])).toBe(true);
    expect(isDayDisabled(day, { dayOfWeek: [5] })).toBe(true);
    expect(isDayDisabled(day, { before: new Date(2026, 10, 7) })).toBe(true);
    expect(isDayDisabled(day, { before: new Date(2026, 10, 6) })).toBe(false);
    expect(isDayDisabled(day, { after: new Date(2026, 10, 5) })).toBe(true);
    expect(isDayDisabled(day, { after: new Date(2026, 10, 6) })).toBe(false);
    expect(
      isDayDisabled(day, { after: new Date(2026, 10, 1), before: new Date(2026, 10, 10) }),
    ).toBe(true);
    expect(isDayDisabled(day, { from: new Date(2026, 10, 6), to: new Date(2026, 10, 8) })).toBe(
      true,
    );
    expect(isDayDisabled(day, { from: new Date(2026, 10, 7), to: new Date(2026, 10, 8) })).toBe(
      false,
    );
    expect(isDayDisabled(day, { from: new Date(2026, 10, 6), to: undefined })).toBe(true);
    expect(isDayDisabled(day, { from: undefined, to: new Date(2026, 10, 7) })).toBe(false);
  });

  it('is true when any matcher in a list matches', () => {
    expect(isDayDisabled(day, [{ dayOfWeek: [0] }, { dayOfWeek: [5] }])).toBe(true);
    expect(isDayDisabled(day, [{ dayOfWeek: [0] }, { dayOfWeek: [1] }])).toBe(false);
  });
});

describe('patternHasTime', () => {
  it('finds hours, minutes, seconds and AM/PM', () => {
    expect(patternHasTime('Pp')).toBe(true);
    expect(patternHasTime('yyyy-MM-dd HH:mm')).toBe(true);
    expect(patternHasTime('hh:mm:ss a')).toBe(true);
  });

  it('is false for date-only patterns and ignores quoted text', () => {
    expect(patternHasTime('P')).toBe(false);
    expect(patternHasTime('yyyy-MM-dd')).toBe(false);
    expect(patternHasTime("dd MMMM yyyy 'at home'")).toBe(false);
  });
});

describe('formatPlaceholder', () => {
  it('shows the expected format', () => {
    expect(formatPlaceholder('P')).toBe('MM/DD/YYYY');
    expect(formatPlaceholder('Pp')).toBe('MM/DD/YYYY, hh:mm AM');
    expect(formatPlaceholder('yyyy-MM-dd HH:mm:ss')).toBe('YYYY-MM-DD HH:mm:ss');
  });

  it('follows the order of the locale', () => {
    expect(formatPlaceholder('P', de)).toBe('DD.MM.YYYY');
  });
});
