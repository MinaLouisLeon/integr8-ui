import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DatePicker } from './DatePicker';

// Fixed "today": Friday 6 November 2026. Only Date is faked, so user-event keeps working.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 6, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

/** A picker that keeps the value in state, like a form would. Starts on 6 November 2026. */
function Controlled({ onChange }: { onChange: (value: Date | undefined) => void }) {
  const [value, setValue] = useState<Date | undefined>(new Date(2026, 10, 6));
  return (
    <DatePicker
      value={value ?? null}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

function input(): HTMLInputElement {
  return screen.getByRole('textbox') as HTMLInputElement;
}

describe('DatePicker', () => {
  it('shows the value in the display format and the format as placeholder', () => {
    const { rerender } = render(<DatePicker value={new Date(2026, 10, 6)} />);
    expect(input().value).toBe('11/06/2026');

    rerender(<DatePicker value={null} />);
    expect(input().value).toBe('');
    expect(input().placeholder).toBe('MM/DD/YYYY');
  });

  it('uses a custom format and placeholder', () => {
    render(<DatePicker value={new Date(2026, 10, 6)} format="dd MMM yyyy" placeholder="Pick" />);

    expect(input().value).toBe('06 Nov 2026');
    expect(input().placeholder).toBe('Pick');
  });

  it('commits typed text on blur and writes it back in the display format', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} />);

    await user.type(input(), '2026-11-06');
    await user.tab();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 6));
    expect(input().value).toBe('11/06/2026');
    expect(input().getAttribute('aria-invalid')).toBeNull();
  });

  it('commits typed text on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} />);

    await user.type(input(), '11/07/2026{Enter}');

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 7));
  });

  it('flags text that is not a date and does not change the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onInvalidInput = vi.fn();
    render(
      <DatePicker
        value={new Date(2026, 10, 6)}
        onChange={onChange}
        onInvalidInput={onInvalidInput}
      />,
    );

    await user.clear(input());
    await user.type(input(), 'soon');
    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
    expect(onInvalidInput).toHaveBeenCalledWith('soon', 'unparseable');
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(input().value).toBe('soon');
  });

  it('restores the last valid text on Escape', async () => {
    const user = userEvent.setup();
    render(<DatePicker value={new Date(2026, 10, 6)} />);

    await user.clear(input());
    await user.type(input(), 'soon');
    await user.tab();
    await user.click(input());
    await user.keyboard('{Escape}');

    expect(input().value).toBe('11/06/2026');
    expect(input().getAttribute('aria-invalid')).toBeNull();
  });

  it('clears the flag when the user types again', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);

    await user.type(input(), 'soon');
    await user.tab();
    expect(input().getAttribute('aria-invalid')).toBe('true');

    await user.type(input(), 'x');
    expect(input().getAttribute('aria-invalid')).toBeNull();
  });

  it('rejects disabled days', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onInvalidInput = vi.fn();
    render(
      <DatePicker
        onChange={onChange}
        onInvalidInput={onInvalidInput}
        disabledDays={{ dayOfWeek: [0, 6] }}
      />,
    );

    await user.type(input(), '11/07/2026');
    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
    expect(onInvalidInput).toHaveBeenCalledWith('11/07/2026', 'disabled');
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });

  it('rejects days outside fromDate and toDate', async () => {
    const user = userEvent.setup();
    const onInvalidInput = vi.fn();
    render(
      <DatePicker
        fromDate={new Date(2026, 10, 10)}
        toDate={new Date(2026, 10, 20)}
        onInvalidInput={onInvalidInput}
      />,
    );

    await user.type(input(), '11/09/2026');
    await user.tab();
    expect(onInvalidInput).toHaveBeenLastCalledWith('11/09/2026', 'out-of-range');

    await user.clear(input());
    await user.type(input(), '11/21/2026');
    await user.tab();
    expect(onInvalidInput).toHaveBeenLastCalledWith('11/21/2026', 'out-of-range');
  });

  it('clears the value when the text is emptied', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={new Date(2026, 10, 6)} onChange={onChange} />);

    await user.clear(input());
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(input().getAttribute('aria-invalid')).toBeNull();
  });

  it('has a clear button when clearable', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<DatePicker value={new Date(2026, 10, 6)} />);
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();

    rerender(<DatePicker value={new Date(2026, 10, 6)} onChange={onChange} clearable />);
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(document.activeElement).toBe(input());
  });

  it('moves the date by a day with ArrowUp and ArrowDown, and by a month with Shift', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await user.click(input());
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 7));

    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 6));

    await user.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 9, 6));
  });

  it('opens the calendar with Alt+ArrowDown and with the button', async () => {
    const user = userEvent.setup();
    render(<DatePicker value={new Date(2026, 10, 6)} />);

    await user.click(input());
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(screen.getByRole('dialog').textContent).toContain('November 2026');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('picks a day, closes and returns focus to the input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={new Date(2026, 10, 6)} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByText('15'));

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 15));
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(input()));
  });

  it('lets a second picker open while the first is open', async () => {
    const user = userEvent.setup();
    render(
      <>
        <DatePicker />
        <DatePicker />
      </>,
    );

    const [first, second] = screen.getAllByRole('button', { name: 'Open calendar' });
    await user.click(first as HTMLElement);
    expect(screen.getAllByRole('dialog')).toHaveLength(1);

    await user.click(second as HTMLElement);

    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1));
    // Give any late focus change time to close the second one.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
  });

  it('jumps the calendar to the month of the typed date', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);

    await user.type(input(), '03/09/2027{Enter}');
    await user.click(screen.getByRole('button', { name: 'Open calendar' }));

    expect(screen.getByRole('dialog').textContent).toContain('March 2027');
  });

  it('shows the footer under the calendar', async () => {
    const user = userEvent.setup();
    render(<DatePicker footer={<span>Pick any day</span>} />);

    await user.click(screen.getByRole('button', { name: 'Open calendar' }));

    expect(screen.getByText('Pick any day')).toBeTruthy();
  });

  it('is a plain button without typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<DatePicker allowTyping={false} onChange={onChange} />);

    expect(screen.queryByRole('textbox')).toBeNull();
    const trigger = screen.getByRole('button', { name: 'Pick a date' });

    await user.click(trigger);
    await user.click(screen.getByText('12'));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 12));

    rerender(<DatePicker allowTyping={false} value={new Date(2026, 10, 6)} />);
    expect(screen.getByRole('button', { name: '11/06/2026' })).toBeTruthy();
  });

  it('shows the invalid style on the button when aria-invalid is set', () => {
    render(<DatePicker allowTyping={false} aria-invalid />);

    expect(screen.getByRole('button', { name: 'Pick a date' }).getAttribute('aria-invalid')).toBe(
      'true',
    );
  });

  it('is disabled as a whole', () => {
    render(<DatePicker disabled value={new Date(2026, 10, 6)} />);

    expect(input().disabled).toBe(true);
    expect(
      (screen.getByRole('button', { name: 'Open calendar' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('describes the input with the format hint and keeps a given description', () => {
    render(<DatePicker aria-describedby="help" />);

    const ids = (input().getAttribute('aria-describedby') ?? '').split(' ');
    expect(ids[0]).toBe('help');
    expect(document.getElementById(ids[1] ?? '')?.textContent).toBe('Format: MM/DD/YYYY');
  });

  it('passes the ref to the input', () => {
    let element: HTMLInputElement | null = null;
    render(
      <DatePicker
        ref={(node) => {
          element = node;
        }}
      />,
    );

    expect(element).toBe(input());
  });

  it('keeps its own value when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);

    await user.click(screen.getByRole('button', { name: 'Open calendar' }));
    await user.click(screen.getByText('20'));

    expect(input().value).toBe('11/20/2026');
  });
});
