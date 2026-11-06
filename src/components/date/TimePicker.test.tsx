import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TimePicker, type TimePickerProps } from './TimePicker';
import type { Time } from './time';

/** A picker that keeps the time in state, like a form would. */
function Controlled({
  initial,
  onChange,
  ...props
}: Omit<TimePickerProps, 'value' | 'onChange'> & {
  initial?: Time;
  onChange: (value: Time | null) => void;
}) {
  const [value, setValue] = useState<Time | null>(initial ?? null);
  return (
    <TimePicker
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

const open = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Open time list' }));
const list = (name: string) => within(screen.getByRole('group', { name }));

describe('TimePicker', () => {
  it('types in the segments like TimeInput', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} hourCycle={24} />);

    await user.click(screen.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('0930');

    expect(onChange).toHaveBeenLastCalledWith({ hours: 9, minutes: 30 });
  });

  it('picks hours and minutes from the lists (24-hour)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} hourCycle={24} minuteStep={15} />);

    await open(user);
    await user.click(list('Select hours').getByRole('button', { name: '14' }));
    expect(onChange).toHaveBeenLastCalledWith({ hours: 14, minutes: 0 });

    await user.click(list('Select minutes').getByRole('button', { name: '45' }));
    expect(onChange).toHaveBeenLastCalledWith({ hours: 14, minutes: 45 });
    expect(list('Select minutes').queryByRole('button', { name: '10' })).toBeNull();
    expect(
      list('Select minutes').getByRole('button', { name: '45' }).getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('lists every minute step up to 59 and every second in 12-hour mode with seconds', async () => {
    const user = userEvent.setup();
    render(<Controlled onChange={vi.fn()} hourCycle={12} showSeconds minuteStep={15} />);

    await open(user);

    const minutes = list('Select minutes').getAllByRole('button');
    expect(minutes.map((button) => button.textContent)).toEqual(['00', '15', '30', '45']);
    expect(list('Select seconds').getAllByRole('button')).toHaveLength(60);
    expect(list('Select hours').getAllByRole('button')).toHaveLength(12);
    expect(list('Select AM or PM').getAllByRole('button')).toHaveLength(2);
  });

  it('shows AM/PM and keeps the period when an hour is picked (12-hour)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} hourCycle={12} initial={{ hours: 15, minutes: 30 }} />);

    await open(user);
    await user.click(list('Select hours').getByRole('button', { name: '09' }));
    expect(onChange).toHaveBeenLastCalledWith({ hours: 21, minutes: 30 });

    await user.click(list('Select AM or PM').getByRole('button', { name: 'AM' }));
    expect(onChange).toHaveBeenLastCalledWith({ hours: 9, minutes: 30 });

    await user.click(list('Select hours').getByRole('button', { name: '12' }));
    expect(onChange).toHaveBeenLastCalledWith({ hours: 0, minutes: 30 });
  });

  it('starts at AM when the period is picked on an empty time', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} hourCycle={12} />);

    await open(user);
    await user.click(list('Select AM or PM').getByRole('button', { name: 'PM' }));

    expect(onChange).toHaveBeenLastCalledWith({ hours: 12, minutes: 0 });
  });

  it('has no AM/PM list in 24-hour mode and a seconds list only with showSeconds', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} hourCycle={24} showSeconds />);

    await open(user);
    expect(screen.queryByRole('group', { name: 'Select AM or PM' })).toBeNull();
    await user.click(list('Select seconds').getByRole('button', { name: '30' }));

    expect(onChange).toHaveBeenLastCalledWith({ hours: 0, minutes: 0, seconds: 30 });
  });

  it('moves a picked time into min and max', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        onChange={onChange}
        hourCycle={24}
        min={{ hours: 9, minutes: 0 }}
        max={{ hours: 17, minutes: 0 }}
      />,
    );

    await open(user);
    await user.click(list('Select hours').getByRole('button', { name: '20' }));

    expect(onChange).toHaveBeenLastCalledWith({ hours: 17, minutes: 0 });
  });

  it('opens with Alt+ArrowDown', async () => {
    const user = userEvent.setup();
    render(<Controlled onChange={vi.fn()} hourCycle={24} />);

    await user.click(screen.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');

    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('clears the time', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        onChange={onChange}
        hourCycle={24}
        initial={{ hours: 9, minutes: 0 }}
        clearable
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('keeps its own time when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<TimePicker hourCycle={24} />);

    await open(user);
    await user.click(list('Select hours').getByRole('button', { name: '08' }));

    expect((screen.getByRole('spinbutton', { name: 'Hours' }) as HTMLInputElement).value).toBe(
      '08',
    );
  });

  it('is disabled as a whole', () => {
    render(<TimePicker hourCycle={24} disabled />);

    expect(
      (screen.getByRole('button', { name: 'Open time list' }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect((screen.getByRole('spinbutton', { name: 'Hours' }) as HTMLInputElement).disabled).toBe(
      true,
    );
  });

  it('passes the ref to the group element', () => {
    let element: HTMLDivElement | null = null;
    render(
      <TimePicker
        hourCycle={24}
        ref={(node) => {
          element = node;
        }}
      />,
    );

    expect((element as HTMLDivElement | null)?.getAttribute('role')).toBe('group');
  });
});
