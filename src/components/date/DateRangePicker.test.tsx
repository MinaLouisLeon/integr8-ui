import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DateRange } from './Calendar';
import { DateRangePicker, type DateRangePickerProps } from './DateRangePicker';
import { rangePresets } from './rangePresets';

// Fixed "today": Friday 6 November 2026. Only Date is faked, so user-event keeps working.
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
}: Omit<DateRangePickerProps, 'value' | 'onChange'> & {
  initial?: DateRange;
  onChange: (value: DateRange | undefined) => void;
}) {
  const [value, setValue] = useState<DateRange | undefined>(initial);
  return (
    <DateRangePicker
      {...props}
      value={value ?? null}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

const start = () => screen.getByRole('textbox', { name: 'Start date' }) as HTMLInputElement;
const end = () => screen.getByRole('textbox', { name: 'End date' }) as HTMLInputElement;

describe('DateRangePicker', () => {
  it('shows both ends', () => {
    render(<DateRangePicker value={{ from: new Date(2026, 10, 2), to: new Date(2026, 10, 9) }} />);

    expect(start().value).toBe('11/02/2026');
    expect(end().value).toBe('11/09/2026');
  });

  it('commits typed from and to dates', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await user.type(start(), '11/02/2026{Enter}');
    await user.type(end(), '11/09/2026{Enter}');

    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 2),
      to: new Date(2026, 10, 9),
    });
  });

  it('flags a "to" before the "from" and keeps the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onInvalidInput = vi.fn();
    render(
      <Controlled
        initial={{ from: new Date(2026, 10, 10), to: new Date(2026, 10, 20) }}
        onChange={onChange}
        onInvalidInput={onInvalidInput}
      />,
    );

    await user.clear(end());
    await user.type(end(), '11/05/2026{Enter}');

    expect(onInvalidInput).toHaveBeenCalledWith('11/05/2026', 'out-of-range');
    expect(end().getAttribute('aria-invalid')).toBe('true');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('flags a "from" after the "to"', async () => {
    const user = userEvent.setup();
    const onInvalidInput = vi.fn();
    render(
      <Controlled
        initial={{ from: new Date(2026, 10, 10), to: new Date(2026, 10, 20) }}
        onChange={vi.fn()}
        onInvalidInput={onInvalidInput}
      />,
    );

    await user.clear(start());
    await user.type(start(), '11/25/2026{Enter}');

    expect(onInvalidInput).toHaveBeenCalledWith('11/25/2026', 'out-of-range');
    expect(start().getAttribute('aria-invalid')).toBe('true');
  });

  it('flags text that is not a date', async () => {
    const user = userEvent.setup();
    const onInvalidInput = vi.fn();
    render(<DateRangePicker onInvalidInput={onInvalidInput} />);

    await user.type(start(), 'soon');
    await user.tab();

    expect(onInvalidInput).toHaveBeenCalledWith('soon', 'unparseable');
  });

  it('clears one end when its text is emptied', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        initial={{ from: new Date(2026, 10, 2), to: new Date(2026, 10, 9) }}
        onChange={onChange}
      />,
    );

    await user.clear(end());
    await user.tab();

    expect(onChange).toHaveBeenLastCalledWith({ from: new Date(2026, 10, 2), to: undefined });
  });

  it('clears the whole range with the clear button', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        initial={{ from: new Date(2026, 10, 2), to: new Date(2026, 10, 9) }}
        onChange={onChange}
        clearable
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenLastCalledWith(undefined);
    expect(start().value).toBe('');
  });

  it('shows two months and closes after the second day is picked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('November 2026');
    expect(dialog.textContent).toContain('December 2026');

    await user.click(screen.getAllByText('10')[0] as HTMLElement);
    expect(screen.getByRole('dialog')).toBeTruthy();
    await user.click(screen.getAllByText('14')[0] as HTMLElement);

    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 10, 10),
      to: new Date(2026, 10, 14),
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(start().value).toBe('11/10/2026');
    expect(end().value).toBe('11/14/2026');
  });

  it('applies a preset and closes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} presets={rangePresets} />);

    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByRole('button', { name: 'Last 7 days' }));

    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 9, 31),
      to: new Date(2026, 10, 6),
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('lists the presets it is given and ignores a preset without a start', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        onChange={onChange}
        presets={[{ label: 'Nothing', range: () => ({ from: undefined }) }]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByRole('button', { name: 'Nothing' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('opens with Alt+ArrowDown in either input', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker />);

    await user.click(end());
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');

    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('is a plain button without typing', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DateRangePicker allowTyping={false} />);

    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByRole('button', { name: 'Pick a range' })).toBeTruthy();

    rerender(
      <DateRangePicker
        allowTyping={false}
        value={{ from: new Date(2026, 10, 2), to: undefined }}
      />,
    );
    await user.click(screen.getByRole('button', { name: '11/02/2026 – …' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('is disabled as a whole', () => {
    render(<DateRangePicker disabled />);

    expect(start().disabled).toBe(true);
    expect(end().disabled).toBe(true);
  });
});
