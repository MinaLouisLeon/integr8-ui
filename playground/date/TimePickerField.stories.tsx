import type { Story } from '@ladle/react';
import { z } from 'zod';
import { TimePickerField, useZodForm } from '../../src';
import { DemoForm } from '../form/DemoForm';

const timeShape = { hours: z.number(), minutes: z.number(), seconds: z.number().optional() };

const schema = z.object({
  start: z.object(timeShape, 'Pick a start time'),
  end: z.object(timeShape).optional(),
});

/** Stores `{ hours, minutes }` (or `undefined` when empty). Submit empty to see the message. */
export const Default: Story = () => {
  const form = useZodForm(schema);
  return (
    <DemoForm form={form}>
      <TimePickerField name="start" label="Start" hourCycle={24} minuteStep={15} />
      <TimePickerField name="end" label="End" hourCycle={24} description="Optional." clearable />
    </DemoForm>
  );
};

/** 12-hour clock with a default value. */
export const TwelveHour: Story = () => {
  const form = useZodForm(schema, { defaultValues: { start: { hours: 15, minutes: 30 } } });
  return (
    <DemoForm form={form}>
      <TimePickerField name="start" label="Start" hourCycle={12} />
    </DemoForm>
  );
};

/** Disabled with a default value. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, { defaultValues: { start: { hours: 9, minutes: 0 } } });
  return (
    <DemoForm form={form}>
      <TimePickerField name="start" label="Start" hourCycle={24} disabled />
    </DemoForm>
  );
};
