import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DateRange } from './Calendar';
import { DateTimeRangePicker, type DateTimeRangePickerProps } from './DateTimeRangePicker';
import { rangePresets } from './rangePresets';

// Fixed "today": Friday 6 November 2026, 12:00. Only Date is faked, so user-event keeps working.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 6, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

/** A picker that keeps the range in state, like a form would. */
function Controlled({
  initial,
  onChange,
  ...props
}: Omit<DateTimeRangePickerProps, 'value' | 'onChange'> & {
  initial?: DateRange;
  onChange: (value: DateRange | undefined) => void;
}) {
  const [value, setValue] = useState<DateRange | undefined>(initial);
  return (
    <DateTimeRangePicker
      {...props}
      value={value ?? null}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

const start = () =>
  screen.getByRole('textbox', { name: 'Start date and time' }) as HTMLInputElement;
const end = () => screen.getByRole('textbox', { name: 'End date and time' }) as HTMLInputElement;
const openCalendar = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Open calendar' }));

describe('DateTimeRangePicker', () => {
  it('shows both ends with their times', () => {
    render(
      <DateTimeRangePicker
        value={{ from: new Date(2026, 10, 2, 9, 0), to: new Date(2026, 10, 4, 17, 30) }}
      />,
    );

    expect(start().value).toBe('11/02/2026, 9:00 AM');
    expect(end().value).toBe('11/04/2026, 5:30 PM');
  });

  it('commits typed from and to date-times', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await user.type(start(), '11/02/2026, 9:00 AM{Enter}');
    await user.type(end(), '11/04/2026, 5:30 PM{Enter}');

    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 2, 9, 0),
      to: new Date(2026, 10, 4, 17, 30),
    });
  });

  it('flags a "to" earlier than the "from" on the same day', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onInvalidInput = vi.fn();
    render(
      <Controlled
        initial={{ from: new Date(2026, 10, 2, 9, 0), to: new Date(2026, 10, 2, 17, 0) }}
        onChange={onChange}
        onInvalidInput={onInvalidInput}
      />,
    );

    await user.clear(end());
    await user.type(end(), '11/02/2026, 8:00 AM{Enter}');

    expect(onInvalidInput).toHaveBeenCalledWith('11/02/2026, 8:00 AM', 'out-of-range');
    expect(end().getAttribute('aria-invalid')).toBe('true');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('flags a "from" later than the "to"', async () => {
    const user = userEvent.setup();
    const onInvalidInput = vi.fn();
    render(
      <Controlled
        initial={{ from: new Date(2026, 10, 2, 9, 0), to: new Date(2026, 10, 2, 17, 0) }}
        onChange={vi.fn()}
        onInvalidInput={onInvalidInput}
      />,
    );

    await user.clear(start());
    await user.type(start(), '11/02/2026, 5:01 PM{Enter}');

    expect(onInvalidInput).toHaveBeenCalledWith('11/02/2026, 5:01 PM', 'out-of-range');
  });

  it('accepts a "to" equal to the "from"', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        initial={{ from: new Date(2026, 10, 2, 9, 0), to: new Date(2026, 10, 2, 17, 0) }}
        onChange={onChange}
      />,
    );

    await user.clear(end());
    await user.type(end(), '11/02/2026, 9:00 AM{Enter}');

    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 2, 9, 0),
      to: new Date(2026, 10, 2, 9, 0),
    });
  });

  it('uses the default times when only dates are typed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await user.type(start(), '2026-11-02{Enter}');
    await user.type(end(), '2026-11-04{Enter}');

    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 2, 0, 0),
      to: new Date(2026, 10, 4, 23, 59),
    });
  });

  it('uses defaultFromTime and defaultToTime, and 23:59:59 with seconds', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { unmount } = render(
      <Controlled
        onChange={onChange}
        defaultFromTime={{ hours: 8, minutes: 30 }}
        defaultToTime={{ hours: 18, minutes: 15 }}
      />,
    );

    await user.type(start(), '2026-11-02{Enter}');
    await user.type(end(), '2026-11-04{Enter}');
    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 2, 8, 30),
      to: new Date(2026, 10, 4, 18, 15),
    });
    unmount();

    const onSeconds = vi.fn();
    render(<Controlled onChange={onSeconds} showSeconds />);
    await user.type(start(), '2026-11-02{Enter}');
    await user.type(end(), '2026-11-04{Enter}');
    expect(onSeconds).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 2, 0, 0, 0),
      to: new Date(2026, 10, 4, 23, 59, 59),
    });
  });

  it('rejects date-times outside min and max', async () => {
    const user = userEvent.setup();
    const onInvalidInput = vi.fn();
    render(
      <DateTimeRangePicker
        onInvalidInput={onInvalidInput}
        min={new Date(2026, 10, 2, 9, 0)}
        max={new Date(2026, 10, 10, 17, 0)}
      />,
    );

    await user.type(start(), '11/02/2026, 8:00 AM{Enter}');
    expect(onInvalidInput).toHaveBeenLastCalledWith('11/02/2026, 8:00 AM', 'out-of-range');

    await user.type(end(), '11/10/2026, 6:00 PM{Enter}');
    expect(onInvalidInput).toHaveBeenLastCalledWith('11/10/2026, 6:00 PM', 'out-of-range');
  });

  it('applies a preset with the default times', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} presets={rangePresets} />);

    await openCalendar(user);
    await user.click(screen.getByRole('button', { name: 'Last 7 days' }));

    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 9, 31, 0, 0),
      to: new Date(2026, 10, 6, 23, 59),
    });
    // The popover stays open so the times can be adjusted.
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('keeps each end time when days are picked in the calendar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        initial={{ from: new Date(2026, 10, 2, 9, 15), to: new Date(2026, 10, 4, 17, 45) }}
        onChange={onChange}
      />,
    );

    await openCalendar(user);
    await user.click(screen.getAllByText('10')[0] as HTMLElement);

    const last = onChange.mock.calls.at(-1)?.[0] as DateRange;
    expect(last.from?.getHours()).toBe(9);
    expect(last.from?.getMinutes()).toBe(15);
    expect(last.to?.getHours()).toBe(17);
    expect(last.to?.getMinutes()).toBe(45);
  });

  it('edits each end time in the popover', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        initial={{ from: new Date(2026, 10, 2, 9, 0), to: new Date(2026, 10, 4, 17, 0) }}
        onChange={onChange}
        hourCycle={24}
      />,
    );

    await openCalendar(user);
    const toTime = within(screen.getByRole('group', { name: 'To time' }));
    await user.click(toTime.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 2, 9, 0),
      to: new Date(2026, 10, 4, 18, 0),
    });

    const fromTime = within(screen.getByRole('group', { name: 'From time' }));
    await user.click(fromTime.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('{ArrowDown}');

    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 2, 8, 0),
      to: new Date(2026, 10, 4, 18, 0),
    });
  });

  it('does not let the times cross on a single day', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        initial={{ from: new Date(2026, 10, 2, 9, 0), to: new Date(2026, 10, 2, 10, 0) }}
        onChange={onChange}
        hourCycle={24}
      />,
    );

    await openCalendar(user);
    const fromTime = within(screen.getByRole('group', { name: 'From time' }));
    await user.click(fromTime.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');

    for (const call of onChange.mock.calls) {
      const range = call[0] as DateRange;
      expect((range.from as Date).getTime()).toBeLessThanOrEqual((range.to as Date).getTime());
    }
  });

  it('disables the time inputs for an end that is not set', async () => {
    const user = userEvent.setup();
    render(<DateTimeRangePicker value={{ from: new Date(2026, 10, 2, 9, 0), to: undefined }} />);

    await openCalendar(user);

    const toTime = within(screen.getByRole('group', { name: 'To time' }));
    expect((toTime.getByRole('spinbutton', { name: 'Hours' }) as HTMLInputElement).disabled).toBe(
      true,
    );
    const fromTime = within(screen.getByRole('group', { name: 'From time' }));
    expect((fromTime.getByRole('spinbutton', { name: 'Hours' }) as HTMLInputElement).disabled).toBe(
      false,
    );
  });

  it('shows two months', async () => {
    const user = userEvent.setup();
    render(<DateTimeRangePicker />);

    await openCalendar(user);

    const text = screen.getByRole('dialog').textContent ?? '';
    expect(text).toContain('November 2026');
    expect(text).toContain('December 2026');
  });

  it('clears the range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        initial={{ from: new Date(2026, 10, 2, 9, 0), to: new Date(2026, 10, 4, 17, 0) }}
        onChange={onChange}
        clearable
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it('is a plain button without typing', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DateTimeRangePicker allowTyping={false} />);
    expect(screen.getByRole('button', { name: 'Pick a date and time range' })).toBeTruthy();

    rerender(
      <DateTimeRangePicker
        allowTyping={false}
        value={{ from: new Date(2026, 10, 2, 9, 0), to: new Date(2026, 10, 4, 17, 30) }}
      />,
    );
    await user.click(
      screen.getByRole('button', { name: '11/02/2026, 9:00 AM – 11/04/2026, 5:30 PM' }),
    );
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
