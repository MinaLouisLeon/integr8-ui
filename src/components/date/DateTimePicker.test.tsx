import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DateTimePicker, type DateTimePickerProps } from './DateTimePicker';

// Fixed "now": Friday 6 November 2026, 12:00. Only Date is faked, so user-event keeps working.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 6, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

/** A picker that keeps the value in state, like a form would. */
function Controlled({
  initial,
  onChange,
  ...props
}: Omit<DateTimePickerProps, 'value' | 'onChange'> & {
  initial?: Date;
  onChange: (value: Date | undefined) => void;
}) {
  const [value, setValue] = useState<Date | undefined>(initial);
  return (
    <DateTimePicker
      {...props}
      value={value ?? null}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

const input = () => screen.getByRole('textbox') as HTMLInputElement;
const hours = () => screen.getByRole('spinbutton', { name: 'Hours' }) as HTMLInputElement;
const openCalendar = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Open calendar' }));

describe('DateTimePicker', () => {
  it('shows date and time in one input', () => {
    render(<DateTimePicker value={new Date(2026, 10, 6, 15, 30)} />);

    expect(input().value).toBe('11/06/2026, 3:30 PM');
    expect(input().placeholder).toBe('MM/DD/YYYY, hh:mm AM');
  });

  it('follows hourCycle and showSeconds in the default format', () => {
    const { rerender } = render(
      <DateTimePicker value={new Date(2026, 10, 6, 15, 30, 5)} hourCycle={24} />,
    );
    expect(input().value).toBe('11/06/2026, 15:30');

    rerender(
      <DateTimePicker value={new Date(2026, 10, 6, 15, 30, 5)} hourCycle={24} showSeconds />,
    );
    expect(input().value).toBe('11/06/2026, 15:30:05');
  });

  it('commits typed date and time', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimePicker onChange={onChange} />);

    await user.type(input(), '11/06/2026, 9:15 AM{Enter}');

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 6, 9, 15));
    expect(input().value).toBe('11/06/2026, 9:15 AM');
  });

  it('accepts the ISO date-time', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimePicker onChange={onChange} />);

    await user.type(input(), '2026-11-06 21:45{Enter}');

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 6, 21, 45));
  });

  it('uses 00:00 when only a date is typed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimePicker onChange={onChange} />);

    await user.type(input(), '2026-11-07{Enter}');

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 7, 0, 0));
  });

  it('uses defaultTime when only a date is typed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimePicker onChange={onChange} defaultTime={{ hours: 9, minutes: 30 }} />);

    await user.type(input(), '2026-11-07{Enter}');

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 7, 9, 30));
  });

  it('flags text that is not a date-time and keeps the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onInvalidInput = vi.fn();
    render(<DateTimePicker onChange={onChange} onInvalidInput={onInvalidInput} />);

    await user.type(input(), '11/06/2026, 25:99{Enter}');

    expect(onChange).not.toHaveBeenCalled();
    expect(onInvalidInput).toHaveBeenCalledWith('11/06/2026, 25:99', 'unparseable');
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });

  it('rejects a date-time before min or after max, down to the minute', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onInvalidInput = vi.fn();
    render(
      <DateTimePicker
        onChange={onChange}
        onInvalidInput={onInvalidInput}
        min={new Date(2026, 10, 6, 9, 0)}
        max={new Date(2026, 10, 6, 17, 0)}
      />,
    );

    await user.type(input(), '11/06/2026, 8:59 AM{Enter}');
    expect(onInvalidInput).toHaveBeenLastCalledWith('11/06/2026, 8:59 AM', 'out-of-range');

    await user.clear(input());
    await user.type(input(), '11/06/2026, 5:01 PM{Enter}');
    expect(onInvalidInput).toHaveBeenLastCalledWith('11/06/2026, 5:01 PM', 'out-of-range');

    await user.clear(input());
    await user.type(input(), '11/06/2026, 9:00 AM{Enter}');
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 6, 9, 0));
  });

  it('rejects a day before min as out-of-range', async () => {
    const user = userEvent.setup();
    const onInvalidInput = vi.fn();
    render(<DateTimePicker onInvalidInput={onInvalidInput} min={new Date(2026, 10, 6, 9, 0)} />);

    await user.type(input(), '11/05/2026, 10:00 AM{Enter}');

    expect(onInvalidInput).toHaveBeenCalledWith('11/05/2026, 10:00 AM', 'out-of-range');
  });

  it('keeps the time when a day is picked in the calendar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial={new Date(2026, 10, 6, 15, 30)} onChange={onChange} />);

    await openCalendar(user);
    await user.click(screen.getByText('20'));

    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 20, 15, 30));
    // The popover stays open so the time can be adjusted.
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('uses defaultTime for the first day picked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} defaultTime={{ hours: 8, minutes: 0 }} />);

    await openCalendar(user);
    await user.click(screen.getByText('12'));

    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 12, 8, 0));
  });

  it('sets the current moment with the Now button', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await openCalendar(user);
    await user.click(screen.getByRole('button', { name: 'Now' }));

    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 6, 12, 0));
    expect(input().value).toBe('11/06/2026, 12:00 PM');
  });

  it('keeps Now inside min and max', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} max={new Date(2026, 10, 6, 10, 0)} />);

    await openCalendar(user);
    await user.click(screen.getByRole('button', { name: 'Now' }));

    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 6, 10, 0));
  });

  it('edits the time in the popover', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled initial={new Date(2026, 10, 6, 15, 30)} onChange={onChange} hourCycle={24} />,
    );

    await openCalendar(user);
    await user.click(hours());
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 6, 16, 30));
    expect(input().value).toBe('11/06/2026, 16:30');
  });

  it('sets the time from lists with timePicker', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        initial={new Date(2026, 10, 6, 15, 30)}
        onChange={onChange}
        hourCycle={12}
        minuteStep={15}
        timePicker
      />,
    );

    await openCalendar(user);
    // The time row keeps its input and gets a clock button that opens the lists.
    expect(screen.getByRole('spinbutton', { name: 'Hours' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Open time list' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(2);
    const group = (name: string) => within(screen.getByRole('group', { name }));

    await user.click(group('Select hours').getByRole('button', { name: '09' }));
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 6, 21, 30));

    await user.click(group('Select minutes').getByRole('button', { name: '45' }));
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 6, 21, 45));

    await user.click(group('Select AM or PM').getByRole('button', { name: 'AM' }));
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 6, 9, 45));
    // An explicit hourCycle uses a fixed pattern, which pads the hour.
    expect(input().value).toBe('11/06/2026, 09:45 AM');
    // Picking from the lists leaves the calendar popover open.
    expect(screen.getAllByRole('dialog')).toHaveLength(2);
  });

  it('lets the time be set before a day is picked, and uses it for the first day', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} hourCycle={24} timePicker />);

    await openCalendar(user);
    expect(hours().disabled).toBe(false);
    expect(
      (screen.getByRole('button', { name: 'Open time list' }) as HTMLButtonElement).disabled,
    ).toBe(false);

    await user.click(hours());
    await user.keyboard('0945');
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByText('12'));
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 12, 9, 45));
  });

  it('keeps the value while a time segment is cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled initial={new Date(2026, 10, 6, 15, 30)} onChange={onChange} hourCycle={24} />,
    );

    await openCalendar(user);
    await user.click(hours());
    await user.keyboard('{Backspace}');

    expect(onChange).not.toHaveBeenCalled();
    expect(input().value).toBe('11/06/2026, 15:30');

    await user.keyboard('0945');
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 6, 9, 45));
  });

  it('limits the time to min and max on their day', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        initial={new Date(2026, 10, 6, 16, 30)}
        onChange={onChange}
        hourCycle={24}
        max={new Date(2026, 10, 6, 17, 0)}
      />,
    );

    await openCalendar(user);
    await user.click(hours());
    await user.keyboard('{ArrowUp}{ArrowUp}');

    const last = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(last.getTime()).toBeLessThanOrEqual(new Date(2026, 10, 6, 17, 0).getTime());
  });

  it('lets the time be set before a day is picked in the plain time input too', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled onChange={onChange} hourCycle={24} defaultTime={{ hours: 8, minutes: 0 }} />,
    );

    await openCalendar(user);
    expect(hours().disabled).toBe(false);

    await user.click(screen.getByText('12'));
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 12, 8, 0));
  });

  it('is a plain button without typing', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DateTimePicker allowTyping={false} />);

    expect(screen.getByRole('button', { name: 'Pick a date and time' })).toBeTruthy();

    rerender(<DateTimePicker allowTyping={false} value={new Date(2026, 10, 6, 15, 30)} />);
    await user.click(screen.getByRole('button', { name: '11/06/2026, 3:30 PM' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('shows the footer under the time row', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker footer={<span>Local time</span>} />);

    await openCalendar(user);

    expect(screen.getByText('Local time')).toBeTruthy();
  });
});
