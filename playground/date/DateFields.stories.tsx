import type { Story } from '@ladle/react';
import { z } from 'zod';
import {
  DateField,
  DateRangeField,
  DateTimeField,
  DateTimeRangeField,
  rangePresets,
  TimeField,
  TimePickerField,
  useZodForm,
} from '../../src';
import { DemoForm } from '../form/DemoForm';

const range = z.object({ from: z.date(), to: z.date() });
const time = z.object({ hours: z.number(), minutes: z.number(), seconds: z.number().optional() });

const schema = z.object({
  due: z.date('Pick a due date'),
  stay: range.optional(),
  meeting: z.date('Pick a time for the meeting'),
  meetingWithPicker: z.date().optional(),
  shift: range.optional(),
  start: time.optional(),
  breakStart: time.optional(),
  breakEnd: time.optional(),
});

/** All the date and time fields in one form, including both time fields. */
export const AllFields: Story = () => {
  const form = useZodForm(schema);
  return (
    <div className="max-w-2xl">
      <DemoForm form={form}>
        <DateField name="due" label="Due date" />
        <DateRangeField name="stay" label="Stay" presets={rangePresets} />
        <DateTimeField name="meeting" label="Meeting" />
        <DateTimeField
          name="meetingWithPicker"
          label="Meeting (time picker)"
          hourCycle={12}
          minuteStep={5}
          timePicker
          clearable
        />
        <DateTimeRangeField name="shift" label="Shift" />
        <TimeField name="start" label="Start time (type only)" />
        <TimePickerField
          name="breakStart"
          label="Break start (12-hour picker)"
          hourCycle={12}
          minuteStep={15}
          clearable
        />
        <TimePickerField
          name="breakEnd"
          label="Break end (24-hour picker with seconds)"
          hourCycle={24}
          showSeconds
          clearable
        />
      </DemoForm>
    </div>
  );
};
