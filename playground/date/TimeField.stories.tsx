import type { Story } from '@ladle/react';
import { z } from 'zod';
import { TimeField, useZodForm } from '../../src';
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
      <TimeField name="start" label="Start" hourCycle={24} minuteStep={5} />
      <TimeField name="end" label="End" hourCycle={24} description="Optional." />
    </DemoForm>
  );
};

/** 12-hour clock with seconds and a default value. */
export const TwelveHourWithSeconds: Story = () => {
  const form = useZodForm(schema, {
    defaultValues: { start: { hours: 15, minutes: 30, seconds: 0 } },
  });
  return (
    <DemoForm form={form}>
      <TimeField name="start" label="Start" hourCycle={12} showSeconds />
    </DemoForm>
  );
};

/** Disabled with a default value. */
export const Disabled: Story = () => {
  const form = useZodForm(schema, { defaultValues: { start: { hours: 9, minutes: 0 } } });
  return (
    <DemoForm form={form}>
      <TimeField name="start" label="Start" hourCycle={24} disabled />
    </DemoForm>
  );
};
