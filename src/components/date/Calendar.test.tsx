import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { Calendar, type CalendarProps, type DateRange } from './Calendar';

/** First argument of the first call of a mock. */
function firstArg<T>(mock: Mock): T {
  return mock.mock.calls[0]?.[0] as T;
}

/** First argument of the last call of a mock. */
function lastArg<T>(mock: Mock): T {
  return mock.mock.calls.at(-1)?.[0] as T;
}

/** Controlled multiple-mode calendar that reports every change. */
function MultipleHarness({ onChange }: { onChange: (days: Date[] | undefined) => void }) {
  const [days, setDays] = useState<Date[] | undefined>();
  return (
    <Calendar
      mode="multiple"
      selected={days}
      onSelect={(next) => {
        setDays(next);
        onChange(next);
      }}
    />
  );
}

/** Controlled range-mode calendar that reports every change. */
function RangeHarness({ onChange }: { onChange: (range: DateRange | undefined) => void }) {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={(next) => {
        setRange(next);
        onChange(next);
      }}
    />
  );
}

// Fixed "today": Friday 6 November 2026. Only Date is faked, so user-event keeps working.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 6, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Calendar', () => {
  it('is display-only without a selection: shows the month and outlines today', () => {
    const { container } = render(<Calendar />);

    expect(screen.getByText('November 2026')).toBeTruthy();
    const today = container.querySelector('.rdp-today');
    expect(today?.textContent).toBe('6');
    expect(today?.className).toContain('ring-ring');
  });

  it('selects one day in single mode', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar mode="single" onSelect={onSelect} />);

    await user.click(screen.getByText('15'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(firstArg<Date>(onSelect).getDate()).toBe(15);
  });

  it('treats a selection without a mode as single', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const props = { onSelect } as unknown as CalendarProps;
    render(<Calendar {...props} />);

    await user.click(screen.getByText('12'));

    expect(firstArg<Date>(onSelect).getDate()).toBe(12);
  });

  it('collects several days in multiple mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultipleHarness onChange={onChange} />);

    await user.click(screen.getByText('10'));
    await user.click(screen.getByText('12'));

    const last = lastArg<Date[]>(onChange);
    expect(last.map((day) => day.getDate())).toEqual([10, 12]);
  });

  it('picks a range with two clicks', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RangeHarness onChange={onChange} />);

    await user.click(screen.getByText('10'));
    await user.click(screen.getByText('14'));

    const last = lastArg<DateRange>(onChange);
    expect(last.from?.getDate()).toBe(10);
    expect(last.to?.getDate()).toBe(14);
  });

  it('navigates between months', async () => {
    const user = userEvent.setup();
    render(<Calendar />);

    await user.click(screen.getByRole('button', { name: /next month/i }));
    expect(screen.getByText('December 2026')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /previous month/i }));
    expect(screen.getByText('November 2026')).toBeTruthy();
  });

  it('shows several months with numberOfMonths', () => {
    render(<Calendar numberOfMonths={2} />);

    expect(screen.getByText('November 2026')).toBeTruthy();
    expect(screen.getByText('December 2026')).toBeTruthy();
  });

  it('does not select days before fromDate or after toDate', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        onSelect={onSelect}
        fromDate={new Date(2026, 10, 10)}
        toDate={new Date(2026, 10, 20)}
      />,
    );

    await user.click(screen.getByText('7'));
    await user.click(screen.getByText('25'));
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(screen.getByText('15'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('limits navigation to the months of fromDate and toDate', async () => {
    const user = userEvent.setup();
    render(
      <Calendar mode="single" fromDate={new Date(2026, 10, 10)} toDate={new Date(2026, 10, 20)} />,
    );

    // At the limits react-day-picker disables (or removes) the buttons; clicking changes nothing.
    for (const name of [/next month/i, /previous month/i]) {
      const button = screen.queryByRole('button', { name });
      if (button) await user.click(button);
    }

    expect(screen.getByText('November 2026')).toBeTruthy();
  });

  it('keeps disabled matchers next to the date limits', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        onSelect={onSelect}
        disabled={{ dayOfWeek: [0] }}
        fromDate={new Date(2026, 10, 3)}
      />,
    );

    // 8 November 2026 is a Sunday.
    await user.click(screen.getByText('8'));
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(screen.getByText('9'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows month and year dropdowns built on the ui Select', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    render(<Calendar captionLayout="dropdown" onMonthChange={onMonthChange} />);

    const dropdowns = screen.getAllByRole('combobox');
    expect(dropdowns).toHaveLength(2);

    await user.click(dropdowns[0] as HTMLElement);
    await user.click(await screen.findByRole('option', { name: 'March' }));

    expect(onMonthChange).toHaveBeenCalledTimes(1);
    expect(firstArg<Date>(onMonthChange).getMonth()).toBe(2);
  });

  describe('year list', () => {
    /** Opens the year select and returns the years listed and the scrolling element. */
    async function openYears(props: CalendarProps) {
      const user = userEvent.setup();
      render(<Calendar captionLayout="dropdown" {...props} />);
      await user.click(screen.getByRole('combobox', { name: /year/i }));
      const viewport = document.querySelector<HTMLElement>('[data-radix-select-viewport]');
      if (!viewport) throw new Error('year list did not open');
      const years = () => screen.getAllByRole('option').map((option) => Number(option.textContent));
      return { viewport, years };
    }

    // jsdom has no layout: fake a 5000px list in a 300px window, then fire the scroll event.
    const TOP = 0;
    const BOTTOM = 4700;

    function scrollTo(viewport: HTMLElement, top: number) {
      let position = top;
      Object.defineProperty(viewport, 'scrollTop', {
        get: () => position,
        set: (next: number) => {
          position = next;
        },
        configurable: true,
      });
      Object.defineProperty(viewport, 'scrollHeight', { value: 5000, configurable: true });
      Object.defineProperty(viewport, 'clientHeight', { value: 300, configurable: true });
      fireEvent.scroll(viewport);
    }

    it('starts 50 years before and after today without limits', async () => {
      const { years } = await openYears({});

      expect(years()).toContain(1976);
      expect(years()).toContain(2076);
      expect(years()).not.toContain(1950);
    });

    it('adds years to the past when scrolled near the top', async () => {
      const { viewport, years } = await openYears({});
      const before = Math.min(...years());

      scrollTo(viewport, TOP);

      expect(Math.min(...years())).toBe(before - 25);
    });

    it('adds years to the future when scrolled near the bottom', async () => {
      const { viewport, years } = await openYears({});
      const before = Math.max(...years());

      scrollTo(viewport, BOTTOM);

      expect(Math.max(...years())).toBe(before + 25);
    });

    it('does not extend an end that has a limit', async () => {
      const { viewport, years } = await openYears({
        startMonth: new Date(2020, 0),
        endMonth: new Date(2030, 11),
      });
      const before = years();

      scrollTo(viewport, TOP);
      scrollTo(viewport, BOTTOM);

      expect(years()).toEqual(before);
      expect(Math.min(...before)).toBe(2020);
      expect(Math.max(...before)).toBe(2030);
    });

    it('extends only the end without a limit', async () => {
      const { viewport, years } = await openYears({ startMonth: new Date(2020, 0) });
      const before = years();

      scrollTo(viewport, TOP);
      expect(years()).toEqual(before);

      scrollTo(viewport, BOTTOM);
      expect(Math.max(...years())).toBe(Math.max(...before) + 25);
    });
  });

  it('keeps the nav bar from covering the dropdowns', () => {
    const { container } = render(<Calendar captionLayout="dropdown" />);

    // The nav bar spans the caption; only its two buttons may take pointer events.
    expect(container.querySelector('.rdp-nav')?.className).toContain('pointer-events-none');
    expect(screen.getByRole('button', { name: /next month/i }).className).toContain(
      'pointer-events-auto',
    );
  });

  it('shows week numbers and outside days when asked', () => {
    const { container } = render(<Calendar showWeekNumber />);

    expect(container.querySelectorAll('.rdp-week_number').length).toBeGreaterThan(0);
    expect(container.querySelector('.rdp-outside')).not.toBeNull();
  });

  it('hides outside days with showOutsideDays={false}', () => {
    const { container } = render(<Calendar showOutsideDays={false} />);

    // The cells stay in the grid but are empty and hidden.
    const outside = [...container.querySelectorAll('.rdp-outside')];
    expect(outside.length).toBeGreaterThan(0);
    for (const cell of outside) {
      expect(cell.textContent).toBe('');
      expect(cell.className).toContain('invisible');
    }
  });

  it('merges className and classNames with the built-in classes', () => {
    const { container } = render(
      <Calendar className="custom-root" classNames={{ weekday: 'custom-weekday' }} />,
    );

    expect(container.querySelector('[data-slot="calendar"]')?.className).toContain('custom-root');
    const weekday = container.querySelector('.rdp-weekday');
    expect(weekday?.className).toContain('custom-weekday');
    expect(weekday?.className).toContain('text-muted-foreground');
  });

  it('renders the footer', () => {
    render(<Calendar footer={<button type="button">Today</button>} />);

    expect(screen.getByRole('button', { name: 'Today' })).toBeTruthy();
  });

  it('moves focus with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Calendar mode="single" selected={new Date(2026, 10, 6)} />);

    const selectedDay = screen.getByText('6');
    selectedDay.focus();
    await user.keyboard('{ArrowRight}');

    expect(document.activeElement?.textContent).toBe('7');
  });
});
