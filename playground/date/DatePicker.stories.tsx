import type { Story } from '@ladle/react';
import { de } from 'date-fns/locale';
import { useState } from 'react';
import { DatePicker, Label } from '../../src';

/** Type a date (`11/06/2026` or `2026-11-06`) or pick one. Esc restores the last valid text. */
export const Typing: Story = () => {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <div className="grid w-72 gap-2">
      <Label htmlFor="due">Due date</Label>
      <DatePicker id="due" value={date ?? null} onChange={setDate} clearable />
      <p className="text-sm text-muted-foreground">{date ? date.toDateString() : 'No date'}</p>
    </div>
  );
};

/** `allowTyping={false}`: a plain button that opens the calendar. */
export const ButtonOnly: Story = () => {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <div className="w-72">
      <DatePicker allowTyping={false} value={date ?? null} onChange={setDate} clearable />
    </div>
  );
};

/** Weekends are disabled and only this month and the next can be picked. */
export const DisabledDaysAndLimits: Story = () => {
  const [date, setDate] = useState<Date | undefined>();
  const today = new Date();
  return (
    <div className="w-72">
      <DatePicker
        value={date ?? null}
        onChange={setDate}
        disabledDays={{ dayOfWeek: [0, 6] }}
        fromDate={new Date(today.getFullYear(), today.getMonth(), 1)}
        toDate={new Date(today.getFullYear(), today.getMonth() + 2, 0)}
      />
    </div>
  );
};

/** Month and year selects, with the year list growing as you scroll. */
export const DropdownCaption: Story = () => {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <div className="w-72">
      <DatePicker captionLayout="dropdown" value={date ?? null} onChange={setDate} />
    </div>
  );
};

/** German locale: `06.11.2026`, weeks start on Monday. */
export const OtherLocale: Story = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <div className="w-72">
      <DatePicker locale={de} value={date ?? null} onChange={setDate} />
    </div>
  );
};

/** A custom display format. Typed text is read with this format first, then ISO. */
export const CustomFormat: Story = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <div className="w-72">
      <DatePicker format="dd MMM yyyy" value={date ?? null} onChange={setDate} />
    </div>
  );
};

/** Invalid text shows the destructive border; the callback says why. */
export const InvalidFeedback: Story = () => {
  const [date, setDate] = useState<Date | undefined>();
  const [message, setMessage] = useState('');
  return (
    <div className="grid w-72 gap-2">
      <DatePicker
        value={date ?? null}
        onChange={setDate}
        disabledDays={{ dayOfWeek: [0, 6] }}
        onInvalidInput={(text, reason) => setMessage(`"${text}" → ${reason}`)}
      />
      <p className="text-sm text-muted-foreground">{message || 'Try "soon" or a weekend date.'}</p>
    </div>
  );
};

/** Disabled. */
export const Disabled: Story = () => (
  <div className="w-72">
    <DatePicker disabled value={new Date()} />
  </div>
);
