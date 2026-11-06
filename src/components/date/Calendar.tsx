'use client';

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type { ChangeEvent, ComponentProps, JSX } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DayPicker, type DropdownProps, getDefaultClassNames } from 'react-day-picker';
import { cn } from '../../lib/cn';
import { Button, buttonStyles } from '../basics/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../basics/Select';

/** A range of days: `from` and `to` are both optional while the user is still picking. */
export type { DateRange } from 'react-day-picker';

type DayPickerProps = ComponentProps<typeof DayPicker>;
type DayPickerComponents = NonNullable<DayPickerProps['components']>;
type RootProps = ComponentProps<NonNullable<DayPickerComponents['Root']>>;
type ChevronProps = ComponentProps<NonNullable<DayPickerComponents['Chevron']>>;
type DayButtonProps = ComponentProps<NonNullable<DayPickerComponents['DayButton']>>;

/**
 * Props for {@link Calendar}: everything `DayPicker` from react-day-picker accepts (`mode`,
 * `selected`, `onSelect`, `numberOfMonths`, `captionLayout`, `disabled`, `weekStartsOn`,
 * `showWeekNumber`, `showOutsideDays`, `locale`, `timeZone`, `footer`, `classNames`, ...), plus
 * `fromDate` and `toDate`.
 *
 * Without `mode`, `selected` and `onSelect` the calendar is display-only. With `selected` or
 * `onSelect` and no `mode`, it behaves as `mode="single"`; set `mode` explicitly in TypeScript.
 */
export type CalendarProps = DayPickerProps & {
  /** Earliest selectable and navigable date. Earlier days are disabled and earlier months hidden. */
  fromDate?: Date | undefined;
  /** Latest selectable and navigable date. Later days are disabled and later months hidden. */
  toDate?: Date | undefined;
};

/** Classes for each part of the calendar, by react-day-picker part name. */
const PART_CLASSES: Record<string, string> = {
  root: 'w-fit',
  months: 'relative flex flex-col gap-4 sm:flex-row',
  month: 'flex w-full flex-col gap-4',
  // The nav bar spans the whole caption and sits over the dropdowns, so it ignores the pointer
  // and only its two buttons take clicks.
  nav: 'pointer-events-none absolute inset-x-0 top-0 flex w-full items-center justify-between',
  button_previous: cn(
    buttonStyles({ variant: 'ghost', size: 'icon' }),
    'pointer-events-auto size-(--cell-size) p-0 select-none aria-disabled:opacity-50',
  ),
  button_next: cn(
    buttonStyles({ variant: 'ghost', size: 'icon' }),
    'pointer-events-auto size-(--cell-size) p-0 select-none aria-disabled:opacity-50',
  ),
  month_caption: 'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
  dropdowns: 'flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium',
  caption_label: 'text-sm font-medium select-none',
  table: 'w-full border-collapse',
  weekdays: 'flex',
  weekday: 'w-(--cell-size) text-[0.8rem] font-normal text-muted-foreground select-none',
  week: 'mt-2 flex',
  week_number_header: 'w-(--cell-size) select-none',
  week_number:
    'flex size-(--cell-size) items-center justify-center text-[0.8rem] text-muted-foreground select-none',
  day: 'relative flex size-(--cell-size) items-center justify-center p-0 text-center text-sm text-foreground select-none',
  range_start: 'rounded-l-md bg-accent/30 integr8:rounded-l-full',
  range_middle: 'bg-accent/30 text-accent-foreground',
  range_end: 'rounded-r-md bg-accent/30 integr8:rounded-r-full',
  today: 'rounded-md ring-1 ring-ring ring-inset integr8:rounded-full',
  outside: 'text-muted-foreground',
  disabled: 'opacity-50',
  hidden: 'invisible',
};

/** Merges react-day-picker's default class names, ours, and the caller's, per part. */
function mergeClassNames(custom: Record<string, string | undefined> = {}): Record<string, string> {
  const defaults = getDefaultClassNames() as unknown as Record<string, string | undefined>;
  const merged: Record<string, string> = {};
  for (const part of new Set([...Object.keys(PART_CLASSES), ...Object.keys(custom)])) {
    merged[part] = cn(defaults[part], PART_CLASSES[part], custom[part]);
  }
  return merged;
}

function CalendarRoot({ className, rootRef, ...props }: RootProps): JSX.Element {
  return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
}

function CalendarChevron({ className, orientation }: ChevronProps): JSX.Element {
  const classes = cn('size-4', className);
  if (orientation === 'left') return <ChevronLeftIcon aria-hidden="true" className={classes} />;
  if (orientation === 'right') return <ChevronRightIcon aria-hidden="true" className={classes} />;
  return <ChevronDownIcon aria-hidden="true" className={classes} />;
}

/** Years listed on each side of today (or of the shown year) when the year list has no limits. */
const FALLBACK_YEARS = 50;
/** Years added at one end of the year list each time the user scrolls near it. */
const EXTEND_STEP = 25;
/** How close to an end of the year list, in px, counts as "near" and loads more years. */
const EXTEND_EDGE = 120;

/** Lets the year dropdown ask the calendar for more years at one end of an unlimited list. */
const YearListContext = createContext<{
  /** Which ends are open (have no limit) and may grow. */
  open: { past: boolean; future: boolean };
  extend: (end: 'past' | 'future') => void;
} | null>(null);

/**
 * Month and year dropdowns use the ui Select instead of a native `<select>`. When the calendar
 * has no limit for the years (see {@link Calendar}), scrolling the year list near its top or
 * bottom adds more years there, so it never ends.
 */
function CalendarDropdown({
  options,
  value,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: DropdownProps): JSX.Element {
  const yearList = useContext(YearListContext);
  // Months are 0 to 11; anything above is a list of years.
  const isYears = Boolean(options?.some((option) => Number(option.value) > 11));
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  // Set while the list is growing: the scroll position to keep once the new years are in.
  const growing = useRef<{ end: 'past' | 'future'; height: number; top: number } | null>(null);

  useEffect(() => {
    if (!yearList || !isYears || !content) return;
    const viewport = content.querySelector<HTMLElement>('[data-radix-select-viewport]');
    if (!viewport) return;
    // The browser's own scroll anchoring would fight the manual scroll fix below.
    viewport.style.overflowAnchor = 'none';
    const onScroll = (): void => {
      if (growing.current) return;
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      if (yearList.open.past && scrollTop < EXTEND_EDGE) {
        growing.current = { end: 'past', height: scrollHeight, top: scrollTop };
        yearList.extend('past');
      } else if (yearList.open.future && scrollHeight - scrollTop - clientHeight < EXTEND_EDGE) {
        growing.current = { end: 'future', height: scrollHeight, top: scrollTop };
        yearList.extend('future');
      }
    };
    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      viewport.removeEventListener('scroll', onScroll);
      // The list closed while growing: do not leave the next open waiting for a re-render.
      growing.current = null;
    };
  }, [content, isYears, yearList]);

  // Years added above push the list down: scroll by the added height so the view stays put.
  const count = options?.length ?? 0;
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the list length changes
  useLayoutEffect(() => {
    const pending = growing.current;
    if (!pending) return;
    growing.current = null;
    const viewport = content?.querySelector<HTMLElement>('[data-radix-select-viewport]');
    if (viewport && pending.end === 'past') {
      viewport.scrollTop = pending.top + (viewport.scrollHeight - pending.height);
    }
  }, [count]);

  // The items exist only while the list is open: a closed list of hundreds of years would
  // otherwise re-render with every change of the calendar. The trigger shows the label itself.
  const [open, setOpen] = useState(false);
  const selectedLabel = options?.find((option) => String(option.value) === String(value))?.label;

  return (
    <Select
      value={value === undefined ? undefined : String(value)}
      open={open}
      onOpenChange={setOpen}
      {...(disabled === undefined ? {} : { disabled })}
      onValueChange={(next) =>
        onChange?.({ target: { value: next } } as unknown as ChangeEvent<HTMLSelectElement>)
      }
    >
      <SelectTrigger size="sm" aria-label={ariaLabel}>
        <SelectValue>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent ref={setContent}>
        {open
          ? options?.map((option) => (
              <SelectItem
                key={option.value}
                value={String(option.value)}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))
          : null}
      </SelectContent>
    </Select>
  );
}

/** `2026-11-06` for a local date. Same on server and client, unlike `toLocaleDateString`. */
function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function CalendarDayButton({ className, day, modifiers, ...props }: DayButtonProps): JSX.Element {
  const ref = useRef<HTMLButtonElement>(null);
  // react-day-picker marks the day that should have focus; move the real focus there.
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const rangeStart = Boolean(modifiers.range_start);
  const rangeEnd = Boolean(modifiers.range_end);
  const rangeMiddle = Boolean(modifiers.range_middle);
  const selectedSingle = Boolean(modifiers.selected) && !rangeStart && !rangeEnd && !rangeMiddle;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={dayKey(day.date)}
      data-selected-single={selectedSingle}
      data-range-start={rangeStart}
      data-range-end={rangeEnd}
      data-range-middle={rangeMiddle}
      className={cn(
        'size-(--cell-size) p-0 leading-none font-normal',
        // Selected days use the primary color; in Integr8 they are round pills.
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground',
        'data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground',
        'data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground',
        'integr8:data-[selected-single=true]:rounded-full integr8:data-[range-start=true]:rounded-full integr8:data-[range-end=true]:rounded-full',
        // The days between the ends are a flat strip.
        'data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-transparent data-[range-middle=true]:text-accent-foreground',
        className,
      )}
      {...props}
    />
  );
}

/** First day of the month of `date`. */
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * A month grid built on react-day-picker, styled with the theme tokens. Modes: single, multiple
 * and range. Without a selection it is display-only, with today outlined.
 *
 * `captionLayout="dropdown"` shows month and year selects (the ui Select). Set `startMonth` and
 * `endMonth` (or `fromDate` and `toDate`) to limit the years. An end without a limit is open: the
 * list starts 50 years before and after today (or the shown year) and loads 25 more years at that
 * end each time the user scrolls near it, so it never runs out.
 *
 * @example
 * ```tsx
 * <Calendar />
 * <Calendar mode="single" selected={date} onSelect={setDate} />
 * <Calendar mode="range" numberOfMonths={2} selected={range} onSelect={setRange} />
 * ```
 */
export function Calendar({
  className,
  classNames,
  components,
  showOutsideDays = true,
  captionLayout = 'label',
  fromDate,
  toDate,
  disabled,
  startMonth,
  endMonth,
  mode,
  ...props
}: CalendarProps): JSX.Element {
  const { selected, onSelect, month, defaultMonth, onMonthChange } = props as {
    selected?: unknown;
    onSelect?: unknown;
    month?: Date;
    defaultMonth?: Date;
    onMonthChange?: (month: Date) => void;
  };
  // No mode and nothing to select: display-only. A selection without a mode means single.
  const effectiveMode =
    mode ?? (selected !== undefined || onSelect !== undefined ? 'single' : undefined);

  // Dates are compared by time value: an inline `new Date(...)` from the caller is a new object
  // on every render, and the objects handed to react-day-picker below must stay the same.
  const fromTime = fromDate?.getTime();
  const toTime = toDate?.getTime();
  const disabledMatchers = useMemo(
    () => [
      ...(disabled === undefined ? [] : Array.isArray(disabled) ? disabled : [disabled]),
      ...(fromTime === undefined ? [] : [{ before: new Date(fromTime) }]),
      ...(toTime === undefined ? [] : [{ after: new Date(toTime) }]),
    ],
    [disabled, fromTime, toTime],
  );

  // `fromDate` and `toDate` also limit navigation, through the first and last visible month.
  const firstMonth =
    startMonth ?? (fromTime === undefined ? undefined : startOfMonth(new Date(fromTime)));
  const lastMonth = endMonth ?? (toTime === undefined ? undefined : startOfMonth(new Date(toTime)));
  const firstMonthTime = firstMonth?.getTime();
  const lastMonthTime = lastMonth?.getTime();

  // With year dropdowns, an end without a limit is open: it starts at FALLBACK_YEARS from the
  // years in play and grows when the year list is scrolled (or the month nears the end).
  const yearDropdown = captionLayout === 'dropdown' || captionLayout === 'dropdown-years';
  const opensPast = yearDropdown && firstMonth === undefined;
  const opensFuture = yearDropdown && lastMonth === undefined;
  const [years, setYears] = useState(() => {
    const inPlay = [
      new Date().getFullYear(),
      month?.getFullYear(),
      defaultMonth?.getFullYear(),
      selected instanceof Date ? selected.getFullYear() : undefined,
    ].filter((year): year is number => year !== undefined);
    return {
      first: Math.min(...inPlay) - FALLBACK_YEARS,
      last: Math.max(...inPlay) + FALLBACK_YEARS,
    };
  });
  // A controlled month outside the list pulls the list along.
  const shownYear = month?.getFullYear();
  const firstYear = Math.min(years.first, (shownYear ?? years.first) - 1);
  const lastYear = Math.max(years.last, (shownYear ?? years.last) + 1);

  const yearList = useMemo(
    () => ({
      open: { past: opensPast, future: opensFuture },
      extend: (end: 'past' | 'future'): void =>
        setYears((current) => {
          if (end === 'past') {
            return opensPast ? { ...current, first: current.first - EXTEND_STEP } : current;
          }
          return opensFuture ? { ...current, last: current.last + EXTEND_STEP } : current;
        }),
    }),
    [opensPast, opensFuture],
  );

  const handleMonthChange = (next: Date): void => {
    const year = next.getFullYear();
    setYears((current) => {
      const first =
        opensPast && year - current.first <= 1 ? current.first - EXTEND_STEP : current.first;
      const last =
        opensFuture && current.last - year <= 1 ? current.last + EXTEND_STEP : current.last;
      // Same list: return the same object so React skips the render.
      return first === current.first && last === current.last ? current : { first, last };
    });
    onMonthChange?.(next);
  };

  const startBound = useMemo(
    () =>
      firstMonthTime !== undefined
        ? new Date(firstMonthTime)
        : opensPast
          ? new Date(firstYear, 0)
          : undefined,
    [firstMonthTime, opensPast, firstYear],
  );
  const endBound = useMemo(
    () =>
      lastMonthTime !== undefined
        ? new Date(lastMonthTime)
        : opensFuture
          ? new Date(lastYear, 11)
          : undefined,
    [lastMonthTime, opensFuture, lastYear],
  );
  const mergedClassNames = useMemo(
    () => mergeClassNames(classNames as Record<string, string | undefined> | undefined),
    [classNames],
  );

  const pickerProps = {
    ...props,
    mode: effectiveMode,
    showOutsideDays,
    captionLayout,
    onMonthChange: handleMonthChange,
    className: cn('group/calendar p-3 text-foreground [--cell-size:--spacing(8)]', className),
    classNames: mergedClassNames,
    components: {
      Root: CalendarRoot,
      Chevron: CalendarChevron,
      Dropdown: CalendarDropdown,
      DayButton: CalendarDayButton,
      ...components,
    },
    ...(disabledMatchers.length > 0 ? { disabled: disabledMatchers } : {}),
    ...(startBound ? { startMonth: startBound } : {}),
    ...(endBound ? { endMonth: endBound } : {}),
  } as DayPickerProps;

  return (
    <YearListContext.Provider value={yearDropdown ? yearList : null}>
      <DayPicker {...pickerProps} />
    </YearListContext.Provider>
  );
}
