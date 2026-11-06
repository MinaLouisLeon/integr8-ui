# @integr8-media/ui — Calendar spec

Date and time components for the ui library: a calendar, a time input, date, date range, date-time and date-time range pickers that accept typed input, and form-kit fields. They are built first in ui, then reused by `@integr8-media/window-manager` (the taskbar clock's calendar popover) through the registry. This spec is added to `docs/SPEC.md` as its own section; its Progress rows go into the Progress table.

## Facts

| Item | Value |
|---|---|
| Lives in | integr8-ui repo, `src/components/date/` (component files) and one registry item per component |
| Release | Next ui minor release (npm + registry); carried over unchanged when ui moves to registry only |
| Built on | react-day-picker (the base of the shadcn calendar), date-fns for formatting, parsing and locales |
| Reuses | Button, Popover, Select, Input, Label, Form kit, Kbd from ui; no duplicated primitives |
| Consumers | Any app; `@integr8-media/window-manager` installs `calendar` with `npx shadcn add` for its clock popover |

**New dependencies (Claude Code asks before adding each one; you approve or deny):**

| Package | Why | License | Notes |
|---|---|---|---|
| react-day-picker | Calendar grid, selection modes, keyboard navigation and ARIA | MIT | `^9` (the major the shadcn calendar is built on). Move to 10.x only when shadcn does |
| date-fns | Formatting, parsing typed dates, locales, date math for presets | MIT | Already a dependency of react-day-picker; added directly because ui code imports it |

No other dependency: the time input is built on ui's own Input.

## Components

| Component | Registry item | What it is |
|---|---|---|
| `Calendar` | `calendar` (registry:ui) | Month grid. Modes: single, multiple, range. Options below |
| `TimeInput` | `time-input` (registry:ui) | Segmented time field: hours, minutes, optional seconds, AM/PM when 12-hour |
| `DatePicker` | `date-picker` (registry:ui) | Typed date input plus a calendar button that opens a Popover with a Calendar |
| `DateRangePicker` | `date-range-picker` (registry:ui) | Two typed inputs (from, to) plus a popover with two months and optional presets |
| `DateTimePicker` | `date-time-picker` (registry:ui) | Typed date-time input plus a popover with a Calendar and a TimeInput |
| `DateTimeRangePicker` | `date-time-range-picker` (registry:ui) | Two typed date-time inputs (from, to) plus a popover with two months, a TimeInput for each end and optional presets |
| `DateField` | `date-field` (registry:ui) | Form-kit field wrapping DatePicker (label, description, message, react-hook-form) |
| `DateRangeField` | `date-range-field` (registry:ui) | Form-kit field wrapping DateRangePicker |
| `DateTimeField` | `date-time-field` (registry:ui) | Form-kit field wrapping DateTimePicker |
| `DateTimeRangeField` | `date-time-range-field` (registry:ui) | Form-kit field wrapping DateTimeRangePicker |
| `TimeField` | `time-field` (registry:ui) | Form-kit field wrapping TimeInput |

Registry dependencies: `time-input` → input; `date-picker` → calendar, button, popover, input; `date-range-picker` → calendar, button, popover, input; `date-time-picker` → calendar, time-input, button, popover, input; `date-time-range-picker` → calendar, time-input, button, popover, input; each field → its picker or input plus `form`.

### Calendar props (on top of react-day-picker's own)

```ts
export interface CalendarProps {
  mode?: 'single' | 'multiple' | 'range';        // default 'single'
  selected?: Date | Date[] | DateRange;
  onSelect?: (value: Date | Date[] | DateRange | undefined) => void;
  numberOfMonths?: number;                       // default 1
  captionLayout?: 'label' | 'dropdown';          // dropdown = month and year selects (ui Select)
  fromDate?: Date;                               // earliest selectable / navigable date
  toDate?: Date;
  disabled?: Matcher | Matcher[];                // dates, ranges, weekdays, functions
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;      // default from locale
  showWeekNumber?: boolean;
  showOutsideDays?: boolean;                     // default true
  locale?: Locale;                               // date-fns locale, default en-US
  timeZone?: string;                             // optional IANA zone (react-day-picker tz support)
  footer?: React.ReactNode;                      // e.g. "Today" button
  className?: string;
  classNames?: Partial<ClassNames>;              // per-part overrides, merged with cn()
}
```

- Without `selected`/`onSelect` the calendar is display-only with today highlighted (what the window-manager clock uses).
- **Year list in `captionLayout="dropdown"`:** `fromDate`/`toDate` (or `startMonth`/`endMonth`) limit the years. An end without a limit is open: the list starts 50 years before and after today (or the shown year) and loads 25 more years at that end each time the user scrolls near it, so it never runs out. An end with a limit never grows.

### TimeInput props

```ts
export interface TimeInputProps {
  value?: Time | null;                           // { hours: number; minutes: number; seconds?: number }
  onChange?: (value: Time | null) => void;
  hourCycle?: 12 | 24;                           // default from locale
  showSeconds?: boolean;                         // default false
  minuteStep?: number;                           // default 1; arrows jump by this step
  min?: Time;
  max?: Time;
  disabled?: boolean;
  className?: string;
}
```

- Each segment is focusable: type digits (focus moves to the next segment when full), ArrowUp/ArrowDown change the value, Backspace clears, Left/Right move between segments, `a`/`p` set AM/PM.
- Exported helpers: `toTime(date)`, `withTime(date, time)` (plain functions, unit-tested).

### Typed input (all pickers)

Typing is on by default in DatePicker, DateRangePicker, DateTimePicker and DateTimeRangePicker (`allowTyping`, default `true`; `false` shows a plain button trigger like the shadcn date picker).

- **Parsing:** on blur or Enter the text is parsed with date-fns `parse` against `format` (the display pattern) and then a list of fallback patterns (`parseFormats`, default: ISO `yyyy-MM-dd` and `yyyy-MM-dd HH:mm`). Exported as `parseDateInput(text, options)` (plain function, unit-tested).
- **Valid text:** the value updates, the text is re-formatted with `format`, and the calendar (if open) jumps to that month.
- **Invalid or disabled date:** the value does not change, the input gets `aria-invalid` and the destructive border, and an `onInvalidInput(text, reason)` callback fires (`'unparseable' | 'disabled' | 'out-of-range'`); Esc restores the last valid text. In a form field the message comes from the field.
- **Display patterns:** dates default to `P` (locale numeric short date, for example `11/06/2026` in en-US) and date-times to `P p` (for example `11/06/2026, 3:30 PM`). The day/month order follows the locale.
- **Range:** two inputs (from, to); a "to" earlier than "from" is invalid (`'out-of-range'`).
- **Date-time:** one input holding date and time (default pattern `P p`); the popover edits the same value.
- **Date-time range:** two date-time inputs (from, to), each with pattern `P p`; a "to" earlier than "from" (comparing date and time) is invalid (`'out-of-range'`).
- **Keyboard:** Alt+ArrowDown (or the calendar button) opens the popover; ArrowUp/ArrowDown on a valid date move by one day (Shift: one month); the placeholder shows the expected format (for example `MM/DD/YYYY`).

### Picker props

- `DatePicker`: `value`, `onChange`, `placeholder`, `format` (date-fns pattern, default `P`), `parseFormats`, `allowTyping`, `onInvalidInput`, `clearable`, `disabled`, `align` for the popover, and all Calendar options passed through.
- `DateRangePicker`: the same for a `DateRange`, plus `presets?: { label: string; range: () => DateRange }[]` (built-ins exported: today, last 7 days, last 30 days, this month, last month), `numberOfMonths` default 2.
- `DateTimePicker`: the DatePicker props (default `format` `P p`) plus `hourCycle`, `showSeconds`, `minuteStep`, `defaultTime` (time used when only a date is picked, default 00:00), `min` and `max` as full date-times; a "Now" button in the popover footer.
- `DateTimeRangePicker`: the DateRangePicker props for a `DateRange` whose `from` and `to` carry times (default `format` `P p`, `numberOfMonths` default 2, `presets`), plus `hourCycle`, `showSeconds`, `minuteStep`, `defaultFromTime` (default 00:00) and `defaultToTime` (default 23:59, or 23:59:59 with `showSeconds`) used when only dates are picked, and `min` and `max` as full date-times. The popover shows the two months with a TimeInput for "from" and one for "to" below them.

## Styling

- Only theme tokens: day cells use `foreground`; outside days `muted-foreground`; today has a `ring` outline; selected day `primary` / `primary-foreground`; range middle `accent` at low opacity with `accent-foreground`; disabled days lower opacity; focus ring from `ring`; invalid input uses `destructive`.
- Works in light, dark, integr8 and integr8-light. In integr8, selected days are lime pills (round), matching the brand's pill buttons; in light/dark they use the normal radius.
- Time segments use `font-mono` tabular numbers; the focused segment uses `accent`.
- Navigation buttons are ui `Button` (ghost, icon size) with lucide-react chevrons and a calendar icon on the picker input; month/year dropdowns are ui `Select`.
- Animations (month change, popover) respect `prefers-reduced-motion`.

## Accessibility

- Calendar keyboard from react-day-picker: arrows move by day, PageUp/PageDown by month, Shift+PageUp/PageDown by year, Home/End to week start/end, Enter/Space selects.
- Grid roles and labels, `aria-selected`, `aria-disabled`, localized day and month names.
- Typed inputs: labelled, `aria-invalid` with the error message linked by `aria-describedby`, format hint read by screen readers.
- TimeInput segments use `role="spinbutton"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and a label per segment.
- The pickers return focus to the input when the popover closes; Esc closes.

## Folder layout

```
src/components/date/
  Calendar.tsx
  TimeInput.tsx
  DatePicker.tsx
  DateRangePicker.tsx
  DateTimePicker.tsx
  DateTimeRangePicker.tsx
  DateField.tsx
  DateRangeField.tsx
  DateTimeField.tsx
  DateTimeRangeField.tsx
  TimeField.tsx
  parseDateInput.ts        typed-input parsing (plain function, unit-tested)
  time.ts                  Time type, toTime, withTime (plain functions, unit-tested)
  rangePresets.ts          built-in presets (plain functions, unit-tested)
  index.ts                 re-exported from src/index.ts
playground/date/           stories
```

## Example

```tsx
import {
  Calendar, DatePicker, DateRangePicker, DateTimePicker, DateTimeRangePicker, TimeInput,
  rangePresets,
} from '@integr8-media/ui';

<Calendar />                                                    // display-only, today highlighted
<DatePicker value={due} onChange={setDue} clearable />          // type "11/06/2026" or pick
<DateRangePicker value={range} onChange={setRange} presets={rangePresets} />
<DateTimePicker value={meeting} onChange={setMeeting} minuteStep={15} />
<DateTimeRangePicker value={shift} onChange={setShift} minuteStep={15} />
<TimeInput value={time} onChange={setTime} hourCycle={24} />
```

With the registry: `npx shadcn add @integr8-media/calendar` (or `time-input`, `date-picker`, `date-range-picker`, `date-time-picker`, `date-time-range-picker`, `date-field`, `date-range-field`, `date-time-field`, `date-time-range-field`, `time-field`).

## Non-goals

- No event calendar (week/day views, events); these are pickers
- No natural-language input ("next Friday")
- No RTL in v1 (same as the rest of ui)

## Tests and playground

- Unit tests (Vitest, jsdom):
  - `parseDateInput`: display format, every fallback pattern, locales, invalid text, disabled and out-of-range dates.
  - `time.ts` and `rangePresets`.
  - TimeInput: typing digits and auto-advance, arrows with `minuteStep`, 12/24-hour, AM/PM keys, min/max.
  - DatePicker: typed valid and invalid input, Esc restore, Enter commit, re-format on blur, clear, disabled/fromDate/toDate, Alt+ArrowDown opens.
  - DateRangePicker: typed from/to, to-before-from invalid, presets.
  - DateTimePicker: typed date-time, date only uses `defaultTime`, "Now", min/max.
  - DateTimeRangePicker: typed from/to date-times, to-before-from invalid (including same day with an earlier time), dates only use `defaultFromTime`/`defaultToTime`, presets, min/max.
  - Fields validate with zod through useZodForm.
  - Keyboard navigation smoke test; focus returns to the input.
- Ladle stories: Calendar (single, multiple, range, dropdown caption, two months, week numbers, disabled days, another locale, display-only), TimeInput (12/24-hour, seconds, step), DatePicker (typing on and off), DateRangePicker with presets, DateTimePicker, DateTimeRangePicker, and all five fields in a form; every story in light, dark, integr8 and integr8-light.
- Registry items generated and installable with `npx shadcn add`.
- size-limit: budgets for `import { DatePicker }`, `import { DateTimePicker }` and `import { DateTimeRangePicker }` (initial guess: at most 25 kB, 28 kB and 29 kB gzip including react-day-picker).

## Done when

- [ ] Calendar, TimeInput, DatePicker, DateRangePicker, DateTimePicker, DateTimeRangePicker, DateField, DateRangeField, DateTimeField, DateTimeRangeField and TimeField exist, exported from `src/index.ts`, with stories
- [ ] All modes and options above work; display-only Calendar works
- [ ] Typing works in every picker: valid input updates the value, invalid input is flagged and never changes it
- [ ] Styled only through tokens; correct in all four themes
- [ ] Keyboard and screen-reader behavior as above
- [ ] Registry items for all eleven, with dependencies and registryDependencies
- [ ] Tests written; budgets set; README section added
- [ ] Ready for the window-manager clock: `npx shadcn add @integr8-media/calendar` works in a fixture app

## Progress

The work is split into five milestones. Each is its own `feature/*` branch from `dev` and its own pull request into `dev`, and must pass CI on its own (80% coverage floor, publint, attw, size-limit). Each milestone includes its own tests, stories and registry items; size budgets are added by the milestone that introduces the component.

| # | Milestone | Contents | Depends on | Branch | Status |
|---|---|---|---|---|---|
| 1 | Calendar base | Dependencies approved (react-day-picker `^9`, date-fns); `Calendar` (all modes, display-only); `calendar` registry item. Unblocks the window-manager clock | none | `feature/calendar` | Done (merged, PR #21) |
| 2 | Time input | `time.ts` (`toTime`, `withTime`); `TimeInput`; `TimeField` | none (can run alongside 1) | `feature/time-input` | Done (merged, PR #22) |
| 3 | Date picker | `parseDateInput` and typed-input behavior; `DatePicker`; `DateField`; `DatePicker` size budget | 1 | `feature/date-picker` | In progress (code written on `feature/date-time-pickers`, developer checks pending) |
| 4 | Date range picker | `rangePresets`; `DateRangePicker`; `DateRangeField` | 3 | `feature/date-range-picker` | In progress (code written on `feature/date-time-pickers`, developer checks pending) |
| 5 | Date-time pickers | `DateTimePicker`, `DateTimeRangePicker`; `DateTimeField`, `DateTimeRangeField`; remaining size budgets; README section; fixture-app check (`npx shadcn add @integr8-media/calendar`) | 2, 3, 4 | `feature/date-time-pickers` | In progress (code written, developer checks pending; fixture-app check not done) |

- Milestone 3 sets the typed-input pattern (parse, invalid state, Esc restore, `aria-invalid`) that milestones 4 and 5 reuse.
- If milestone 5 is too large to review, split it into `DateTimePicker` + `DateTimeField`, then `DateTimeRangePicker` + `DateTimeRangeField`.

## Decisions (locked 2026-11-06)

- Date-time range picker: in v1, as `DateTimeRangePicker` and `DateTimeRangeField`.
- Default display patterns: numeric locale `P` for dates and `P p` for date-times (for example `11/06/2026, 3:30 PM`); ISO is accepted as a typed fallback.
- react-day-picker: `^9`, matching the shadcn calendar.
