import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, type Mock, vi } from 'vitest';
import { TimeInput, type TimeInputProps } from './TimeInput';
import type { Time } from './time';

/** Last argument of the last call of a mock. */
function lastArg<T>(mock: Mock): T {
  return mock.mock.calls.at(-1)?.[0] as T;
}

/** Controlled input that reports every change. */
function Harness({
  initial = null,
  onChange,
  ...props
}: { initial?: Time | null; onChange: (value: Time | null) => void } & Omit<
  TimeInputProps,
  'value' | 'onChange'
>) {
  const [value, setValue] = useState<Time | null>(initial);
  return (
    <TimeInput
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

const hours = () => screen.getByRole('spinbutton', { name: 'Hours' }) as HTMLInputElement;
const minutes = () => screen.getByRole('spinbutton', { name: 'Minutes' }) as HTMLInputElement;
const seconds = () => screen.getByRole('spinbutton', { name: 'Seconds' }) as HTMLInputElement;
const period = () => screen.getByRole('spinbutton', { name: 'AM/PM' }) as HTMLInputElement;

describe('TimeInput display', () => {
  it('shows a 24-hour value with padded segments', () => {
    render(<TimeInput value={{ hours: 9, minutes: 5 }} hourCycle={24} />);

    expect(hours().value).toBe('09');
    expect(minutes().value).toBe('05');
    expect(screen.queryByRole('spinbutton', { name: 'AM/PM' })).toBeNull();
    expect(screen.queryByRole('spinbutton', { name: 'Seconds' })).toBeNull();
  });

  it('shows a 12-hour value with AM/PM', () => {
    render(<TimeInput value={{ hours: 15, minutes: 5 }} hourCycle={12} />);

    expect(hours().value).toBe('03');
    expect(minutes().value).toBe('05');
    expect(period().value).toBe('PM');
  });

  it('shows midnight and noon as 12 in 12-hour mode', () => {
    const { rerender } = render(<TimeInput value={{ hours: 0, minutes: 0 }} hourCycle={12} />);
    expect(hours().value).toBe('12');
    expect(period().value).toBe('AM');

    rerender(<TimeInput value={{ hours: 12, minutes: 30 }} hourCycle={12} />);
    expect(hours().value).toBe('12');
    expect(period().value).toBe('PM');
  });

  it('shows seconds when asked', () => {
    render(<TimeInput value={{ hours: 1, minutes: 2, seconds: 3 }} hourCycle={24} showSeconds />);

    expect(seconds().value).toBe('03');
  });

  it('is empty without a value', () => {
    render(<TimeInput value={null} hourCycle={24} />);

    expect(hours().value).toBe('');
    expect(minutes().value).toBe('');
  });

  it('follows a new value from outside', () => {
    const { rerender } = render(<TimeInput value={{ hours: 9, minutes: 0 }} hourCycle={24} />);
    rerender(<TimeInput value={{ hours: 18, minutes: 45 }} hourCycle={24} />);

    expect(hours().value).toBe('18');
    expect(minutes().value).toBe('45');

    rerender(<TimeInput value={null} hourCycle={24} />);
    expect(hours().value).toBe('');
  });

  it('passes id, aria-invalid and aria-describedby to the segments', () => {
    render(<TimeInput hourCycle={24} id="start" aria-invalid aria-describedby="hint" />);

    expect(hours().id).toBe('start');
    expect(minutes().id).toBe('');
    expect(hours().getAttribute('aria-invalid')).toBe('true');
    expect(minutes().getAttribute('aria-describedby')).toBe('hint');
  });

  it('puts other props on the group', () => {
    render(<TimeInput hourCycle={24} aria-label="Start time" className="custom" />);
    const group = screen.getByRole('group', { name: 'Start time' });

    expect(group.className).toContain('custom');
  });
});

describe('TimeInput accessibility', () => {
  it('gives each segment spinbutton values', () => {
    render(<TimeInput value={{ hours: 15, minutes: 5 }} hourCycle={12} />);

    expect(hours().getAttribute('aria-valuemin')).toBe('1');
    expect(hours().getAttribute('aria-valuemax')).toBe('12');
    expect(hours().getAttribute('aria-valuenow')).toBe('3');
    expect(minutes().getAttribute('aria-valuemin')).toBe('0');
    expect(minutes().getAttribute('aria-valuemax')).toBe('59');
    expect(minutes().getAttribute('aria-valuenow')).toBe('5');
    expect(period().getAttribute('aria-valuetext')).toBe('PM');
  });

  it('leaves aria-valuenow out of an empty segment', () => {
    render(<TimeInput value={null} hourCycle={24} />);

    expect(hours().hasAttribute('aria-valuenow')).toBe(false);
    expect(hours().getAttribute('aria-valuetext')).toBe('Empty');
  });

  it('disables every segment', () => {
    render(<TimeInput value={null} hourCycle={12} disabled />);

    for (const segment of [hours(), minutes(), period()]) {
      expect(segment.disabled).toBe(true);
    }
  });
});

describe('TimeInput typing', () => {
  it('types a full time and moves on when a segment is full', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness hourCycle={24} onChange={onChange} />);

    await user.click(hours());
    await user.keyboard('0930');

    expect(hours().value).toBe('09');
    expect(minutes().value).toBe('30');
    expect(lastArg(onChange)).toEqual({ hours: 9, minutes: 30 });
    expect(document.activeElement).toBe(minutes());
  });

  it('moves on after one digit that cannot start a valid two-digit number', async () => {
    const user = userEvent.setup();
    render(<Harness hourCycle={24} onChange={vi.fn()} />);

    await user.click(hours());
    await user.keyboard('7');

    expect(hours().value).toBe('07');
    expect(document.activeElement).toBe(minutes());
  });

  it('keeps waiting after a digit that can start a valid two-digit number', async () => {
    const user = userEvent.setup();
    render(<Harness hourCycle={24} onChange={vi.fn()} />);

    await user.click(hours());
    await user.keyboard('1');

    expect(hours().value).toBe('01');
    expect(document.activeElement).toBe(hours());

    await user.keyboard('8');
    expect(hours().value).toBe('18');
    expect(document.activeElement).toBe(minutes());
  });

  it('starts again when two digits are out of range', async () => {
    const user = userEvent.setup();
    render(<Harness hourCycle={24} onChange={vi.fn()} />);

    await user.click(hours());
    await user.keyboard('25');

    expect(hours().value).toBe('05');
  });

  it('limits 12-hour hours to 1-12', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness hourCycle={12} onChange={onChange} />);

    await user.click(hours());
    await user.keyboard('0');
    expect(document.activeElement).toBe(hours());
    await user.keyboard('5');

    expect(hours().value).toBe('05');
    expect(document.activeElement).toBe(minutes());

    await user.keyboard('45');
    await user.click(period());
    await user.keyboard('p');

    expect(lastArg(onChange)).toEqual({ hours: 17, minutes: 45 });
  });

  it('ignores letters in number segments', async () => {
    const user = userEvent.setup();
    render(<Harness hourCycle={24} onChange={vi.fn()} />);

    await user.click(hours());
    await user.keyboard('x');

    expect(hours().value).toBe('');
  });

  it('sets AM and PM with a and p', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness hourCycle={12} initial={{ hours: 9, minutes: 30 }} onChange={onChange} />);

    await user.click(period());
    await user.keyboard('p');
    expect(period().value).toBe('PM');
    expect(lastArg(onChange)).toEqual({ hours: 21, minutes: 30 });

    await user.keyboard('A');
    expect(period().value).toBe('AM');
    expect(lastArg(onChange)).toEqual({ hours: 9, minutes: 30 });

    await user.keyboard('z');
    expect(period().value).toBe('AM');
  });

  it('works without a value prop (uncontrolled)', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TimeInput hourCycle={24} onChange={onChange} />);

    await user.click(hours());
    await user.keyboard('1445');

    expect(hours().value).toBe('14');
    expect(minutes().value).toBe('45');
    expect(lastArg(onChange)).toEqual({ hours: 14, minutes: 45 });
  });

  it('includes seconds only when showSeconds is on', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness hourCycle={24} showSeconds onChange={onChange} />);

    await user.click(hours());
    await user.keyboard('101520');

    expect(lastArg(onChange)).toEqual({ hours: 10, minutes: 15, seconds: 20 });
  });

  it('reports null while the time is incomplete', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness hourCycle={24} onChange={onChange} />);

    await user.click(hours());
    await user.keyboard('09');

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('TimeInput keys', () => {
  it('changes a segment with ArrowUp and ArrowDown and wraps', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness hourCycle={24} initial={{ hours: 23, minutes: 0 }} onChange={onChange} />);

    hours().focus();
    await user.keyboard('{ArrowUp}');
    expect(lastArg(onChange)).toEqual({ hours: 0, minutes: 0 });

    await user.keyboard('{ArrowDown}');
    expect(lastArg(onChange)).toEqual({ hours: 23, minutes: 0 });

    minutes().focus();
    await user.keyboard('{ArrowDown}');
    expect(lastArg(onChange)).toEqual({ hours: 23, minutes: 59 });
  });

  it('wraps 12-hour hours between 12 and 1', async () => {
    const user = userEvent.setup();
    render(<Harness hourCycle={12} initial={{ hours: 11, minutes: 0 }} onChange={vi.fn()} />);

    hours().focus();
    await user.keyboard('{ArrowUp}');
    expect(hours().value).toBe('12');
    await user.keyboard('{ArrowUp}');
    expect(hours().value).toBe('01');
    await user.keyboard('{ArrowDown}');
    expect(hours().value).toBe('12');
  });

  it('jumps minutes by minuteStep and snaps to the step', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Harness
        hourCycle={24}
        minuteStep={15}
        initial={{ hours: 9, minutes: 10 }}
        onChange={onChange}
      />,
    );

    minutes().focus();
    await user.keyboard('{ArrowUp}');
    expect(minutes().value).toBe('15');
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(minutes().value).toBe('45');
    await user.keyboard('{ArrowUp}');
    expect(minutes().value).toBe('00');
    await user.keyboard('{ArrowDown}');
    expect(minutes().value).toBe('45');
    expect(lastArg(onChange)).toEqual({ hours: 9, minutes: 45 });
  });

  it('starts an empty segment at its first or last value', async () => {
    const user = userEvent.setup();
    render(<Harness hourCycle={24} onChange={vi.fn()} />);

    hours().focus();
    await user.keyboard('{ArrowUp}');
    expect(hours().value).toBe('00');

    minutes().focus();
    await user.keyboard('{ArrowDown}');
    expect(minutes().value).toBe('59');
  });

  it('toggles AM/PM with the arrows', async () => {
    const user = userEvent.setup();
    render(<Harness hourCycle={12} initial={{ hours: 9, minutes: 0 }} onChange={vi.fn()} />);

    period().focus();
    await user.keyboard('{ArrowUp}');
    expect(period().value).toBe('PM');
    await user.keyboard('{ArrowDown}');
    expect(period().value).toBe('AM');
  });

  it('clears a segment with Backspace and reports null', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness hourCycle={24} initial={{ hours: 9, minutes: 30 }} onChange={onChange} />);

    minutes().focus();
    await user.keyboard('{Backspace}');

    expect(minutes().value).toBe('');
    expect(hours().value).toBe('09');
    expect(lastArg(onChange)).toBeNull();

    await user.keyboard('45');
    expect(lastArg(onChange)).toEqual({ hours: 9, minutes: 45 });
  });

  it('clears with Delete too', async () => {
    const user = userEvent.setup();
    render(<Harness hourCycle={24} initial={{ hours: 9, minutes: 30 }} onChange={vi.fn()} />);

    hours().focus();
    await user.keyboard('{Delete}');

    expect(hours().value).toBe('');
  });

  it('moves between segments with ArrowLeft and ArrowRight', async () => {
    const user = userEvent.setup();
    render(<TimeInput hourCycle={12} showSeconds />);

    hours().focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(minutes());
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(seconds());
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(period());
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(period());
    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(document.activeElement).toBe(hours());
  });
});

describe('TimeInput min and max', () => {
  it('moves a time below min to min', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Harness
        hourCycle={24}
        min={{ hours: 9, minutes: 0 }}
        initial={{ hours: 9, minutes: 0 }}
        onChange={onChange}
      />,
    );

    hours().focus();
    await user.keyboard('{ArrowDown}');

    expect(hours().value).toBe('09');
    expect(minutes().value).toBe('00');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('moves a time above max to max', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Harness
        hourCycle={24}
        max={{ hours: 17, minutes: 30 }}
        initial={{ hours: 17, minutes: 0 }}
        onChange={onChange}
      />,
    );

    hours().focus();
    await user.keyboard('{ArrowUp}');

    expect(hours().value).toBe('17');
    expect(minutes().value).toBe('30');
    expect(lastArg(onChange)).toEqual({ hours: 17, minutes: 30 });
  });

  it('clamps a typed time', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness hourCycle={24} min={{ hours: 9, minutes: 30 }} onChange={onChange} />);

    await user.click(hours());
    await user.keyboard('0915');

    expect(lastArg(onChange)).toEqual({ hours: 9, minutes: 30 });
    expect(minutes().value).toBe('30');
  });
});

describe('TimeInput blur', () => {
  it('calls onBlur only when focus leaves the whole input', async () => {
    const onBlur = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <TimeInput hourCycle={24} onBlur={onBlur} />
        <button type="button">outside</button>
      </>,
    );

    await user.click(hours());
    await user.keyboard('{ArrowRight}');
    expect(onBlur).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'outside' }));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
